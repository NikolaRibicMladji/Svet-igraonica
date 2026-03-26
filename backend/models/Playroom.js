const mongoose = require("mongoose");

const PlayroomSchema = new mongoose.Schema({
  vlasnikId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  naziv: {
    type: String,
    required: [true, "Naziv igraonice je obavezan"],
    trim: true,
    unique: true,
  },
  adresa: {
    type: String,
    required: [true, "Adresa je obavezna"],
  },
  grad: {
    type: String,
    required: [true, "Grad je obavezan"],
  },
  opis: {
    type: String,
    required: [true, "Opis je obavezan"],
  },
  kontaktTelefon: {
    type: String,
    required: [true, "Kontakt telefon je obavezan"],
  },
  kontaktEmail: {
    type: String,
    required: [true, "Kontakt email je obavezan"],
  },
  radnoVreme: {
    ponedeljak: { od: String, do: String },
    utorak: { od: String, do: String },
    sreda: { od: String, do: String },
    cetvrtak: { od: String, do: String },
    petak: { od: String, do: String },
    subota: { od: String, do: String },
    nedelja: { od: String, do: String },
  },
  cenovnik: {
    osnovni: {
      type: Number,
      required: [true, "Osnovna cena je obavezna"],
    },
    poRoditelju: {
      type: Number,
      default: 0,
    },
    produzeno: {
      type: Number,
      default: 0,
    },
    vikend: {
      type: Number,
      default: 0,
    },
    fiksniPaketi: [
      {
        naziv: {
          type: String,
          required: true,
        },
        cena: {
          type: Number,
          required: true,
        },
        opis: {
          type: String,
          default: "",
        },
      },
    ],
  },
  pogodnosti: [
    {
      type: String,
      trim: true,
    },
  ],
  opcije: [
    {
      naziv: {
        type: String,
        required: true,
      },
      cena: {
        type: Number,
        required: true,
        default: 0,
      },
      opis: {
        type: String,
        default: "",
      },
      tip: {
        type: String,
        enum: ["po_osobi", "fiksno"],
        default: "po_osobi",
      },
    },
  ],
  slike: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      width: Number,
      height: Number,
      size: Number,
      format: String,
      isMain: {
        type: Boolean,
        default: false,
      },
    },
  ],
  video: {
    url: String,
    publicId: String,
    duration: Number,
    format: String,
    thumbnail: String,
  },
  verifikovan: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  kapacitet: {
    type: Number,
    required: [true, "Kapacitet je obavezan"],
  },
  status: {
    type: String,
    enum: ["aktivan", "neaktivan", "u_izradi"],
    default: "u_izradi",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Playroom", PlayroomSchema);
