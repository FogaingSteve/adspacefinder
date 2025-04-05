
const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const fs = require('fs');

// Assurer que le répertoire uploads existe
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique avec timestamp et un identifiant aléatoire
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limite de taille
  },
  fileFilter: function(req, file, cb) {
    // Accepter seulement les images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Seulement les images sont autorisées!'), false);
    }
    cb(null, true);
  }
});

// Récupérer les annonces récentes (moins de 7 jours)
router.get('/recent', async (req, res) => {
  try {
    console.log("Récupération des annonces récentes (moins de 7 jours)");
    
    // Calculer la date d'il y a 7 jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    console.log("Date limite:", sevenDaysAgo);
    
    const listings = await Listing.find({
      createdAt: { $gte: sevenDaysAgo },
      isSold: { $ne: true } // Ne pas inclure les annonces marquées comme vendues
    })
      .sort({ createdAt: -1 })
      .limit(20) // Limiter le nombre de résultats
      .exec();
    
    console.log("Annonces récentes trouvées:", listings.length);
    res.json(listings);
  } catch (error) {
    console.error("Erreur récupération annonces récentes:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des annonces récentes" });
  }
});

// Important: This route must come AFTER /recent
// Récupérer une annonce par ID
router.get('/:id', async (req, res) => {
  try {
    // Avoid MongoDB errors with special routes
    if (req.params.id === 'recent' || 
        req.params.id === 'search' || 
        req.params.id === 'category' || 
        req.params.id === 'user' || 
        req.params.id === 'title' ||
        req.params.id === 'favorites' ||
        req.params.id === 'search-results' ||
        req.params.id === 'upload') {
      return res.status(400).json({ message: "Route spéciale, utilisez l'endpoint dédié" });
    }
    
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

// NOUVELLE ROUTE: Rechercher des annonces avec une route dédiée pour éviter les conflits d'ID
router.get('/search-results', async (req, res) => {
  try {
    const query = req.query.q || '';
    const category = req.query.category;
    const exactTitle = req.query.exactTitle;
    
    console.log("Recherche avec paramètres:", { query, category, exactTitle });
    
    let searchQuery = {};
    
    // Construire la requête de recherche
    if (exactTitle) {
      // Recherche par titre exact si demandé
      searchQuery.title = exactTitle;
    } else {
      // Sinon recherche partielle
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Ajouter le filtre par catégorie si fourni
    if (category) {
      searchQuery.category = category;
    }
    
    console.log("Requête MongoDB:", JSON.stringify(searchQuery));
    
    const listings = await Listing.find(searchQuery).sort({ createdAt: -1 });
    
    console.log(`${listings.length} résultats trouvés`);
    res.json(listings);
  } catch (error) {
    console.error("Erreur recherche annonces:", error);
    res.status(500).json({ 
      message: error.message,
      details: "Une erreur s'est produite lors de la recherche"
    });
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
    console.log("Fichiers reçus:", req.files);
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
    }
    
    // Générer des URLs avec le domaine du serveur pour accéder aux images
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const urls = files.map(file => `${serverUrl}/uploads/${file.filename}`);
    
    console.log("URLs des images:", urls);
    res.json({ urls, message: `${files.length} fichiers téléchargés avec succès` });
  } catch (error) {
    console.error("Erreur lors de l'upload des images:", error);
    res.status(500).json({ message: error.message });
  }
});

// Favoris : Ajouter/retirer une annonce des favoris
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.userId; // Récupéré du middleware auth
    
    console.log(`Action favori pour l'annonce ${listingId} par l'utilisateur ${userId}`);
    
    // Vérifier si l'annonce existe
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    
    // Vérifier si l'annonce a un tableau de favoris, sinon le créer
    if (!listing.favorites) {
      listing.favorites = [];
    }
    
    // Ajouter ou retirer l'utilisateur des favoris
    const isFavorite = listing.favorites.includes(userId);
    
    if (isFavorite) {
      // Retirer des favoris
      listing.favorites = listing.favorites.filter(id => id !== userId);
      console.log(`Utilisateur ${userId} retiré des favoris pour l'annonce ${listingId}`);
    } else {
      // Ajouter aux favoris
      listing.favorites.push(userId);
      console.log(`Utilisateur ${userId} ajouté aux favoris pour l'annonce ${listingId}`);
    }
    
    // Sauvegarder les modifications
    await listing.save();
    
    res.json({ 
      success: true, 
      isFavorite: !isFavorite,
      message: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris"
    });
  } catch (error) {
    console.error("Erreur gestion des favoris:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les annonces favorites d'un utilisateur
router.get('/favorites/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log(`Récupération des favoris pour l'utilisateur ${userId}`);
    
    // Rechercher toutes les annonces où l'utilisateur est dans le tableau des favoris
    const favorites = await Listing.find({
      favorites: userId
    }).sort({ createdAt: -1 });
    
    console.log(`${favorites.length} annonces favorites trouvées`);
    res.json(favorites);
  } catch (error) {
    console.error("Erreur récupération des favoris:", error);
    res.status(500).json({ message: error.message });
  }
});

// Marquer une annonce comme vendue
router.put('/:id/sold', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'annonce
    if (listing.userId !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette annonce" });
    }
    
    // Inverser le statut vendu
    listing.isSold = !listing.isSold;
    listing.updatedAt = new Date();
    
    await listing.save();
    
    res.json(listing);
  } catch (error) {
    console.error("Erreur lors du marquage comme vendu:", error);
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour une annonce
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'annonce
    if (listing.userId !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cette annonce" });
    }
    
    // Mettre à jour les champs modifiables
    const allowedUpdates = ['title', 'description', 'price', 'category', 'subcategory', 'location', 'images'];
    const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
    
    updates.forEach(update => {
      listing[update] = req.body[update];
    });
    
    listing.updatedAt = new Date();
    
    await listing.save();
    
    res.json(listing);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error);
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une annonce
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: "Annonce non trouvée" });
    }
    
    // Vérifier que l'utilisateur est le propriétaire de l'annonce
    if (listing.userId !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette annonce" });
    }
    
    await Listing.deleteOne({ _id: req.params.id });
    
    res.json({ message: "Annonce supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rechercher des annonces (ancienne méthode - gardée pour compatibilité)
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

// Add a specific route for category/subcategory
router.get('/category/:categoryId/subcategory/:subcategoryId', async (req, res) => {
  try {
    console.log(`Getting listings for category ${req.params.categoryId} and subcategory ${req.params.subcategoryId}`);
    
    const listings = await Listing.find({ 
      category: req.params.categoryId,
      subcategory: req.params.subcategoryId
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${listings.length} listings for subcategory ${req.params.subcategoryId}`);
    res.json(listings);
  } catch (error) {
    console.error("Error getting subcategory listings:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
