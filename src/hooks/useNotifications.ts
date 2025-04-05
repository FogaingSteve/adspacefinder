
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'new_listing' | 'message' | 'system';
  read: boolean;
  created_at: string;
  metadata?: {
    listingId?: string;
    senderId?: string;
    conversationId?: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setNotifications(data as Notification[]);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast(newNotification.title, {
          description: newNotification.message,
          action: {
            label: 'Voir',
            onClick: () => {
              markAsRead(newNotification.id);
              // Navigate based on notification type
              if (newNotification.type === 'message' && newNotification.metadata?.conversationId) {
                window.location.href = `/messages?conversation=${newNotification.metadata.conversationId}`;
              } else if (newNotification.type === 'new_listing' && newNotification.metadata?.listingId) {
                window.location.href = `/listings/${newNotification.metadata.listingId}`;
              }
            }
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  };
};

// Helper function to create a notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'new_listing' | 'message' | 'system',
  metadata?: {
    listingId?: string;
    senderId?: string;
    conversationId?: string;
  }
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      metadata
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};
