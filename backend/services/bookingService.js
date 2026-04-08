const TimeSlot = require("../models/TimeSlot");
const Booking = require("../models/Booking");
const BOOKING_STATUS = require("../constants/bookingStatus");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");

const reserveSlot = async ({
  slotId,
  user,
  payload,
  session: externalSession = null,
}) => {
  const ownSession = !externalSession;
  const session = externalSession || (await mongoose.startSession());
  let booking = null;

  try {
    if (ownSession) {
      session.startTransaction();
    }

    if (
      !payload?.imeRoditelja ||
      !payload?.prezimeRoditelja ||
      !payload?.emailRoditelja ||
      !payload?.telefonRoditelja
    ) {
      throw new ErrorResponse("Nedostaju podaci za rezervaciju", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      throw new ErrorResponse("Nevalidan slot ID", 400);
    }

    const slot = await TimeSlot.findOneAndUpdate(
      {
        _id: slotId,
        zauzeto: false,
        aktivno: true,
        vanRadnogVremena: false,
      },
      {
        $set: {
          zauzeto: true,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!slot) {
      throw new ErrorResponse("Termin je već zauzet ili ne postoji", 400);
    }

    const slotEnd = new Date(slot.datum);
    const [endHour, endMinute] = String(slot.vremeDo || "00:00")
      .split(":")
      .map((v) => parseInt(v, 10));

    slotEnd.setHours(endHour || 0, endMinute || 0, 0, 0);

    if (slotEnd <= new Date()) {
      throw new ErrorResponse("Ne možeš rezervisati prošli termin", 400);
    }

    const ukupnaCena = Number(slot.cena) || 0;

    const created = await Booking.create(
      [
        {
          roditeljId: user?._id || null,
          playroomId: slot.playroomId,
          timeSlotId: slot._id,
          datum: slot.datum,
          vremeOd: slot.vremeOd,
          vremeDo: slot.vremeDo,
          ukupnaCena,
          status: BOOKING_STATUS.CEKANJE,
          napomena: payload.napomena || "",
          imeRoditelja: payload.imeRoditelja.trim(),
          prezimeRoditelja: payload.prezimeRoditelja.trim(),
          emailRoditelja: payload.emailRoditelja.trim().toLowerCase(),
          telefonRoditelja: payload.telefonRoditelja.trim(),
        },
      ],
      { session },
    );

    booking = created[0];

    if (ownSession) {
      await session.commitTransaction();
    }

    return booking;
  } catch (err) {
    if (ownSession) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (ownSession) {
      session.endSession();
    }
  }
};

const {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingConfirmationToOwner,
} = require("../utils/emailService");

// 🔥 CENTRALIZOVANO SLANJE EMAILOVA
const handleBookingEmails = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("playroomId", "naziv adresa grad vlasnikId")
      .populate("roditeljId", "ime prezime email telefon")
      .populate("timeSlotId");

    if (!booking) return;

    const userForEmail = booking.roditeljId || {
      ime: booking.imeRoditelja,
      prezime: booking.prezimeRoditelja,
      email: booking.emailRoditelja,
      telefon: booking.telefonRoditelja,
    };

    const playroom = booking.playroomId;

    const timeSlot = {
      datum: booking.datum,
      vremeOd: booking.vremeOd,
      vremeDo: booking.vremeDo,
    };

    if (userForEmail.email) {
      await sendBookingConfirmation(booking, userForEmail, playroom, timeSlot);
    }

    if (playroom?.vlasnikId) {
      await sendBookingConfirmationToOwner(booking, playroom, timeSlot);
    }
  } catch (err) {
    console.error("EMAIL ERROR:", err.message);
  }
};

const createBookingWithEmails = async (data) => {
  const booking = await reserveSlot(data);

  setImmediate(async () => {
    try {
      await handleBookingEmails(booking._id);
    } catch (error) {
      console.error("Greška pri slanju booking emailova:", error.message);
    }
  });

  return booking;
};

const sendCancellationEmail = async (booking) => {
  try {
    const userForEmail = booking.roditeljId || {
      ime: booking.imeRoditelja,
      prezime: booking.prezimeRoditelja,
      email: booking.emailRoditelja,
    };

    const playroom = booking.playroomId;

    const slot = {
      datum: booking.datum,
      vremeOd: booking.vremeOd,
      vremeDo: booking.vremeDo,
    };

    if (userForEmail.email) {
      await sendBookingCancellation(userForEmail, playroom, slot);
    }
  } catch (error) {
    console.error("Greška pri slanju emaila (cancel):", error.message);
  }
};

const sendConfirmationEmail = async (booking) => {
  try {
    const userForEmail = booking.roditeljId || {
      ime: booking.imeRoditelja,
      prezime: booking.prezimeRoditelja,
      email: booking.emailRoditelja,
    };

    const playroom = booking.playroomId;

    const slot = {
      datum: booking.datum,
      vremeOd: booking.vremeOd,
      vremeDo: booking.vremeDo,
    };

    if (userForEmail.email) {
      await sendBookingConfirmation(booking, userForEmail, playroom, slot);
    }
  } catch (error) {
    console.error("Greška pri slanju emaila (confirm):", error.message);
  }
};

const lockSlot = async (slotId) => {
  return TimeSlot.findOneAndUpdate(
    {
      _id: slotId,
      zauzeto: false,

      aktivno: true,
      vanRadnogVremena: false,
    },
    {
      $set: {
        zauzeto: true,
      },
    },
    { new: true },
  );
};

const unlockSlot = async (slotId, session = null) => {
  if (!slotId || !mongoose.Types.ObjectId.isValid(slotId)) {
    throw new ErrorResponse("Nevalidan slot ID za otključavanje", 400);
  }

  const options = { new: true };
  if (session) {
    options.session = session;
  }

  return TimeSlot.findByIdAndUpdate(
    slotId,
    {
      $set: {
        zauzeto: false,
      },
    },
    options,
  );
};

module.exports = {
  reserveSlot,
  createBookingWithEmails,
  sendCancellationEmail,
  sendConfirmationEmail,
  lockSlot,
  unlockSlot,
};
