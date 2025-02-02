import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function MySearches() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes recherches sauvegardées</h1>
      
      {/* Empty state when no searches exist */}
      <Card>
        <CardHeader>
          <CardTitle>Aucune recherche sauvegardée</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            Vous n'avez pas encore sauvegardé de recherche.
            Sauvegardez vos critères de recherche pour être notifié des nouvelles annonces.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}