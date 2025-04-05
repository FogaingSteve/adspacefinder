
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  throw new Error('Please set a valid VITE_SUPABASE_URL in your .env file')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error('Please set a valid VITE_SUPABASE_ANON_KEY in your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize Supabase tables and functions if needed
export const initializeSupabase = async () => {
  try {
    console.log('Checking if notifications table exists...')
    
    // Check if notifications table exists
    const { data: notificationsTable, error: tableError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.log('Notifications table does not exist, initializing...')
      
      // Create notifications table and related functions
      const migrationSQL = `
        -- Create notifications table
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

        -- Create function to handle new message notifications
        CREATE OR REPLACE FUNCTION handle_new_message()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Insert a notification for the recipient
          INSERT INTO notifications (user_id, title, message, type, metadata)
          VALUES (
            NEW.recipient_id,
            'Nouveau message',
            'Vous avez reçu un nouveau message',
            'message',
            jsonb_build_object(
              'senderId', NEW.sender_id,
              'conversationId', NEW.conversation_id
            )
          );
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for new messages
        DROP TRIGGER IF EXISTS on_new_message ON messages;
        CREATE TRIGGER on_new_message
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_message();

        -- Create function to handle new listing notifications
        CREATE OR REPLACE FUNCTION handle_new_listing()
        RETURNS TRIGGER AS $$
        DECLARE
          user_record RECORD;
        BEGIN
          -- For each user who has subscribed to this category
          FOR user_record IN 
            SELECT user_id FROM category_subscriptions 
            WHERE category_id = NEW.category 
          LOOP
            -- Insert a notification
            INSERT INTO notifications (user_id, title, message, type, metadata)
            VALUES (
              user_record.user_id,
              'Nouvelle annonce dans une catégorie suivie',
              'Une nouvelle annonce a été publiée dans une catégorie que vous suivez',
              'new_listing',
              jsonb_build_object('listingId', NEW.id)
            );
          END LOOP;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create a table for category subscriptions if not exists
        CREATE TABLE IF NOT EXISTS category_subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          category_id TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, category_id)
        );

        -- Create messages table if not exists
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          conversation_id UUID NOT NULL,
          sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create index on conversation_id for faster queries
        CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);

        -- Create conversations table if not exists
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user1_id, user2_id)
        );

        -- Create index on users for faster queries
        CREATE INDEX IF NOT EXISTS conversations_user1_id_idx ON conversations(user1_id);
        CREATE INDEX IF NOT EXISTS conversations_user2_id_idx ON conversations(user2_id);
      `
      
      // Execute the migration SQL
      const { error: migrationError } = await supabase.rpc('pgql', { query: migrationSQL })
      
      if (migrationError) {
        console.error('Error running migration:', migrationError)
        // If this fails, we still want to continue to use the app
      } else {
        console.log('Migration successful, Supabase tables and functions initialized')
      }
    } else {
      console.log('Supabase tables already initialized')
    }
  } catch (error) {
    console.error('Error checking/initializing Supabase tables:', error)
  }
}

// Call the initialization function when the app loads
if (typeof window !== 'undefined') {
  initializeSupabase()
}
