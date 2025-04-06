
const { supabase } = require('../supabase');

/**
 * Synchronise une annonce de MongoDB vers Supabase pour déclencher les notifications
 * @param {Object} listing - L'annonce MongoDB à synchroniser avec Supabase
 */
const syncListingToSupabase = async (listing) => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized, skipping listing sync');
      return;
    }

    console.log('Synchronizing MongoDB listing to Supabase:', listing.title);

    // Convertir le listing MongoDB en format compatible avec Supabase
    const supabaseListing = {
      id: listing._id.toString(), // Convertir ObjectId en string
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      subcategory: listing.subcategory,
      location: listing.location,
      images: listing.images || [],
      user_id: listing.userId,
      is_sold: listing.isSold || false,
      favorites: listing.favorites || [],
      status: listing.status || 'pending',
      created_at: listing.createdAt || new Date().toISOString(),
      updated_at: listing.updatedAt || new Date().toISOString()
    };

    // Insérer ou mettre à jour l'annonce dans Supabase
    const { data, error } = await supabase
      .from('listings')
      .upsert(supabaseListing, { onConflict: 'id' })
      .select('id');

    if (error) {
      console.error('Error syncing listing to Supabase:', error);
      return false;
    }

    console.log('Successfully synced listing to Supabase:', data);
    return true;
  } catch (error) {
    console.error('Exception during listing sync to Supabase:', error);
    return false;
  }
};

/**
 * Supprime une annonce de Supabase lorsqu'elle est supprimée de MongoDB
 * @param {string} listingId - L'ID de l'annonce à supprimer
 */
const deleteListingFromSupabase = async (listingId) => {
  try {
    if (!supabase) {
      console.warn('Supabase client not initialized, skipping listing deletion');
      return;
    }

    console.log('Deleting listing from Supabase:', listingId);

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      console.error('Error deleting listing from Supabase:', error);
      return false;
    }

    console.log('Successfully deleted listing from Supabase');
    return true;
  } catch (error) {
    console.error('Exception during listing deletion from Supabase:', error);
    return false;
  }
};

module.exports = {
  syncListingToSupabase,
  deleteListingFromSupabase
};
