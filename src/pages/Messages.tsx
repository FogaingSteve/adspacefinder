
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageForm } from "@/components/MessageForm";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_time: string;
  otherUser: {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    last_seen?: string;
    is_online?: boolean;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const { isUserOnline } = useOnlineStatus();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  
  // Extract conversationId from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get('conversation');
    
    if (conversationId) {
      setSelectedConversation(conversationId);
    }
    
    // If there's a sellerId in the state, prepare to start a new conversation
    if (location.state?.sellerId) {
      loadUserData(location.state.sellerId);
    }
  }, [location]);
  
  // Fetch conversations
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        // Fetch conversations
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('last_message_time', { ascending: false });
          
        if (error) throw error;
        
        if (!conversationsData || conversationsData.length === 0) {
          setIsLoadingConversations(false);
          return;
        }
        
        // Process each conversation to get the other user's details
        const processedConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
            
            // Get other user details
            let otherUserData;
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', otherUserId)
              .single();
            
            if (userError) {
              console.error('Error fetching user data:', userError);
              otherUserData = { id: otherUserId };
            } else {
              otherUserData = userData;
            }
            
            // Get last message in conversation
            const { data: lastMessageData, error: messageError } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (messageError && messageError.code !== 'PGRST116') {
              console.error('Error fetching last message:', messageError);
            }
            
            return {
              ...conv,
              otherUser: otherUserData,
              lastMessage: lastMessageData
            };
          })
        );
        
        setConversations(processedConversations);
        
        // If no conversation is selected yet and we have conversations,
        // select the first one
        if (!selectedConversation && processedConversations.length > 0) {
          setSelectedConversation(processedConversations[0].id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to new conversations
    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations', filter: `user1_id=eq.${user.id}` },
        () => fetchConversations()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations', filter: `user2_id=eq.${user.id}` },
        () => fetchConversations()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);
  
  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;
    
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        // Find the current conversation
        const currentConv = conversations.find(c => c.id === selectedConversation);
        if (currentConv) {
          setOtherUser(currentConv.otherUser);
        } else {
          // If we can't find it in our list (new conversation), fetch it
          const { data: convData, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', selectedConversation)
            .single();
            
          if (convError) throw convError;
          
          const otherUserId = convData.user1_id === user.id ? convData.user2_id : convData.user1_id;
          await loadUserData(otherUserId);
        }
        
        // Fetch messages
        const { data: messagesData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setMessages(messagesData);
        
        // Mark messages as read
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('conversation_id', selectedConversation)
          .eq('recipient_id', user.id)
          .eq('read', false);
          
        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${selectedConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation}`
      }, () => fetchMessages())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, user?.id, conversations]);
  
  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setOtherUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
      setOtherUser({ id: userId });
    }
  };
  
  const formatMessageDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'Pp', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  // Updated to handle the possibility of no parameters
  const handleMessageSent = () => {
    if (selectedConversation) {
      // Add URL parameter for the conversation
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', selectedConversation);
      window.history.pushState({}, '', url.toString());
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Vous devez être connecté pour voir vos messages</h2>
              <Button asChild>
                <Link to="/auth/signin">Se connecter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingConversations ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucune conversation
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? "bg-primary/10"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={conversation.otherUser?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(conversation.otherUser?.full_name || conversation.otherUser?.email || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <p className="font-medium truncate flex-1">
                              {conversation.otherUser?.full_name || conversation.otherUser?.email || "Utilisateur"}
                            </p>
                            {isUserOnline(conversation.otherUser.id) && (
                              <div className="h-2.5 w-2.5 rounded-full bg-green-500 ml-2"></div>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage.content}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {conversation.last_message_time ? 
                              formatMessageDate(conversation.last_message_time) : 
                              "Nouvelle conversation"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {otherUser ? (
                  <div className="flex items-center">
                    <Avatar className="mr-2">
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(otherUser?.full_name || otherUser?.email || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {otherUser.full_name || otherUser.email || "Utilisateur"}
                      {isUserOnline(otherUser.id) && (
                        <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-green-500"></span>
                      )}
                    </span>
                  </div>
                ) : location.state?.sellerId ? (
                  "Nouvelle conversation"
                ) : (
                  "Sélectionnez une conversation"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : selectedConversation || location.state?.sellerId ? (
                <div>
                  {messages.length > 0 ? (
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.sender_id === user.id
                              ? "bg-primary/10 ml-auto"
                              : "bg-gray-100"
                          } max-w-[80%] ${
                            msg.sender_id === user.id ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {formatMessageDate(msg.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 mb-6">
                      Aucun message. Commencez la conversation !
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <MessageForm
                    recipientId={otherUser?.id || location.state?.sellerId}
                    recipientName={otherUser?.full_name || otherUser?.email || "Utilisateur"}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Sélectionnez une conversation pour voir les messages
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
