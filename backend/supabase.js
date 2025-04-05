
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase credentials. Notifications will not work.');
}

// Create Supabase client
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Run initial SQL scripts for tables if needed
async function initializeSupabaseTables() {
  if (!supabase) return;
  
  try {
    console.log('Initializing Supabase tables for notifications...');
    
    // Check if notifications table exists
    const { data, error } = await supabase.from('notifications').select('id').limit(1);
    
    if (error && error.code === '42P01') { // Table doesn't exist error code
      console.log('Creating notifications and related tables...');
      
      // SQL to create necessary tables
      const sql = `
        -- Create notifications table if not exists
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('new_listing', 'message', 'system')),
          read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT NULL
        );

        -- Add index on user_id for faster queries
        CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

        -- Add index on read status for faster unread counts
        CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);

        -- Create a table for category subscriptions if not exists
        CREATE TABLE IF NOT EXISTS category_subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          category_id TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, category_id)
        );

        -- Create messages table if not exists
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          conversation_id UUID NOT NULL,
          sender_id UUID NOT NULL,
          recipient_id UUID NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index on conversation_id for faster queries
        CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);

        -- Create conversations table if not exists
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user1_id UUID NOT NULL,
          user2_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user1_id, user2_id)
        );
      `;
      
      // Execute the SQL
      const { error: sqlError } = await supabase.rpc('pgql', { query: sql });
      
      if (sqlError) {
        console.error('Error creating Supabase tables:', sqlError);
      } else {
        console.log('Successfully created Supabase tables');
      }
    } else {
      console.log('Supabase tables already exist');
    }
  } catch (error) {
    console.error('Error initializing Supabase tables:', error);
  }
}

module.exports = {
  supabase,
  initializeSupabaseTables
};
