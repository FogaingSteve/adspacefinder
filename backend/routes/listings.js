
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

// Récupérer une annonce par ID
router.get('/:id', async (req, res) => {
  try {
    console.log("Recherche de l'annonce par ID:", req.params.id);
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    res.json(listing);
  } catch (error) {
    console.error("Erreur récupération annonce par ID:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer une annonce par titre (utilisée pour la route avec titre dans l'URL)
router.get('/title/:title', async (req, res) => {
  try {
    console.log("Recherche de l'annonce par titre:", req.params.title);
    // Rechercher l'annonce où le titre est égal au paramètre title
    // ou utiliser une regex pour une recherche partielle selon vos besoins
    const listing = await Listing.findOne({
      title: { $regex: new RegExp(req.params.title, 'i') }
    });
    
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    
    res.json(listing);
  } catch (error) {
    console.error("Erreur récupération annonce par titre:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les annonces d'un utilisateur spécifique
router.get('/user/:userId', async (req, res) => {
  try {
    console.log("Récupération des annonces pour l'utilisateur:", req.params.userId);
    const listings = await Listing.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    console.log("Annonces trouvées:", listings.length);
    res.json(listings);
  } catch (error) {
    console.error("Erreur récupération annonces utilisateur:", error);
    res.status(500).json({ message: error.message });
  }
});

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
