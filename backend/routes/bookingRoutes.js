const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createBookingSchema,
  createGuestBookingSchema,
} = require("../validations/bookingValidation");

const {
  createBooking,
  createGuestBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  confirmBooking,
  getBookingById,
} = require("../controllers/bookingController");

// gost: registracija + login + rezervacija
router.post("/guest", validate(createGuestBookingSchema), createGuestBooking);

// ulogovan roditelj: standardna rezervacija
router.post("/", protect, validate(createBookingSchema), createBooking);

// sve ispod traži login
router.use(protect);

router.get("/my", getMyBookings);
router.get("/owner", getOwnerBookings);
router.get("/:id", getBookingById);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/confirm", confirmBooking);

module.exports = router;
