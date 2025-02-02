import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
      
      {/* Empty state when no messages exist */}
      <Card>
        <CardHeader>
          <CardTitle>Aucun message</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            Vous n'avez pas encore de messages.
            Contactez un vendeur pour démarrer une conversation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
