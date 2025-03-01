
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const listingsRoutes = require('./routes/listings');
const categoriesRoutes = require('./routes/categories');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/listings', listingsRoutes);
app.use('/api/categories', categoriesRoutes);

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
