
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminAuth } = require('../middleware/auth');
const Listing = require('../models/Listing');
const Category = require('../models/Category');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Login pour admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'admin existe
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Erreur de connexion admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les utilisateurs
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    const formattedUsers = users.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      isBanned: user.banned || false
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Bannir un utilisateur
router.post('/users/:userId/ban', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      banned: true
    });
    
    if (error) {
      throw error;
    }
    
    res.json({ message: 'Utilisateur banni avec succès' });
  } catch (error) {
    console.error('Erreur bannissement utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les annonces en attente de modération
router.get('/listings/pending', adminAuth, async (req, res) => {
  try {
    const pendingListings = await Listing.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json(pendingListings);
  } catch (error) {
    console.error('Erreur récupération annonces en attente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Approuver une annonce
router.post('/listings/:id/approve', adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    listing.status = 'approved';
    await listing.save();
    
    res.json(listing);
  } catch (error) {
    console.error('Erreur approbation annonce:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Rejeter une annonce
router.post('/listings/:id/reject', adminAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Annonce non trouvée' });
    }
    
    listing.status = 'rejected';
    await listing.save();
    
    res.json(listing);
  } catch (error) {
    console.error('Erreur rejet annonce:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les statistiques
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await supabase.auth.admin.listUsers()
      .then(({ data }) => data.users.length)
      .catch(() => 0);
    
    const totalListings = await Listing.countDocuments();
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const soldListings = await Listing.countDocuments({ isSold: true });
    
    const listingsByCategory = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const newUsers = await supabase.auth.admin.listUsers()
      .then(({ data }) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return data.users.filter(user => 
          new Date(user.created_at) >= thirtyDaysAgo
        ).length;
      })
      .catch(() => 0);
    
    res.json({
      totalUsers,
      totalListings,
      pendingListings,
      soldListings,
      listingsByCategory,
      newUsers
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Gestion des catégories
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/categories', adminAuth, async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Le nom de la catégorie est requis' });
    }
    
    const newCategory = new Category({
      name,
      subcategories: subcategories || []
    });
    
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.delete('/categories/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
