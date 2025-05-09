
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useRecentListings, useToggleFavorite } from "@/hooks/useListings";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const RecentListings = () => {
  const { listings, isLoading, refetch, error } = useRecentListings();
  const { user } = useAuth();
  const { toggleFavorite, isLoading: isFavoriteLoading } = useToggleFavorite();
  const [processingFavorites, setProcessingFavorites] = useState<Record<string, boolean>>({});

  // Log error if there is one
  if (error) {
    console.error("Error fetching recent listings:", error);
  }

  const formatRelativeDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, listingId: string) => {
    e.preventDefault(); // Empêcher la navigation vers la page de détail
    e.stopPropagation(); // Empêcher la propagation de l'événement
    
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter aux favoris");
      return;
    }
    
    setProcessingFavorites(prev => ({ ...prev, [listingId]: true }));
    
    try {
      await toggleFavorite(listingId);
      refetch(); // Rafraîchir pour mettre à jour l'état des favoris
      toast.success("Favori mis à jour");
    } catch (error) {
      console.error("Erreur toggle favori:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
    } finally {
      setProcessingFavorites(prev => ({ ...prev, [listingId]: false }));
    }
  };

  // Vérifier si une annonce est dans les favoris
  const isFavorite = (listing: any) => {
    if (!user || !listing.favorites) return false;
    return listing.favorites.includes(user.id);
  };

  // Sécuriser l'ID de l'annonce pour éviter le problème d'undefined
  const getListingId = (listing: any) => {
    return listing._id || listing.id || '';
  };

  if (isLoading) {
    return (
      <div className="my-12">
        <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="my-12">
        <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Aucune annonce disponible pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6">Annonces récentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          // Sécuriser l'ID pour le routing
          const listingId = getListingId(listing);
          
          return (
            <Link
              key={listingId}
              to={`/listings/${listingId}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={listing.images && listing.images[0] ? listing.images[0] : "https://via.placeholder.com/400x300?text=Pas+d'image"}
                  alt={listing.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                  }}
                />
                <Button
                  onClick={(e) => handleToggleFavorite(e, listingId)}
                  variant="ghost"
                  size="icon"
                  disabled={processingFavorites[listingId]}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full z-10"
                >
                  <Heart 
                    className={`h-5 w-5 ${isFavorite(listing) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                  />
                </Button>
                <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-sm">
                  {formatRelativeDate(listing.createdAt || "")}
                </div>
                {listing.isSold && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold transform -rotate-12">
                      Vendu
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-primary font-bold mt-2">{listing.price} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                {listing.user && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Vendeur: {listing.user.full_name}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
