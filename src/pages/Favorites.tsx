
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/useListings";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const Favorites = () => {
  const { user } = useAuth();
  const { listings: favorites, isLoading, refetch } = useFavorites(user?.id || "");
  const { toggleFavorite } = useToggleFavorite();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFavorite = async (listingId: string | undefined) => {
    if (!listingId || !user) return;
    
    setRemovingId(listingId);
    
    try {
      await toggleFavorite(listingId);
      toast.success("Retiré des favoris");
      refetch(); // Rafraîchir la liste après la suppression
    } catch (error) {
      toast.error("Erreur lors du retrait des favoris");
      console.error("Erreur toggle favori:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatRelativeTime = (date: string | Date | undefined): string => {
    if (!date) return "Date inconnue";
    
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return `il y a ${formatDistanceToNow(parsedDate, { locale: fr })}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Navigation />
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Vous devez être connecté pour voir vos favoris</h1>
          <Button asChild>
            <Link to="/auth/signin">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mes favoris</h1>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full h-48 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium">Aucune annonce favorite</h2>
            <p className="mt-2 text-sm text-gray-500">
              Parcourez les annonces et ajoutez-les à vos favoris pour les retrouver ici
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Découvrir les annonces</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((listing) => {
              const listingId = listing.id || listing._id;
              return (
                <Card key={listingId} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={listing.images[0] || "https://via.placeholder.com/400x300?text=Pas+d'image"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                      }}
                    />
                    {listing.isSold && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold transform -rotate-12">
                          Vendu
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold line-clamp-1">{listing.title}</h3>
                    <p className="text-primary font-bold mt-1">{listing.price} €</p>
                    <div className="flex items-center text-gray-500 text-sm mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatRelativeTime(listing.createdAt)}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/listings/${listingId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFavorite(listingId)}
                        disabled={removingId === listingId}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                        {removingId === listingId ? "..." : "Retirer"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
