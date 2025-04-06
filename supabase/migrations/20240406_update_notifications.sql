
-- Drop existing tables if they exist to recreate them with correct schema
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS category_subscriptions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- Create notifications table with correct schema
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Will reference auth.users
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_listing', 'message', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT NULL
);

-- Add index on user_id for faster queries
CREATE INDEX notifications_user_id_idx ON notifications(user_id);

-- Add index on read status for faster unread counts
CREATE INDEX notifications_read_idx ON notifications(read);

-- Create a table for category subscriptions
CREATE TABLE category_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- Will reference auth.users
  category_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL, -- Will reference auth.users
  recipient_id UUID NOT NULL, -- Will reference auth.users
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on conversation_id for faster queries
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL, -- Will reference auth.users
  user2_id UUID NOT NULL, -- Will reference auth.users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create index on users for faster queries
CREATE INDEX conversations_user1_id_idx ON conversations(user1_id);
CREATE INDEX conversations_user2_id_idx ON conversations(user2_id);

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
