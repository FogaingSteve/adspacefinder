
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

-- Create a table for category subscriptions
CREATE TABLE IF NOT EXISTS category_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Add triggers to the listings table in your actual database
-- Note: This assumes you have a trigger setup to sync MongoDB listings with Supabase
CREATE TRIGGER on_new_listing
AFTER INSERT ON listings
FOR EACH ROW
EXECUTE FUNCTION handle_new_listing();
