
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface MessageFormProps {
  recipientId: string;
  recipientName?: string;
  onMessageSent?: () => void;
  listingId?: string;
  listingTitle?: string;
}

export function MessageForm({
  recipientId,
  recipientName = "Vendeur",
  onMessageSent,
  listingId,
  listingTitle,
}: MessageFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { getUserOnlineStatus } = useOnlineStatus();
  const [recipientStatus, setRecipientStatus] = useState<{ isOnline: boolean; lastSeen: Date | null }>({
    isOnline: false,
    lastSeen: null,
  });

  // Fetch recipient status when component mounts
  useState(() => {
    const fetchStatus = async () => {
      if (recipientId) {
        const status = await getUserOnlineStatus(recipientId);
        setRecipientStatus(status);
      }
    };
    fetchStatus();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un message");
      navigate("/signin");
      return;
    }

    if (!message.trim()) {
      toast.error("Le message ne peut pas être vide");
      return;
    }

    setIsSending(true);
    
    try {
      // 1. Find or create conversation
      let conversationId;
      
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${recipientId},user2_id.eq.${recipientId}`)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: recipientId
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // 2. Insert message
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          recipient_id: recipientId,
          content: message,
          read: false
        });

      if (msgError) throw msgError;

      toast("Message envoyé", {
        description: `Votre message a été envoyé à ${recipientName}`,
        duration: 3000,
        // Fix the type error by using a valid variant
        variant: "default"
      });

      // Clear the message
      setMessage("");
      
      // Call callback if provided
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
          </Avatar>
          <div>
            <div>Message à {recipientName}</div>
            <div className="text-xs text-muted-foreground">
              {recipientStatus.isOnline ? (
                <span className="text-green-500 flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1 inline-block"></span>
                  En ligne
                </span>
              ) : recipientStatus.lastSeen ? (
                <span className="text-gray-500">
                  Vu {new Date(recipientStatus.lastSeen).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-gray-500">Hors ligne</span>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {listingId && listingTitle && (
            <div className="mb-4 p-3 border rounded bg-gray-50 text-sm">
              <div className="font-medium">À propos de l'annonce:</div>
              <div className="text-blue-600">{listingTitle}</div>
            </div>
          )}
          <Textarea
            placeholder="Votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
            required
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSending}>
            {isSending ? "Envoi..." : "Envoyer"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
