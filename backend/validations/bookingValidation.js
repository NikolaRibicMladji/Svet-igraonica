const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID nije validan");

const createBookingSchema = z.object({
  body: z.object({
    slotId: objectId,

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
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const createGuestBookingSchema = z
  .object({
    body: z.object({
      slotId: objectId,

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
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Lozinke se ne poklapaju",
    path: ["body", "confirmPassword"],
  });

const bookingIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

module.exports = {
  createBookingSchema,
  createGuestBookingSchema,
  bookingIdParamSchema,
};
