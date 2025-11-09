/*
  # Create users table and authentication system

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `user_id` (text, unique) - Custom user ID like @username
      - `bio` (text)
      - `avatar` (text)
      - `device_id` (text, unique)
      - `is_verified` (boolean)
      - `join_date` (timestamp)
      - `followers` (jsonb)
      - `following` (jsonb)
      - `stats` (jsonb)
      - `preferences` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `posts`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references user_profiles)
      - `content` (text)
      - `type` (text)
      - `media` (jsonb)
      - `preset` (jsonb)
      - `tags` (text[])
      - `likes` (jsonb)
      - `comments` (jsonb)
      - `shares` (integer)
      - `created_at` (timestamp)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references user_profiles)
      - `receiver_id` (uuid, references user_profiles)
      - `content` (text)
      - `type` (text)
      - `preset` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Unique constraints for device_id and user_id
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  user_id text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar text DEFAULT '🧠',
  device_id text UNIQUE NOT NULL,
  is_verified boolean DEFAULT false,
  join_date timestamptz DEFAULT now(),
  followers jsonb DEFAULT '[]'::jsonb,
  following jsonb DEFAULT '[]'::jsonb,
  stats jsonb DEFAULT '{"totalSessions": 0, "totalTime": 0, "favoriteFrequency": 10, "level": 1}'::jsonb,
  preferences jsonb DEFAULT '{"notifications": true, "publicProfile": true, "allowRandomChat": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text' CHECK (type IN ('text', 'preset', 'research', 'image')),
  media jsonb DEFAULT '[]'::jsonb,
  preset jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  likes jsonb DEFAULT '[]'::jsonb,
  comments jsonb DEFAULT '[]'::jsonb,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text' CHECK (type IN ('text', 'preset')),
  preset jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view public profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    (preferences->>'publicProfile')::boolean = true 
    OR auth_user_id = auth.uid()
    OR id IN (
      SELECT jsonb_array_elements_text(following)::uuid 
      FROM user_profiles 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Create policies for posts
CREATE POLICY "Anyone can view posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Create policies for chat_messages
CREATE POLICY "Users can view their messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    OR receiver_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- Create policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_device_id ON user_profiles(device_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();