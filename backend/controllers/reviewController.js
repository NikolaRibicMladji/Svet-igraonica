const Review = require("../models/Review");
const Playroom = require("../models/Playroom");
const Booking = require("../models/Booking");

// @desc    Dodaj recenziju za igraonicu
// @route   POST /api/reviews/:playroomId
// @access  Private (samo roditelji koji su bili na terminu)
exports.addReview = async (req, res) => {
  try {
    const { playroomId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Proveri da li je korisnik već ostavio recenziju
    const existingReview = await Review.findOne({ playroomId, userId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Već ste ostavili recenziju za ovu igraonicu",
      });
    }

    // Proveri da li je korisnik bio na terminu (ima završenu rezervaciju)
    const hasBooking = await Booking.findOne({
      playroomId,
      roditeljId: userId,
      status: "zavrseno",
    });

    if (!hasBooking && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Samo roditelji koji su posetili igraonicu mogu ostaviti recenziju. Rezervacija mora biti završena.",
      });
    }

    // Dohvati igraonicu
    const playroom = await Playroom.findById(playroomId);
    if (!playroom) {
      return res.status(404).json({
        success: false,
        message: "Igraonica nije pronađena",
      });
    }

    // Kreiraj recenziju
    const review = await Review.create({
      playroomId,
      userId,
      userName: `${req.user.ime} ${req.user.prezime}`,
      rating,
      comment,
    });

    // Ažuriraj prosečnu ocenu igraonice
    const allReviews = await Review.find({ playroomId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    playroom.rating = averageRating;
    playroom.reviewCount = allReviews.length;
    await playroom.save();

    res.status(201).json({
      success: true,
      data: review,
      message: "Recenzija je uspešno dodata",
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
      error: error.message,
    });
  }
};

// @desc    Dohvati sve recenzije za igraonicu
// @route   GET /api/reviews/:playroomId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { playroomId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ playroomId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ playroomId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews,
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Obriši recenziju (samo admin ili autor)
// @route   DELETE /api/reviews/:id
// @access  Private (admin ili autor)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Recenzija nije pronađena",
      });
    }

    // Proveri prava
    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da obrišete ovu recenziju",
      });
    }

    await review.deleteOne();

    // Ažuriraj prosečnu ocenu igraonice
    const allReviews = await Review.find({ playroomId: review.playroomId });
    const playroom = await Playroom.findById(review.playroomId);

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      playroom.rating = totalRating / allReviews.length;
      playroom.reviewCount = allReviews.length;
    } else {
      playroom.rating = 0;
      playroom.reviewCount = 0;
    }
    await playroom.save();

    res.status(200).json({
      success: true,
      message: "Recenzija je obrisana",
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};
