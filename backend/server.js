const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const listingsRoutes = require('./routes/listings');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const path = require('path');
const { initializeSupabaseTables } = require('./supabase');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Vérifier et créer un admin par défaut si nécessaire
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@admin.com' });
    
    if (!adminExists) {
      const defaultAdmin = new Admin({
        email: 'admin@admin.com',
        password: 'admin123', // Sera hashé automatiquement
        name: 'Administrateur'
      });
      
      await defaultAdmin.save();
      console.log('Admin par défaut créé');
    }
  } catch (error) {
    console.error('Erreur création admin par défaut:', error);
  }
};

createDefaultAdmin();

// Initialize Supabase tables
initializeSupabaseTables()
  .then(() => console.log('Supabase initialization completed'))
  .catch(err => console.error('Error initializing Supabase:', err));

// Initialiser les routes
app.use('/api/listings', listingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewsRoutes);

// Route pour les villes
app.get('/api/cities', (req, res) => {
  const cities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"];
  res.json(cities);
});

// Route pour tester le serveur
app.get('/', (req, res) => {
  res.send('API fonctionne');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
