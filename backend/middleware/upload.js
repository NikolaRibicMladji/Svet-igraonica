const multer = require("multer");

// Čuvanje u memoriju (za Cloudinary)
const storage = multer.memoryStorage();

// Filter za tipove fajlova - DOZVOLJENE I SLIKE I VIDEO
const fileFilter = (req, file, cb) => {
  // Dozvoljeni formati slika
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Dozvoljeni formati videa
  const videoTypes = /mp4|mov|avi|mkv|webm/;

  const extname = file.originalname.toLowerCase().split(".").pop();
  const mimetype = file.mimetype;

  const isImage = imageTypes.test(extname) && imageTypes.test(mimetype);
  const isVideo = videoTypes.test(extname) && videoTypes.test(mimetype);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Samo slike (jpeg, jpg, png, gif, webp) i video (mp4, mov, avi, mkv, webm) su dozvoljeni",
      ),
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB za video
  fileFilter: fileFilter,
});

module.exports = upload;
