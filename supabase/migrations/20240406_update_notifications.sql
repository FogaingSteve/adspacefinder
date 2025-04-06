
-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to recreate them with correct schema
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS category_subscriptions;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS user_status;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table with correct schema
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
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
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on conversation_id for faster queries
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Create index on users for faster queries
CREATE INDEX conversations_user1_id_idx ON conversations(user1_id);
CREATE INDEX conversations_user2_id_idx ON conversations(user2_id);

-- Create user_status table to track online status
CREATE TABLE user_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update user online status
CREATE OR REPLACE FUNCTION update_user_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_seen timestamp
  UPDATE profiles 
  SET 
    is_online = NEW.is_online,
    last_seen = NEW.last_seen,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user status updates
DROP TRIGGER IF EXISTS on_user_status_update ON user_status;
CREATE TRIGGER on_user_status_update
AFTER INSERT OR UPDATE ON user_status
FOR EACH ROW
EXECUTE FUNCTION update_user_status();

-- Create function to handle new message notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation last message time
  UPDATE conversations
  SET last_message_time = NOW()
  WHERE id = NEW.conversation_id;
  
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

-- Create function to handle new listing notifications for all users
CREATE OR REPLACE FUNCTION handle_new_listing_for_all()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- For each user except the creator
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id != NEW.user_id
  LOOP
    -- Insert a notification
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      user_record.id,
      'Nouvelle annonce publiée',
      'Une nouvelle annonce "' || NEW.title || '" vient d''être publiée',
      'new_listing',
      jsonb_build_object('listingId', NEW.id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new listings to notify all users
DROP TRIGGER IF EXISTS on_new_listing_all ON public.listings;
CREATE TRIGGER on_new_listing_all
AFTER INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION handle_new_listing_for_all();

-- Create function to handle new listing notifications for category subscribers
CREATE OR REPLACE FUNCTION handle_new_listing_category()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- For each user who has subscribed to this category
  FOR user_record IN 
    SELECT user_id FROM category_subscriptions 
    WHERE category_id = NEW.category
  LOOP
    -- Only insert if user is not already notified (is not the creator)
    IF user_record.user_id != NEW.user_id THEN
      -- Insert a notification
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (
        user_record.user_id,
        'Nouvelle annonce dans une catégorie suivie',
        'Une nouvelle annonce "' || NEW.title || '" a été publiée dans une catégorie que vous suivez',
        'new_listing',
        jsonb_build_object('listingId', NEW.id)
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new listings to notify category subscribers
DROP TRIGGER IF EXISTS on_new_listing_category ON public.listings;
CREATE TRIGGER on_new_listing_category
AFTER INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION handle_new_listing_category();

-- Create a listings table if it doesn't exist (for the triggers to work)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  is_sold BOOLEAN DEFAULT FALSE,
  favorites UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
