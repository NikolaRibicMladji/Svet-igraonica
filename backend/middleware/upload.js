const multer = require("multer");
const path = require("path");

// Čuvanje u memoriji (za Cloudinary)
const storage = multer.memoryStorage();

const allowedImageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
  ".avif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".ico",
]);

const allowedVideoExtensions = new Set([
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  const isImageMime = mime.startsWith("image/");
  const isVideoMime = mime.startsWith("video/");

  const isAllowedImage = isImageMime || allowedImageExtensions.has(ext);
  const isAllowedVideo = isVideoMime || allowedVideoExtensions.has(ext);

  if (isAllowedImage || isAllowedVideo) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Dozvoljeni su samo image/* fajlovi i video fajlovi (mp4, mov, avi, mkv, webm).",
    ),
  );
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
