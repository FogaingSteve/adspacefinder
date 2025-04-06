
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useOnlineStatus() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  
  // Update user's online status
  useEffect(() => {
    if (!user?.id) return;
    
    // Set user as online when component mounts
    const updateStatus = async () => {
      try {
        const { error } = await supabase
          .from('user_status')
          .upsert({
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (error) console.error('Error updating online status:', error);
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };
    
    updateStatus();
    
    // Set up heartbeat to keep user online status active
    const heartbeatInterval = setInterval(updateStatus, 60000); // Every minute
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      updateStatus();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set user as offline when component unmounts
    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Only run if the page is actually closing (not on hot reloads)
      if (document.visibilityState === 'hidden') {
        supabase
          .from('user_status')
          .upsert({
            user_id: user.id,
            is_online: false,
            last_seen: new Date().toISOString()
          }, { onConflict: 'user_id' })
          .then(() => {
            console.log('User set to offline');
          })
          .catch(error => {
            console.error('Error setting offline status:', error);
          });
      }
    };
  }, [user?.id]);
  
  // Subscribe to online status changes
  useEffect(() => {
    const channel = supabase
      .channel('public:user_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_status'
      }, payload => {
        if (payload.new && typeof payload.new === 'object') {
          const userData = payload.new as any;
          if (userData.user_id && userData.is_online !== undefined) {
            setOnlineUsers(prev => ({
              ...prev,
              [userData.user_id]: userData.is_online
            }));
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Fetch a specific user's online status
  const getUserOnlineStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_status')
        .select('is_online, last_seen')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      return {
        isOnline: data?.is_online || false,
        lastSeen: data?.last_seen ? new Date(data.last_seen) : null
      };
    } catch (error) {
      console.error('Error fetching user online status:', error);
      return { isOnline: false, lastSeen: null };
    }
  };
  
  const isUserOnline = (userId: string) => onlineUsers[userId] || false;
  
  return {
    isUserOnline,
    getUserOnlineStatus,
    onlineUsers
  };
}
