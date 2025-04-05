import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract conversation ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const conversationIdFromUrl = urlParams.get('conversation');

  useEffect(() => {
    if (conversationIdFromUrl) {
      // Fetch the conversation from the URL
      const fetchConversationFromUrl = async () => {
        try {
          const { data: conversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationIdFromUrl)
            .single();

          if (error) {
            console.error('Error fetching conversation:', error);
            toast.error('Erreur lors du chargement de la conversation.');
            return;
          }

          if (conversation) {
            setSelectedConversation(conversation);
          }
        } catch (error) {
          console.error('Unexpected error:', error);
          toast.error('Erreur inattendue.');
        }
      };

      fetchConversationFromUrl();
    }
  }, [conversationIdFromUrl]);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch conversations for the current user
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching conversations:', error);
          toast.error('Erreur lors du chargement des conversations.');
          return;
        }

        setConversations(data);

        // If a conversation ID is in the URL, select it
        if (conversationIdFromUrl) {
          const initialConversation = data.find(c => c.id === conversationIdFromUrl);
          if (initialConversation) {
            setSelectedConversation(initialConversation);
          }
        } else if (data.length > 0 && !selectedConversation) {
          // Select the first conversation if none is selected
          setSelectedConversation(data[0]);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Erreur inattendue.');
      }
    };

    fetchConversations();

    // Subscribe to conversation changes
    const conversationSubscription = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchConversations();
          }
        })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationSubscription);
    };
  }, [user?.id, conversationIdFromUrl, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      // Fetch messages for the selected conversation
      const fetchMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', selectedConversation.id)
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error fetching messages:', error);
            toast.error('Erreur lors du chargement des messages.');
            return;
          }

          setMessages(data);
        } catch (error) {
          console.error('Unexpected error:', error);
          toast.error('Erreur inattendue.');
        }
      };

      fetchMessages();

      // Subscribe to message changes
      const messageSubscription = supabase
        .channel(`public:messages:conversation_id=eq.${selectedConversation.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' },
          payload => {
            if (payload.eventType === 'INSERT') {
              // Optimistically add the new message to the state
              setMessages(prevMessages => [...prevMessages, payload.new as Message]);
            }
          })
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (selectedConversation) {
      // Determine the recipient user
      const recipientId = selectedConversation.user1_id === user?.id ? selectedConversation.user2_id : selectedConversation.user1_id;

      const fetchRecipient = async () => {
        try {
          const { data: fetchedUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', recipientId)
            .single();

          if (error) {
            console.error('Error fetching recipient:', error);
            toast.error('Erreur lors du chargement du destinataire.');
            return;
          }

          setRecipient(fetchedUser);
        } catch (error) {
          console.error('Unexpected error:', error);
          toast.error('Erreur inattendue.');
        }
      };

      fetchRecipient();
    } else {
      setRecipient(null);
    }
  }, [selectedConversation, user?.id]);

  const sendMessage = async () => {
    if (!user?.id || !selectedConversation?.id || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          recipient_id: recipient?.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Erreur lors de l\'envoi du message.');
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erreur inattendue.');
    }
  };

  const createConversation = async (otherUserId: string) => {
    if (!user?.id) return;

    try {
      // Check if a conversation already exists
      const { data: existingConversation, error: existingError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single();

      if (existingError) {
        console.error('Error checking existing conversation:', existingError);
        toast.error('Erreur lors de la vérification de la conversation existante.');
        return;
      }

      if (existingConversation) {
        // Select the existing conversation
        setSelectedConversation(existingConversation);
        return;
      }

      // Create a new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        toast.error('Erreur lors de la création de la conversation.');
        return;
      }

      // Add the new conversation to the state
      setConversations(prevConversations => [...prevConversations, data]);
      // Select the new conversation
      setSelectedConversation(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erreur inattendue.');
    }
  };

  return (
    <div className="container mx-auto py-8 h-screen">
      <div className="flex h-full">
        {/* Conversation List */}
        <div className="w-1/4 bg-gray-100 border-r p-4">
          <h2 className="font-bold mb-4">Conversations</h2>
          <ScrollArea className="h-[calc(100vh - 150px)]">
            {conversations.map((conversation) => {
              const recipientId = conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id;
              const recipient = recipientId === recipient?.id ? recipient : null;

              return (
                <div
                  key={conversation.id}
                  className={`p-2 rounded cursor-pointer ${selectedConversation?.id === conversation.id ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  {recipient ? (
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={recipient?.user_metadata?.avatar_url || ""} />
                        <AvatarFallback>{recipient?.user_metadata?.name?.slice(0, 2).toUpperCase() || recipient?.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>{recipient?.user_metadata?.name || recipient?.email}</span>
                    </div>
                  ) : (
                    <span>Chargement...</span>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-gray-50 border-b p-4">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={recipient?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback>{recipient?.user_metadata?.name?.slice(0, 2).toUpperCase() || recipient?.email?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="font-bold">{recipient?.user_metadata?.name || recipient?.email}</h2>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-scroll">
                <ScrollArea className="h-[calc(100vh - 250px)]">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const messageDate = new Date(message.created_at);
                    const showDateHeader = index === 0 || !isSameDay(new Date(messages[index - 1].created_at), messageDate);

                    return (
                      <div key={message.id}>
                        {showDateHeader && (
                          <div className="text-center text-gray-500 my-2">
                            {format(messageDate, 'PPP', { locale: fr })}
                          </div>
                        )}
                        <div className={`mb-2 flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          <div className={`px-3 py-2 rounded-lg ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {message.content}
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Écrire un message..."
                    className="flex-1 rounded-l-md"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    className="rounded-l-none"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Envoyer
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">Sélectionnez une conversation pour afficher les messages.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
