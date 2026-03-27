const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Nema videa" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "svet-igraonica/videos",
          resource_type: "video",
          transformation: [
            { width: 1280, height: 720, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        thumbnail: cloudinary.url(result.public_id, {
          resource_type: "video",
          format: "jpg",
        }),
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("Greška pri uploadu videa:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
