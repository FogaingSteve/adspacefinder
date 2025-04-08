
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Créer un nouvel avis (protégé)
router.post('/', auth, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    const userId = req.userId;

    // Vérifier si l'utilisateur a déjà laissé un avis pour cette annonce
    const existingReview = await Review.findOne({ userId, listingId });
    if (existingReview) {
      return res.status(400).json({ message: "Vous avez déjà laissé un avis pour cette annonce" });
    }

    // Créer un nouvel avis
    const review = new Review({
      userId,
      listingId,
      rating,
      comment,
      createdAt: new Date()
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error("Erreur création avis:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les avis pour une annonce spécifique
router.get('/listing/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listingId: req.params.listingId })
      .sort({ createdAt: -1 });

    // Récupérer les informations des utilisateurs pour chaque avis
    const reviewsWithUserInfo = await Promise.all(reviews.map(async (review) => {
      try {
        const user = await User.findById(review.userId).select('name avatar_url');
        return {
          ...review.toObject(),
          user: user ? {
            name: user.name,
            avatar_url: user.avatar_url
          } : null
        };
      } catch (error) {
        console.error(`Erreur récupération info utilisateur pour avis ID ${review._id}:`, error);
        return review.toObject();
      }
    }));

    res.json(reviewsWithUserInfo);
  } catch (error) {
    console.error("Erreur récupération avis:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les avis d'un utilisateur spécifique (protégé)
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Erreur récupération avis utilisateur:", error);
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un avis (protégé)
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    // Vérifier que l'utilisateur est bien l'auteur de l'avis
    if (review.userId !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier cet avis" });
    }

    // Mettre à jour l'avis
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    await review.save();
    res.json(review);
  } catch (error) {
    console.error("Erreur mise à jour avis:", error);
    res.status(500).json({ message: error.message });
  }
});

// Supprimer un avis (protégé)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Avis non trouvé" });
    }

    // Vérifier que l'utilisateur est bien l'auteur de l'avis
    if (review.userId !== req.userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cet avis" });
    }

    await Review.deleteOne({ _id: req.params.id });
    res.json({ message: "Avis supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression avis:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
