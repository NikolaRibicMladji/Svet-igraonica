const Booking = require("../models/Booking");
const TimeSlot = require("../models/TimeSlot");
const Playroom = require("../models/Playroom");
const bookingService = require("../services/bookingService");
const User = require("../models/User");
const authService = require("../services/authService");
const mongoose = require("mongoose");

const BOOKING_STATUS = require("../constants/bookingStatus");

// @desc    Kreiraj novu rezervaciju (ulogovan korisnik)
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBookingWithEmails({
      slotId: req.body.slotId,
      user: req.user || null,
      payload: {
        imeRoditelja: req.body.imeRoditelja || req.body.ime || "",
        prezimeRoditelja: req.body.prezimeRoditelja || req.body.prezime || "",
        emailRoditelja: req.body.emailRoditelja || req.body.email || "",
        telefonRoditelja: req.body.telefonRoditelja || req.body.telefon || "",
        napomena: req.body.napomena || "",
      },
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: "Rezervacija uspešno kreirana",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Guest rezervacija + registracija + auto login
// @route   POST /api/bookings/guest
// @access  Public
// @desc    Guest rezervacija + registracija + auto login
// @route   POST /api/bookings/guest
// @access  Public
// @desc    Guest rezervacija + registracija + auto login
// @route   POST /api/bookings/guest
// @access  Public
exports.createGuestBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { slotId, ime, prezime, email, telefon, password, napomena } =
      req.body;

    const authResult = await authService.registerGuestParent(
      {
        ime,
        prezime,
        email,
        password,
        telefon,
      },
      session,
    );

    const createdUser = authResult.user;
    const accessToken = authResult.accessToken;
    const refreshToken = authResult.refreshToken;

    const createdBooking = await bookingService.reserveSlot({
      slotId,
      user: createdUser,
      payload: {
        imeRoditelja: createdUser.ime,
        prezimeRoditelja: createdUser.prezime,
        emailRoditelja: createdUser.email,
        telefonRoditelja: createdUser.telefon,
        napomena: napomena || "",
      },
      session,
    });

    await session.commitTransaction();

    res.cookie("refreshToken", refreshToken, authService.cookieOptions);

    setImmediate(async () => {
      try {
        await bookingService.sendConfirmationEmail({
          ...createdBooking.toObject(),
          roditeljId: createdUser,
        });
      } catch (emailError) {
        console.error(
          "Greška pri slanju emaila nakon guest rezervacije:",
          emailError.message,
        );
      }
    });

    return res.status(201).json({
      success: true,
      message: "Uspešna registracija i rezervacija",
      accessToken,
      user: {
        id: createdUser._id,
        ime: createdUser.ime,
        prezime: createdUser.prezime,
        email: createdUser.email,
        telefon: createdUser.telefon,
        role: createdUser.role,
      },
      data: createdBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Dohvati moje rezervacije (roditelj)
// @route   GET /api/bookings/my
// @access  Private (roditelj)
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ roditeljId: req.user.id })
      .populate("playroomId", "naziv adresa grad slike")
      .populate("timeSlotId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dohvati rezervacije za moje igraonice (vlasnik)
// @route   GET /api/bookings/owner
// @access  Private (vlasnik)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const playrooms = await Playroom.find({ vlasnikId: req.user.id });
    const playroomIds = playrooms.map((p) => p._id);

    const bookings = await Booking.find({ playroomId: { $in: playroomIds } })
      .populate("roditeljId", "ime prezime email telefon")
      .populate("playroomId", "naziv adresa grad")
      .populate("timeSlotId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Otkaži rezervaciju
// @route   PUT /api/bookings/:id/cancel
// @access  Private (roditelj ili vlasnik ili admin)
exports.cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const booking = await Booking.findById(req.params.id)
      .populate("playroomId", "naziv adresa grad vlasnikId")
      .populate("roditeljId", "ime prezime email telefon")
      .session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Rezervacija nije pronađena",
      });
    }

    const isOwnerOfBooking =
      booking.roditeljId &&
      booking.roditeljId._id &&
      booking.roditeljId._id.toString() === req.user.id;

    const isAdmin = req.user.role === "admin";

    let isPlayroomOwner = false;
    if (booking.playroomId?.vlasnikId) {
      isPlayroomOwner = booking.playroomId.vlasnikId.toString() === req.user.id;
    }

    if (!isOwnerOfBooking && !isPlayroomOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da otkažete ovu rezervaciju",
      });
    }

    if (booking.status === BOOKING_STATUS.OTKAZANO) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Rezervacija je već otkazana",
      });
    }

    if (booking.status === BOOKING_STATUS.ZAVRSENO) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Završena rezervacija ne može biti otkazana",
      });
    }

    booking.status = BOOKING_STATUS.OTKAZANO;
    await booking.save({ session });

    const unlockedSlot = await TimeSlot.findByIdAndUpdate(
      booking.timeSlotId,
      {
        $set: {
          zauzeto: false,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!unlockedSlot) {
      throw new Error("Slot za ovu rezervaciju nije pronađen");
    }

    await session.commitTransaction();

    await bookingService.sendCancellationEmail(booking);

    return res.status(200).json({
      success: true,
      message: "Rezervacija je otkazana",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Potvrdi rezervaciju
// @route   PUT /api/bookings/:id/confirm
// @access  Private (vlasnik ili admin)
exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("playroomId", "naziv adresa grad vlasnikId")
      .populate("roditeljId", "ime prezime email telefon");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Rezervacija nije pronađena",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isPlayroomOwner =
      booking.playroomId?.vlasnikId &&
      booking.playroomId.vlasnikId.toString() === req.user.id;

    if (!isPlayroomOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da potvrdite ovu rezervaciju",
      });
    }

    if (booking.status === BOOKING_STATUS.OTKAZANO) {
      return res.status(400).json({
        success: false,
        message: "Otkazana rezervacija ne može biti potvrđena",
      });
    }

    if (booking.status === BOOKING_STATUS.POTVRDJENO) {
      return res.status(400).json({
        success: false,
        message: "Rezervacija je već potvrđena",
      });
    }

    if (booking.status === BOOKING_STATUS.ZAVRSENO) {
      return res.status(400).json({
        success: false,
        message: "Završena rezervacija ne može biti ponovo potvrđena",
      });
    }

    const bookingEnd = new Date(booking.datum);
    const [endHour, endMinute] = String(booking.vremeDo || "00:00")
      .split(":")
      .map((v) => parseInt(v, 10));

    bookingEnd.setHours(endHour || 0, endMinute || 0, 0, 0);

    if (bookingEnd <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Prošli termin ne može biti potvrđen",
      });
    }

    booking.status = BOOKING_STATUS.POTVRDJENO;
    await booking.save();

    await bookingService.sendConfirmationEmail(booking);

    res.status(200).json({
      success: true,
      message: "Rezervacija je potvrđena",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dohvati jednu rezervaciju po ID
// @route   GET /api/bookings/:id
// @access  Private (roditelj ili vlasnik ili admin)
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("roditeljId", "ime prezime email telefon")
      .populate(
        "playroomId",
        "naziv adresa grad kontaktTelefon kontaktEmail vlasnikId",
      )
      .populate("timeSlotId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Rezervacija nije pronađena",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwnerOfBooking =
      booking.roditeljId &&
      booking.roditeljId._id &&
      booking.roditeljId._id.toString() === req.user.id;
    const isPlayroomOwner =
      booking.playroomId?.vlasnikId &&
      booking.playroomId.vlasnikId.toString() === req.user.id;

    if (!isOwnerOfBooking && !isPlayroomOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da vidite ovu rezervaciju",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
