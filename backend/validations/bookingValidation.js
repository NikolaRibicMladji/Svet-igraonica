const { z } = require("zod");

const createBookingSchema = z.object({
  slotId: z.string().min(1, "slotId je obavezan"),

  imeRoditelja: z.string().min(2, "Ime mora imati bar 2 karaktera").trim(),

  prezimeRoditelja: z
    .string()
    .min(2, "Prezime mora imati bar 2 karaktera")
    .trim(),

  emailRoditelja: z.string().email("Neispravan email").toLowerCase().trim(),

  telefon: z
    .string()
    .min(6, "Telefon mora imati bar 6 cifara")
    .regex(/^[0-9+ ]+$/, "Telefon može sadržati samo brojeve")
    .trim(),

  brojDece: z.coerce
    .number({
      required_error: "Broj dece je obavezan",
    })
    .min(1, "Mora biti bar 1 dete")
    .max(50, "Previše dece"),

  brojRoditelja: z.coerce
    .number()
    .min(0, "Ne može biti negativno")
    .max(50, "Previše roditelja")
    .optional(),

  napomena: z.string().max(500).optional(),
});

const createGuestBookingSchema = z
  .object({
    slotId: z.string().min(1, "slotId je obavezan"),

    ime: z.string().min(2, "Ime mora imati bar 2 karaktera").trim(),

    prezime: z.string().min(2, "Prezime mora imati bar 2 karaktera").trim(),

    email: z.string().email("Neispravan email").toLowerCase().trim(),

    telefon: z
      .string()
      .min(6, "Telefon mora imati bar 6 cifara")
      .regex(/^[0-9+ ]+$/, "Telefon može sadržati samo brojeve")
      .trim(),

    password: z.string().min(6, "Lozinka mora imati bar 6 karaktera"),

    confirmPassword: z
      .string()
      .min(6, "Potvrda lozinke mora imati bar 6 karaktera"),

    brojDece: z.coerce
      .number({
        required_error: "Broj dece je obavezan",
      })
      .min(1, "Mora biti bar 1 dete")
      .max(50, "Previše dece"),

    brojRoditelja: z.coerce
      .number()
      .min(0, "Ne može biti negativno")
      .max(50, "Previše roditelja")
      .optional(),

    napomena: z.string().max(500).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Lozinke se ne poklapaju",
    path: ["confirmPassword"],
  });

module.exports = {
  createBookingSchema,
  createGuestBookingSchema,
};
