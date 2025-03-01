
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer une catégorie par son ID
router.get('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    res.json(category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer une sous-catégorie par son ID
router.get('/:categoryId/:subcategoryId', async (req, res) => {
  try {
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    const subcategory = category.subcategories.find(sub => sub.id === req.params.subcategoryId);
    if (!subcategory) {
      return res.status(404).json({ message: 'Sous-catégorie non trouvée' });
    }

    res.json({ category, subcategory });
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer une nouvelle catégorie (admin seulement)
router.post('/', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin (à implémenter)
    const { name, id, slug, subcategories } = req.body;
    
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Cette catégorie existe déjà' });
    }
    
    const newCategory = new Category({
      name,
      id,
      slug,
      subcategories: subcategories || []
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter une sous-catégorie à une catégorie (admin seulement)
router.post('/:categoryId/subcategories', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin (à implémenter)
    const { name, id, slug } = req.body;
    
    const category = await Category.findOne({ id: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si la sous-catégorie existe déjà
    const subcategoryExists = category.subcategories.some(sub => sub.slug === slug);
    if (subcategoryExists) {
      return res.status(400).json({ message: 'Cette sous-catégorie existe déjà' });
    }
    
    category.subcategories.push({ name, id, slug });
    const updatedCategory = await category.save();
    
    res.status(201).json(updatedCategory);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la sous-catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour une catégorie (admin seulement)
router.put('/:categoryId', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin (à implémenter)
    const { name, slug } = req.body;
    
    const updatedCategory = await Category.findOneAndUpdate(
      { id: req.params.categoryId },
      { name, slug },
      { new: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une catégorie (admin seulement)
router.delete('/:categoryId', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un admin (à implémenter)
    const deletedCategory = await Category.findOneAndDelete({ id: req.params.categoryId });
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
