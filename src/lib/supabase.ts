import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface UserProfile {
  id: string;
  auth_user_id: string;
  username: string;
  user_id: string;
  bio: string;
  avatar: string;
  device_id: string;
  is_verified: boolean;
  join_date: string;
  followers: string[];
  following: string[];
  stats: {
    totalSessions: number;
    totalTime: number;
    favoriteFrequency: number;
    level: number;
  };
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    allowRandomChat: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  type: 'text' | 'preset' | 'research' | 'image';
  media: string[];
  preset?: {
    name: string;
    frequency: number;
    carrier: number;
    description: string;
  };
  tags: string[];
  likes: string[];
  comments: Array<{
    id: string;
    author_id: string;
    content: string;
    timestamp: string;
    likes: string[];
  }>;
  shares: number;
  created_at: string;
  author?: UserProfile;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'preset';
  preset?: any;
  created_at: string;
  sender?: UserProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}