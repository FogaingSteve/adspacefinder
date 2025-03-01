
const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [SubcategorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
