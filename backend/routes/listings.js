const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Créer une nouvelle annonce (protégée)
router.post('/', auth, async (req, res) => {
  try {
    console.log("Données reçues:", req.body);
    console.log("ID utilisateur:", req.userId);

    const listing = new Listing({
      ...req.body,
      userId: req.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedListing = await listing.save();
    console.log("Annonce sauvegardée:", savedListing);
    res.status(201).json(savedListing);
  } catch (error) {
    console.error("Erreur création annonce:", error);
    res.status(400).json({ message: error.message });
  }
});

// Récupérer toutes les annonces récentes
router.get('/recent', async (req, res) => {
  try {
    console.log("Récupération des annonces récentes");
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
    
    console.log("Annonces récentes trouvées:", listings.length);
    res.json(listings);
  } catch (error) {
    console.error("Erreur récupération annonces récentes:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des annonces récentes" });
  }
});

// Récupérer les annonces par catégorie
router.get('/category/:categoryId', async (req, res) => {
  try {
    const listings = await Listing.find({ category: req.params.categoryId })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload d'images
router.post('/upload', upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;
    const urls = files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rechercher des annonces
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const listings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
