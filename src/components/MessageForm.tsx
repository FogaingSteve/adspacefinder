
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageFormProps {
  recipientId: string;
  conversationId?: string;
  onMessageSent?: (conversationId: string) => void;
}

export function MessageForm({ recipientId, conversationId: existingConversationId, onMessageSent }: MessageFormProps) {
  const { user } = useAuth();
  const { getUserOnlineStatus } = useOnlineStatus();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<{ isOnline: boolean, lastSeen: Date | null }>({ isOnline: false, lastSeen: null });

  // Fetch recipient status
  useState(() => {
    const fetchStatus = async () => {
      if (recipientId) {
        const status = await getUserOnlineStatus(recipientId);
        setRecipientStatus(status);
      }
    };
    
    fetchStatus();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !message.trim() || !recipientId) return;
    
    setIsLoading(true);
    
    try {
      let conversationId = existingConversationId;
      
      // If no conversation exists, create one
      if (!conversationId) {
        // Check if a conversation already exists between these users
        const { data: existingConversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .or(`user1_id.eq.${recipientId},user2_id.eq.${recipientId}`);
          
        if (convError) throw convError;
        
        if (existingConversations && existingConversations.length > 0) {
          conversationId = existingConversations[0].id;
        } else {
          // Create new conversation
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
              user1_id: user.id,
              user2_id: recipientId,
              last_message_time: new Date().toISOString()
            })
            .select('id')
            .single();
            
          if (createError) throw createError;
          conversationId = newConversation.id;
        }
      }
      
      // Send the message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: message,
          read: false,
          created_at: new Date().toISOString()
        });
        
      if (messageError) throw messageError;
      
      // Clear the message input
      setMessage('');
      
      // Callback
      if (onMessageSent && conversationId) {
        onMessageSent(conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-medium">Status:</h3>
        {recipientStatus.isOnline ? (
          <Badge variant="success" className="bg-green-500">
            <span className="mr-1 h-2 w-2 rounded-full bg-white inline-block"></span>
            En ligne
          </Badge>
        ) : (
          <Badge variant="secondary">
            {recipientStatus.lastSeen ? 
              `Vu ${formatDistanceToNow(recipientStatus.lastSeen, { locale: fr, addSuffix: true })}` : 
              'Hors ligne'
            }
          </Badge>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="space-y-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading || !message.trim()}>
          {isLoading ? "Envoi..." : "Envoyer le message"}
        </Button>
      </form>
    </div>
  );
}
