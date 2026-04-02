const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const {
  addReview,
  getReviews,
  deleteReview,
} = require("../controllers/reviewController");

// 🌐 JAVNO
router.get("/:playroomId", getReviews);

// 🔒 PRIVATNO
router.post(
  "/:playroomId",
  protect,
  authorize(ROLES.RODITELJ, ROLES.ADMIN),
  addReview,
);

router.delete("/:id", protect, deleteReview);

module.exports = router;
