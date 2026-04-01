const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema(
  {
    playroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playroom",
      required: true,
      index: true,
    },

    datum: {
      type: Date,
      required: [true, "Datum je obavezan"],
      index: true,
    },

    vremeOd: {
      type: String,
      required: [true, "Vreme od je obavezno"],
      trim: true,
    },

    vremeDo: {
      type: String,
      required: [true, "Vreme do je obavezno"],
      trim: true,
    },

    maxDece: {
      type: Number,
      default: 20,
      min: 0,
    },

    slobodno: {
      type: Number,
      default: 20,
      min: 0,
    },

    zauzeto: {
      type: Boolean,
      default: false,
      index: true,
    },

    aktivno: {
      type: Boolean,
      default: true,
      index: true,
    },

    cena: {
      type: Number,
      required: [true, "Cena je obavezna"],
      min: 0,
    },

    vanRadnogVremena: {
      type: Boolean,
      default: false,
      index: true,
    },

    napomenaAdmin: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// 🔒 jedinstven slot
TimeSlotSchema.index(
  { playroomId: 1, datum: 1, vremeOd: 1, vremeDo: 1 },
  { unique: true },
);

// ⚡ brzi query za frontend
TimeSlotSchema.index({
  playroomId: 1,
  datum: 1,
  aktivno: 1,
  vanRadnogVremena: 1,
});

// ⚡ brzi query za owner dashboard
TimeSlotSchema.index({
  playroomId: 1,
  datum: 1,
  zauzeto: 1,
});

// 🔒 automatski sync zauzeto/slobodno
TimeSlotSchema.pre("save", function (next) {
  if (this.slobodno <= 0) {
    this.slobodno = 0;
    this.zauzeto = true;
  } else {
    this.zauzeto = false;
  }

  if (this.maxDece < this.slobodno) {
    this.slobodno = this.maxDece;
  }

  next();
});

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
