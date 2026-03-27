const Playroom = require("../models/Playroom");

// @desc    Kreiraj novu igraonicu (samo vlasnici)
// @route   POST /api/playrooms
// @access  Private (vlasnik ili admin)
exports.createPlayroom = async (req, res) => {
  try {
    // Dodaj vlasnika iz tokena
    req.body.vlasnikId = req.user.id;

    // Proveri da li već postoji igraonica sa istim imenom
    const postoji = await Playroom.findOne({ naziv: req.body.naziv });
    if (postoji) {
      return res.status(400).json({
        success: false,
        message: "Igraonica sa ovim imenom već postoji",
      });
    }

    const playroom = await Playroom.create(req.body);

    res.status(201).json({
      success: true,
      data: playroom,
    });
  } catch (error) {
    console.error("Greška pri kreiranju igraonice:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
      error: error.message,
    });
  }
};

// @desc    Dohvati sve verifikovane igraonice (sa filtriranjem)
// @route   GET /api/playrooms
// @access  Public
exports.getAllPlayrooms = async (req, res) => {
  try {
    const { grad, minCena, maxCena, pogodnosti, minRating, sortBy } = req.query;

    // Osnovni filter - samo verifikovane i aktivne igraonice
    let query = { verifikovan: true, status: "aktivan" };

    // Filter po gradu
    if (grad && grad !== "svi") {
      query.grad = grad;
    }

    // Filter po ceni
    if (minCena || maxCena) {
      query["cenovnik.osnovni"] = {};
      if (minCena) query["cenovnik.osnovni"].$gte = parseInt(minCena);
      if (maxCena) query["cenovnik.osnovni"].$lte = parseInt(maxCena);
    }

    // Filter po oceni
    if (minRating && minRating !== "sve") {
      query.rating = { $gte: parseInt(minRating) };
    }

    // Filter po pogodnostima
    if (pogodnosti) {
      const pogodnostiArray = pogodnosti.split(",");
      query.pogodnosti = { $in: pogodnostiArray };
    }

    // Sortiranje
    let sort = { createdAt: -1 }; // default: najnovije prvo
    if (sortBy === "rating") {
      sort = { rating: -1 };
    } else if (sortBy === "price_asc") {
      sort = { "cenovnik.osnovni": 1 };
    } else if (sortBy === "price_desc") {
      sort = { "cenovnik.osnovni": -1 };
    }

    const playrooms = await Playroom.find(query).select("-__v").sort(sort);

    res.status(200).json({
      success: true,
      count: playrooms.length,
      data: playrooms,
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Dohvati jednu igraonicu po ID
// @route   GET /api/playrooms/:id
// @access  Public
exports.getPlayroomById = async (req, res) => {
  try {
    console.log("Dohvatam igraonicu sa ID:", req.params.id);

    const playroom = await Playroom.findById(req.params.id).populate(
      "vlasnikId",
      "ime prezime email telefon",
    );

    console.log(
      "Pronađena igraonica:",
      playroom ? playroom.naziv : "Nije pronađena",
    );
    console.log("VideoGalerija:", playroom?.videoGalerija);

    if (!playroom) {
      return res.status(404).json({
        success: false,
        message: "Igraonica nije pronađena",
      });
    }

    // Ako nije verifikovana, samo vlasnik i admin mogu da vide
    if (
      !playroom.verifikovan &&
      req.user?.role !== "vlasnik" &&
      req.user?.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Ova igraonica još nije verifikovana",
      });
    }

    res.status(200).json({
      success: true,
      data: playroom,
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Dohvati svoje igraonice (za vlasnika)
// @route   GET /api/playrooms/mine/my-playrooms
// @access  Private (vlasnik)
exports.getMyPlayrooms = async (req, res) => {
  try {
    const playrooms = await Playroom.find({ vlasnikId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: playrooms.length,
      data: playrooms,
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Ažuriraj igraonicu
// @route   PUT /api/playrooms/:id
// @access  Private (vlasnik te igraonice ili admin)
exports.updatePlayroom = async (req, res) => {
  try {
    let playroom = await Playroom.findById(req.params.id);

    if (!playroom) {
      return res.status(404).json({
        success: false,
        message: "Igraonica nije pronađena",
      });
    }

    // Proveri da li korisnik ima pravo (vlasnik ili admin)
    if (
      playroom.vlasnikId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da menjate ovu igraonicu",
      });
    }

    playroom = await Playroom.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: playroom,
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Obriši igraonicu
// @route   DELETE /api/playrooms/:id
// @access  Private (vlasnik ili admin)
exports.deletePlayroom = async (req, res) => {
  try {
    const playroom = await Playroom.findById(req.params.id);

    if (!playroom) {
      return res.status(404).json({
        success: false,
        message: "Igraonica nije pronađena",
      });
    }

    // Proveri prava
    if (
      playroom.vlasnikId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Nemate pravo da obrišete ovu igraonicu",
      });
    }

    await playroom.deleteOne();

    res.status(200).json({
      success: true,
      message: "Igraonica je obrisana",
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};

// @desc    Verifikuj igraonicu (samo admin)
// @route   PUT /api/playrooms/:id/verify
// @access  Private (admin)
exports.verifyPlayroom = async (req, res) => {
  try {
    const playroom = await Playroom.findById(req.params.id);

    if (!playroom) {
      return res.status(404).json({
        success: false,
        message: "Igraonica nije pronađena",
      });
    }

    playroom.verifikovan = true;
    playroom.status = "aktivan";
    await playroom.save();

    res.status(200).json({
      success: true,
      data: playroom,
      message: "Igraonica je verifikovana",
    });
  } catch (error) {
    console.error("Greška:", error);
    res.status(500).json({
      success: false,
      message: "Greška na serveru",
    });
  }
};
