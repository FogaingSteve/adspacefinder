
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  listingId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche rapide par listingId
reviewSchema.index({ listingId: 1 });
// Index pour la recherche rapide par userId
reviewSchema.index({ userId: 1 });
// Index composé pour éviter les doublons (un utilisateur ne peut laisser qu'un avis par annonce)
reviewSchema.index({ userId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
