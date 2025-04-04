
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  listing_id?: string | null;
  read: boolean;
  sender?: {
    id: string;
    email: string;
    avatar_url?: string;
    name?: string;
  };
}

interface Conversation {
  user: {
    id: string;
    email: string;
    avatar_url?: string;
    name?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

const Messages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // Initialize conversations array
        const conversations: Conversation[] = [];
        
        // Get all messages where the user is either sender or receiver
        const { data: messages, error } = await supabase
          .from('messages')
          .select(`
            id, message, created_at, read, listing_id,
            sender_id, sender:sender_id(id, email, avatar_url, name),
            receiver_id, receiver:receiver_id(id, email, avatar_url, name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Process messages to group by conversation
        const conversationMap = new Map<string, Conversation>();
        
        messages?.forEach((message: any) => {
          const otherUserId = message.sender_id === user.id 
            ? message.receiver_id 
            : message.sender_id;
            
          const otherUser = message.sender_id === user.id 
            ? message.receiver 
            : message.sender;
            
          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              user: otherUser,
              lastMessage: message,
              unreadCount: (!message.read && message.receiver_id === user.id) ? 1 : 0
            });
          } else if (!message.read && message.receiver_id === user.id) {
            const conversation = conversationMap.get(otherUserId)!;
            conversation.unreadCount += 1;
          }
        });
        
        return Array.from(conversationMap.values());
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors du chargement des conversations");
        return [];
      }
    },
    enabled: !!user?.id
  });
  
  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', user?.id, selectedConversation],
    queryFn: async () => {
      if (!user?.id || !selectedConversation) return [];
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            id, message, created_at, read, listing_id,
            sender_id, sender:sender_id(id, email, avatar_url, name),
            receiver_id, receiver:receiver_id(id, email, avatar_url, name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConversation}),and(sender_id.eq.${selectedConversation},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        // Mark unread messages as read
        const unreadMessages = data?.filter(msg => 
          !msg.read && msg.receiver_id === user.id && msg.sender_id === selectedConversation
        );
        
        if (unreadMessages?.length) {
          await Promise.all(unreadMessages.map(msg => 
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', msg.id)
          ));
          
          // Update unread count in conversations
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Erreur lors du chargement des messages");
        return [];
      }
    },
    enabled: !!user?.id && !!selectedConversation,
    refetchInterval: 5000 // Poll for new messages every 5 seconds
  });
  
  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data: { receiverId: string, message: string, listingId?: string }) => {
      if (!user?.id) throw new Error("Vous devez être connecté");
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: data.receiverId,
          message: data.message,
          listing_id: data.listingId,
          read: false,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      setMessageText("");
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['messages', user?.id, selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  });
  
  // Set up realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        // Refresh data when new message arrives
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        if (selectedConversation) {
          queryClient.invalidateQueries({ queryKey: ['messages', user.id, selectedConversation] });
        }
        
        // Show notification for new message
        toast.success("Nouveau message reçu");
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient, selectedConversation]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    
    sendMessage.mutate({
      receiverId: selectedConversation,
      message: messageText
    });
  };
  
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: fr });
    } catch (e) {
      return "Date inconnue";
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Vous devez être connecté pour accéder à la messagerie</p>
              <Button className="mt-4" onClick={() => window.location.href = "/auth/signin"}>
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Messagerie</h1>
      
      <div className="grid gap-4 md:grid-cols-12 h-[70vh]">
        {/* Conversations List */}
        <Card className="md:col-span-4 flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Conversations</span>
              <Button size="sm" variant="ghost" onClick={() => refetchConversations()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {conversationsLoading ? (
                <div className="flex justify-center items-center h-full">
                  <span>Chargement...</span>
                </div>
              ) : conversations?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune conversation</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations?.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                        selectedConversation === conversation.user.id
                          ? "bg-primary/10"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedConversation(conversation.user.id)}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar_url} />
                        <AvatarFallback>
                          {conversation.user.name?.charAt(0) || conversation.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">
                            {conversation.user.name || conversation.user.email}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.message}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-400">
                            {formatTime(conversation.lastMessage.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Messages */}
        <Card className="md:col-span-8 flex flex-col h-full">
          {!selectedConversation ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Sélectionnez une conversation pour afficher les messages</p>
            </div>
          ) : (
            <>
              <CardHeader className="pb-2 border-b">
                <CardTitle>
                  {conversations?.find(c => c.user.id === selectedConversation)?.user?.name || 
                    conversations?.find(c => c.user.id === selectedConversation)?.user?.email || 
                    "Conversation"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <span>Chargement des messages...</span>
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucun message. Démarrez la conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div className="flex gap-2 max-w-[70%]">
                            {message.sender_id !== user.id && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.sender?.avatar_url} />
                                <AvatarFallback>
                                  {message.sender?.name?.charAt(0) || message.sender?.email?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <div
                                className={`rounded-lg p-3 ${
                                  message.sender_id === user.id
                                    ? "bg-primary text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                <p>{message.message}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Tapez votre message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={sendMessage.isPending || !messageText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
