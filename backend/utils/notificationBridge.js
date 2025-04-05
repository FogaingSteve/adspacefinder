
const { supabase } = require('../supabase');
const Listing = require('../models/Listing');

/**
 * Creates a notification in Supabase for a new listing
 * @param {Object} listing - The listing object from MongoDB
 */
async function notifyNewListing(listing) {
  try {
    // Get potential subscribers for this category
    const { data: subscribers, error: subError } = await supabase
      .from('category_subscriptions')
      .select('user_id')
      .eq('category_id', listing.category);
    
    if (subError) throw subError;
    
    // Create notifications for each subscriber
    if (subscribers && subscribers.length > 0) {
      const notifications = subscribers.map(sub => ({
        user_id: sub.user_id,
        title: 'Nouvelle annonce dans une catégorie suivie',
        message: `Une nouvelle annonce "${listing.title}" a été publiée dans une catégorie que vous suivez`,
        type: 'new_listing',
        read: false,
        created_at: new Date().toISOString(),
        metadata: {
          listingId: listing._id.toString()
        }
      }));
      
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (notifyError) throw notifyError;
      
      console.log(`Created ${notifications.length} notifications for new listing`);
    }
  } catch (error) {
    console.error('Error creating listing notifications:', error);
  }
}

/**
 * Creates a notification in Supabase for a new message
 * @param {String} recipientId - The user ID of the message recipient
 * @param {String} senderId - The user ID of the message sender
 * @param {String} conversationId - The conversation ID
 * @param {String} messagePreview - A preview of the message content
 */
async function notifyNewMessage(recipientId, senderId, conversationId, messagePreview) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: 'Nouveau message',
        message: messagePreview.substring(0, 100) + (messagePreview.length > 100 ? '...' : ''),
        type: 'message',
        read: false,
        created_at: new Date().toISOString(),
        metadata: {
          senderId,
          conversationId
        }
      });
    
    if (error) throw error;
    
    console.log(`Created message notification for user ${recipientId}`);
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
}

/**
 * Creates a system notification in Supabase
 * @param {String} userId - The user ID to notify
 * @param {String} title - The notification title
 * @param {String} message - The notification message
 * @param {Object} metadata - Optional additional data
 */
async function createSystemNotification(userId, title, message, metadata = {}) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: 'system',
        read: false,
        created_at: new Date().toISOString(),
        metadata
      });
    
    if (error) throw error;
    
    console.log(`Created system notification for user ${userId}`);
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
}

module.exports = {
  notifyNewListing,
  notifyNewMessage,
  createSystemNotification
};
