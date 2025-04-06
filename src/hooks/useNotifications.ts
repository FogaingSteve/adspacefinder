
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new_listing' | 'message' | 'system';
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Vérifiez d'abord si la table existe
      const { data: tableData, error: tableError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking notifications table:', tableError);
        if (tableError.code === '42P01') {
          // Table doesn't exist
          console.log('Notifications table does not exist yet');
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }
      }
      
      // La table existe, nous pouvons interroger
      // Requête modifiée pour utiliser uniquement les champs existants
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Adapter les champs si nécessaire
      const formattedNotifications = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.created_at,
        metadata: notification.metadata
      }));
      
      setNotifications(formattedNotifications);
      
      // Compter les notifications non lues
      const unread = formattedNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Impossible de charger les notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Mettre à jour le compteur non lu
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Mettre à jour le compteur non lu
      setUnreadCount(0);
      
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error("Une erreur s'est produite");
    }
  };

  // Fonction pour supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Mettre à jour le compteur non lu si la notification supprimée n'était pas lue
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error("Une erreur s'est produite");
    }
  };

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!user?.id) return;
    
    // Charger les notifications existantes
    fetchNotifications();
    
    // S'abonner aux modifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new;
            
            // Formater la nouvelle notification
            const formattedNotification = {
              id: newNotification.id,
              title: newNotification.title,
              message: newNotification.message,
              type: newNotification.type,
              read: newNotification.read,
              createdAt: newNotification.created_at,
              metadata: newNotification.metadata
            };
            
            // Ajouter à l'état local
            setNotifications(prev => [formattedNotification, ...prev]);
            
            // Mettre à jour le compteur non lu
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1);
            }
            
            // Afficher une notification du système
            toast(formattedNotification.title, {
              description: formattedNotification.message,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Mettre à jour l'état local
            setNotifications(prev => 
              prev.map(n => 
                n.id === payload.new.id ? {
                  ...n,
                  title: payload.new.title,
                  message: payload.new.message,
                  read: payload.new.read
                } : n
              )
            );
            
            // Recalculer le compteur non lu
            fetchNotifications();
          } else if (payload.eventType === 'DELETE') {
            // Supprimer de l'état local
            const deletedNotification = notifications.find(n => n.id === payload.old.id);
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            
            // Mettre à jour le compteur non lu si nécessaire
            if (deletedNotification && !deletedNotification.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
}
