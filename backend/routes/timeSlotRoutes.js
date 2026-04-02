const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const {
  createTimeSlot,
  getTimeSlotsByPlayroom,
  getTimeSlotById,
  getMyTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
  generateSlotsForPlayroom,
  getAvailableTimeSlots,
  getAllTimeSlotsForOwner,
  manualBookTimeSlot,
} = require("../controllers/timeSlotController");

// 🌐 JAVNE RUTE
router.get("/playroom/:playroomId", getTimeSlotsByPlayroom);
router.get("/playroom/:playroomId/available", getAvailableTimeSlots);
router.get("/:id", getTimeSlotById);

// 🔒 sve ispod traži login
router.use(protect);

// 👤 vlasnik/admin
router.post("/", authorize(ROLES.VLASNIK, ROLES.ADMIN), createTimeSlot);
router.get("/my", authorize(ROLES.VLASNIK, ROLES.ADMIN), getMyTimeSlots);
router.post(
  "/generate/:playroomId",
  authorize(ROLES.VLASNIK, ROLES.ADMIN),
  generateSlotsForPlayroom,
);
router.put("/:id", authorize(ROLES.VLASNIK, ROLES.ADMIN), updateTimeSlot);
router.delete("/:id", authorize(ROLES.VLASNIK, ROLES.ADMIN), deleteTimeSlot);

router.get(
  "/playroom/:playroomId/all",
  authorize(ROLES.VLASNIK, ROLES.ADMIN),
  getAllTimeSlotsForOwner,
);

router.post(
  "/:id/manual-book",
  authorize(ROLES.VLASNIK, ROLES.ADMIN),
  manualBookTimeSlot,
);

module.exports = router;
