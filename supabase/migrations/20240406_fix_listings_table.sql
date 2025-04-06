
-- Extension pour générer des UUID si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vérifier si la table listings existe, sinon la créer
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
    CREATE TABLE public.listings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      location TEXT NOT NULL,
      images TEXT[] DEFAULT ARRAY[]::TEXT[],
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      is_sold BOOLEAN DEFAULT FALSE,
      favorites UUID[] DEFAULT ARRAY[]::UUID[],
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Index pour améliorer les performances des requêtes
    CREATE INDEX listings_user_id_idx ON public.listings(user_id);
    CREATE INDEX listings_category_idx ON public.listings(category);
    CREATE INDEX listings_status_idx ON public.listings(status);

    RAISE NOTICE 'Table listings créée avec succès';
  ELSE
    RAISE NOTICE 'La table listings existe déjà';
  END IF;
END
$$;

-- Vérifier si les tables notifications et autres existent, sinon les créer
DO $$
BEGIN
  -- Créer la table notifications si elle n'existe pas
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE TABLE public.notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('new_listing', 'message', 'system')),
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      metadata JSONB DEFAULT NULL
    );

    -- Indices pour améliorer les performances
    CREATE INDEX notifications_user_id_idx ON public.notifications(user_id);
    CREATE INDEX notifications_read_idx ON public.notifications(read);

    RAISE NOTICE 'Table notifications créée avec succès';
  ELSE
    RAISE NOTICE 'La table notifications existe déjà';
  END IF;

  -- Créer la table user_status si elle n'existe pas
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_status') THEN
    CREATE TABLE public.user_status (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      is_online BOOLEAN DEFAULT FALSE,
      last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    RAISE NOTICE 'Table user_status créée avec succès';
  ELSE
    RAISE NOTICE 'La table user_status existe déjà';
  END IF;

  -- Créer la table messages si elle n'existe pas
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    CREATE TABLE public.messages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      conversation_id UUID NOT NULL,
      sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Index pour améliorer les performances
    CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id);
    CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
    CREATE INDEX messages_recipient_id_idx ON public.messages(recipient_id);

    RAISE NOTICE 'Table messages créée avec succès';
  ELSE
    RAISE NOTICE 'La table messages existe déjà';
  END IF;

  -- Créer la table conversations si elle n'existe pas
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversations') THEN
    CREATE TABLE public.conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user1_id, user2_id)
    );

    -- Index pour améliorer les performances
    CREATE INDEX conversations_user1_id_idx ON public.conversations(user1_id);
    CREATE INDEX conversations_user2_id_idx ON public.conversations(user2_id);

    RAISE NOTICE 'Table conversations créée avec succès';
  ELSE
    RAISE NOTICE 'La table conversations existe déjà';
  END IF;
END
$$;

-- Créer la fonction pour les notifications de nouveaux messages
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le temps du dernier message dans la conversation
  UPDATE conversations
  SET last_message_time = NOW()
  WHERE id = NEW.conversation_id;
  
  -- Insérer une notification pour le destinataire
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

-- Créer ou remplacer le déclencheur pour les nouveaux messages
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION handle_new_message();

-- Créer la fonction pour les notifications de nouvelles annonces
CREATE OR REPLACE FUNCTION handle_new_listing_notification()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Pour chaque utilisateur sauf le créateur
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id != NEW.user_id
  LOOP
    -- Insérer une notification
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      user_record.id,
      'Nouvelle annonce publiée',
      'Une nouvelle annonce "' || NEW.title || '" vient d''être publiée',
      'new_listing',
      jsonb_build_object('listingId', NEW.id, 'userId', NEW.user_id)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer ou remplacer le déclencheur pour les nouvelles annonces
DROP TRIGGER IF EXISTS on_new_listing_notification ON public.listings;
CREATE TRIGGER on_new_listing_notification
AFTER INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION handle_new_listing_notification();

-- Mettre à jour la table profiles pour inclure is_online et last_seen si elle existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Vérifier si la colonne is_online existe déjà
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_online') THEN
      ALTER TABLE public.profiles ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
      RAISE NOTICE 'Colonne is_online ajoutée à profiles';
    END IF;
    
    -- Vérifier si la colonne last_seen existe déjà
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_seen') THEN
      ALTER TABLE public.profiles ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE 'Colonne last_seen ajoutée à profiles';
    END IF;
  END IF;
END
$$;

-- Mettre à jour le déclencheur pour que user_status mette à jour profiles
CREATE OR REPLACE FUNCTION update_user_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le timestamp last_seen dans profiles si la table existe
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    UPDATE profiles 
    SET 
      is_online = NEW.is_online,
      last_seen = NEW.last_seen,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer ou remplacer le déclencheur pour les mises à jour de statut utilisateur
DROP TRIGGER IF EXISTS on_user_status_update ON user_status;
CREATE TRIGGER on_user_status_update
AFTER INSERT OR UPDATE ON user_status
FOR EACH ROW
EXECUTE FUNCTION update_user_status();

-- Notifier tous les utilisateurs qu'il y a une nouvelle annonce
CREATE OR REPLACE FUNCTION sync_mongodb_listing_to_supabase()
RETURNS TRIGGER AS $$
BEGIN
  -- Cette fonction sera déclenchée manuellement depuis le backend quand une annonce est créée dans MongoDB
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
