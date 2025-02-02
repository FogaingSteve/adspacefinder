import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>
      
      {/* Empty state when no favorites exist */}
      <Card>
        <CardHeader>
          <CardTitle>Aucune annonce en favoris</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            Vous n'avez pas encore ajouté d'annonces à vos favoris.
            Cliquez sur le cœur d'une annonce pour l'ajouter à vos favoris.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}