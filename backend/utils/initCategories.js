
const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categoriesData = [
  {
    id: "vehicules",
    name: "Véhicules",
    slug: "vehicules",
    subcategories: [
      { id: "voitures", name: "Voitures", slug: "voitures" },
      { id: "motos", name: "Motos", slug: "motos" },
      { id: "camions", name: "Camions", slug: "camions" },
      { id: "pieces", name: "Pièces auto", slug: "pieces-auto" }
    ]
  },
  {
    id: "electronique",
    name: "Electronique",
    slug: "electronique",
    subcategories: [
      { id: "smartphones", name: "Smartphones", slug: "smartphones" },
      { id: "ordinateurs", name: "Ordinateurs", slug: "ordinateurs" },
      { id: "tv", name: "TV & Home Cinéma", slug: "tv-home-cinema" },
      { id: "accessoires", name: "Accessoires", slug: "accessoires-electronique" }
    ]
  },
  {
    id: "mode",
    name: "Mode & Beauté",
    slug: "mode",
    subcategories: [
      { id: "vetements", name: "Vêtements", slug: "vetements" },
      { id: "chaussures", name: "Chaussures", slug: "chaussures" },
      { id: "bijoux", name: "Bijoux & Montres", slug: "bijoux-montres" },
      { id: "beaute", name: "Produits de beauté", slug: "produits-beaute" }
    ]
  },
  {
    id: "immobilier",
    name: "Immobilier",
    slug: "immobilier",
    subcategories: [
      { id: "vente", name: "Vente", slug: "vente-immobilier" },
      { id: "location", name: "Location", slug: "location" },
      { id: "colocations", name: "Colocations", slug: "colocations" },
      { id: "bureaux", name: "Bureaux & Commerces", slug: "bureaux-commerces" }
    ]
  },
  {
    id: "electromenager",
    name: "Electroménager",
    slug: "electromenager",
    subcategories: [
      { id: "cuisine", name: "Appareils cuisine", slug: "appareils-cuisine" },
      { id: "lavage", name: "Lave-linge & Sèche-linge", slug: "lavage" },
      { id: "refrigeration", name: "Réfrigérateurs & Congélateurs", slug: "refrigeration" },
      { id: "petits", name: "Petits électroménagers", slug: "petits-electromenagers" }
    ]
  },
  {
    id: "maison",
    name: "Pour la maison",
    slug: "maison",
    subcategories: [
      { id: "meubles", name: "Meubles", slug: "meubles" },
      { id: "decoration", name: "Décoration", slug: "decoration" },
      { id: "jardin", name: "Jardin & Extérieur", slug: "jardin-exterieur" },
      { id: "bricolage", name: "Bricolage & Outils", slug: "bricolage-outils" }
    ]
  },
  {
    id: "emplois",
    name: "Emplois",
    slug: "emplois",
    subcategories: [
      { id: "offres", name: "Offres d'emploi", slug: "offres-emploi" },
      { id: "stages", name: "Stages", slug: "stages" },
      { id: "freelance", name: "Freelance", slug: "freelance" },
      { id: "formation", name: "Formation professionnelle", slug: "formation-pro" }
    ]
  },
  {
    id: "services",
    name: "Services",
    slug: "services",
    subcategories: [
      { id: "cours", name: "Cours particuliers", slug: "cours-particuliers" },
      { id: "evenements", name: "Événements", slug: "evenements" },
      { id: "demenagement", name: "Déménagement", slug: "demenagement" },
      { id: "maintenance", name: "Maintenance & Réparation", slug: "maintenance-reparation" }
    ]
  },
  {
    id: "enfant",
    name: "Pour l'enfant",
    slug: "enfant",
    subcategories: [
      { id: "vetements-enfants", name: "Vêtements enfants", slug: "vetements-enfants" },
      { id: "jouets", name: "Jouets & Jeux", slug: "jouets-jeux" },
      { id: "puericulture", name: "Puériculture", slug: "puericulture" },
      { id: "meubles-enfant", name: "Mobilier enfant", slug: "mobilier-enfant" }
    ]
  },
  {
    id: "sports",
    name: "Sports & Loisirs",
    slug: "sports",
    subcategories: [
      { id: "sport-individuel", name: "Sports individuels", slug: "sports-individuels" },
      { id: "sport-equipe", name: "Sports d'équipe", slug: "sports-equipe" },
      { id: "camping", name: "Camping & Randonnée", slug: "camping-randonnee" },
      { id: "instruments", name: "Instruments de musique", slug: "instruments-musique" }
    ]
  }
];

const initCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Vérifier si des catégories existent déjà
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`${existingCount} catégories existent déjà. Suppression...`);
      await Category.deleteMany({});
      console.log('Catégories existantes supprimées');
    }
    
    // Insérer les nouvelles catégories
    await Category.insertMany(categoriesData);
    console.log('Catégories et sous-catégories initialisées avec succès');
    
    mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories:', error);
    process.exit(1);
  }
};

// Exécuter le script si appelé directement
if (require.main === module) {
  initCategories();
}

module.exports = initCategories;
