const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID nije validan");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createTimeSlotSchema = z.object({
  body: z.object({
    playroomId: objectId,
    datum: z.string().min(1, "Datum je obavezan"),
    vremeOd: z.string().regex(timeRegex, "vremeOd mora biti u formatu HH:MM"),
    vremeDo: z.string().regex(timeRegex, "vremeDo mora biti u formatu HH:MM"),
    cena: z
      .number({
        required_error: "Cena je obavezna",
        invalid_type_error: "Cena mora biti broj",
      })
      .min(0, "Cena ne može biti negativna"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateTimeSlotSchema = z.object({
  body: z
    .object({
      maxDece: z
        .number()
        .int()
        .min(1, "maxDece mora biti veći od 0")
        .optional(),
      cena: z.number().min(0, "Cena ne može biti negativna").optional(),
      aktivno: z.boolean().optional(),
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      "Moraš poslati bar jedno polje za izmenu",
    ),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

const manualBookTimeSlotSchema = z.object({
  body: z.object({
    brojDece: z
      .number()
      .int()
      .min(1, "Broj dece mora biti veći od 0")
      .optional(),
    napomena: z
      .string()
      .max(500, "Napomena može imati najviše 500 karaktera")
      .optional(),
  }),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

const playroomDateQuerySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    playroomId: objectId,
  }),
  query: z.object({
    datum: z.string().min(1, "Datum je obavezan"),
  }),
});

const timeSlotIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

module.exports = {
  createTimeSlotSchema,
  updateTimeSlotSchema,
  manualBookTimeSlotSchema,
  playroomDateQuerySchema,
  timeSlotIdParamSchema,
};
