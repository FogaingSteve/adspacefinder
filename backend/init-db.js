
// Script pour initialiser la base de données avec les catégories
const initCategories = require('./utils/initCategories');

// Exécuter l'initialisation
console.log('Démarrage de l\'initialisation de la base de données...');
initCategories().then(() => {
  console.log('Initialisation terminée');
}).catch(err => {
  console.error('Erreur lors de l\'initialisation:', err);
});
