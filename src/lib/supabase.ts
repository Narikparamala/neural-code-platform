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

// Database types based on the schema
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
  receiver?: UserProfile;
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

// Supabase service functions
export class SupabaseService {
  // Auth functions
  static async signUp(email: string, password: string, userData: { username: string; userID: string; bio?: string; deviceID: string }) {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser.user) {
        throw new Error('User already logged in');
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData.username,
            user_id: userData.userID
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            auth_user_id: data.user.id,
            username: userData.username,
            user_id: userData.userID,
            bio: userData.bio || 'Consciousness explorer and neural researcher',
            device_id: userData.deviceID,
            is_verified: false
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        return { data: { ...data, profile }, error: null };
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        return { data: { user, profile }, error: null };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // User Profile functions
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async searchUsers(query: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`username.ilike.%${query}%,user_id.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async followUser(followerId: string, followingId: string) {
    try {
      // Get current follower's profile
      const { data: followerProfile, error: followerError } = await supabase
        .from('user_profiles')
        .select('following')
        .eq('id', followerId)
        .maybeSingle();

      if (followerError) throw followerError;

      // Get current following's profile
      const { data: followingProfile, error: followingError } = await supabase
        .from('user_profiles')
        .select('followers')
        .eq('id', followingId)
        .maybeSingle();

      if (followingError) throw followingError;

      const currentFollowing = followerProfile.following || [];
      const currentFollowers = followingProfile.followers || [];

      const isFollowing = currentFollowing.includes(followingId);

      if (isFollowing) {
        // Unfollow
        const newFollowing = currentFollowing.filter((id: string) => id !== followingId);
        const newFollowers = currentFollowers.filter((id: string) => id !== followerId);

        await supabase
          .from('user_profiles')
          .update({ following: newFollowing })
          .eq('id', followerId);

        await supabase
          .from('user_profiles')
          .update({ followers: newFollowers })
          .eq('id', followingId);
      } else {
        // Follow
        const newFollowing = [...currentFollowing, followingId];
        const newFollowers = [...currentFollowers, followerId];

        await supabase
          .from('user_profiles')
          .update({ following: newFollowing })
          .eq('id', followerId);

        await supabase
          .from('user_profiles')
          .update({ followers: newFollowers })
          .eq('id', followingId);

        // Create notification
        await this.createNotification(followingId, 'follow', `New follower: ${followerProfile.username}`, { followerId });
      }

      return { data: { isFollowing: !isFollowing }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Posts functions
  static async createPost(authorId: string, postData: Omit<Post, 'id' | 'author_id' | 'created_at' | 'likes' | 'comments' | 'shares'>) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: authorId,
          ...postData,
          likes: [],
          comments: [],
          shares: 0
        })
        .select(`
          *,
          author:user_profiles(*)
        `)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async getPosts(limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_profiles(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async likePost(postId: string, userId: string) {
    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('likes')
        .eq('id', postId)
        .maybeSingle();

      if (postError) throw postError;

      const currentLikes = post.likes || [];
      const isLiked = currentLikes.includes(userId);

      const newLikes = isLiked 
        ? currentLikes.filter((id: string) => id !== userId)
        : [...currentLikes, userId];

      const { data, error } = await supabase
        .from('posts')
        .update({ likes: newLikes })
        .eq('id', postId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data: { ...data, isLiked: !isLiked }, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async addComment(postId: string, userId: string, content: string) {
    try {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .maybeSingle();

      if (postError) throw postError;

      const currentComments = post.comments || [];
      const newComment = {
        id: Date.now().toString(),
        author_id: userId,
        content,
        timestamp: new Date().toISOString(),
        likes: []
      };

      const newComments = [...currentComments, newComment];

      const { data, error } = await supabase
        .from('posts')
        .update({ comments: newComments })
        .eq('id', postId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Chat functions
  static async sendMessage(senderId: string, receiverId: string, content: string, type: 'text' | 'preset' = 'text', preset?: any) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          type,
          preset
        })
        .select(`
          *,
          sender:user_profiles!sender_id(*),
          receiver:user_profiles!receiver_id(*)
        `)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async getMessages(userId1: string, userId2: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:user_profiles!sender_id(*),
          receiver:user_profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Notifications functions
  static async createNotification(userId: string, type: string, message: string, data: any = {}) {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          message,
          data,
          read: false
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data: notification, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async getNotifications(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  // Real-time subscriptions
  static subscribeToMessages(userId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id.eq.${userId},receiver_id.eq.${userId})`
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();
  }

  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id.eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }

  static subscribeToNewPosts(callback: (post: Post) => void) {
    return supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          callback(payload.new as Post);
        }
      )
      .subscribe();
  }
}