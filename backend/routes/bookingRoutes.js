const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createBookingSchema } = require("../validations/bookingValidation");

const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
  confirmBooking,
  getBookingById,
} = require("../controllers/bookingController");

// 🌐 JAVNO - rezervacija
router.post("/", validate(createBookingSchema), createBooking);

// 🔒 sve ispod traži login
router.use(protect);

// 📦 BOOKINGS
router.get("/my", getMyBookings);
router.get("/owner", getOwnerBookings);
router.get("/:id", getBookingById);

// ✏️ AKCIJE
router.put("/:id/cancel", cancelBooking);
router.put("/:id/confirm", confirmBooking);

module.exports = router;
