const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const upload = require("../middleware/upload");

const {
  uploadPlayroomImage,
  deletePlayroomImage,
} = require("../controllers/uploadController");

const { uploadVideo } = require("../controllers/videoController");

// 🔒 sve rute zahtevaju login + vlasnik/admin
router.use(protect);
router.use(authorize(ROLES.VLASNIK, ROLES.ADMIN));

// 📸 upload slike
router.post(
  "/playroom/:playroomId",
  upload.singleImage("image"),
  uploadPlayroomImage,
);

// 🗑 brisanje slike
router.delete("/playroom/:playroomId/:imageUrl", deletePlayroomImage);

// 🎥 upload video
router.post("/video", upload.singleVideo("video"), uploadVideo);

module.exports = router;
