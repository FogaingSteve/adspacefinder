
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const listingsRoutes = require('./routes/listings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/listings', listingsRoutes);

// Connexion MongoDB avec plus de logs
mongoose.connect('mongodb://localhost:27017/classifieds', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connecté à MongoDB avec succès');
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Log les erreurs MongoDB
mongoose.connection.on('error', err => {
  console.error('Erreur MongoDB:', err);
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
