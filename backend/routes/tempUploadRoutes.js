const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// 🔒 upload privremenih slika (npr. pre kreiranja igraonice)
router.post(
  "/temp",
  protect,
  upload.singleImage("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nema slike",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "svet-igraonica/temp",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 900, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" },
            ],
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
        message: "Privremena slika uploadovana",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
