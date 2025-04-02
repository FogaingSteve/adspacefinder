
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToggleFavorite } from "@/hooks/useListings";
import { toast } from "sonner";

interface CategoryListingsProps {
  categoryId: string;
  subcategoryId?: string;
  limit?: number;
}

export const CategoryListings = ({ categoryId, subcategoryId, limit = 8 }: CategoryListingsProps) => {
  const { user } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const [processingFavorites, setProcessingFavorites] = useState<Record<string, boolean>>({});
  
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['categoryListings', categoryId, subcategoryId, limit],
    queryFn: async () => {
      let url = `http://localhost:5000/api/listings/category/${categoryId}`;
      if (subcategoryId) {
        url += `/subcategory/${subcategoryId}`;
      }
      url += `?limit=${limit}`;
      const response = await axios.get(url);
      return response.data;
    },
    enabled: !!categoryId
  });

  // Vérifier si une annonce est dans les favoris
  const isFavorite = (listing: any) => {
    if (!user || !listing.favorites) return false;
    return listing.favorites.includes(user.id);
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
      await toggleFavorite.mutateAsync({
        listingId,
        userId: user.id
      });
      
      refetch(); // Rafraîchir pour mettre à jour l'état des favoris
      toast.success("Favori mis à jour");
    } catch (error) {
      console.error("Erreur toggle favori:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
    } finally {
      setProcessingFavorites(prev => ({ ...prev, [listingId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(limit).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-4/5 mb-2" />
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Aucune annonce disponible dans cette catégorie</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing: any) => {
        const listingUrl = `/listings/${listing._id || listing.id}`;
        
        return (
          <Link
            key={listing._id || listing.id}
            to={listingUrl}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={listing.images[0] || "https://via.placeholder.com/400x300?text=Pas+d'image"}
                alt={listing.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  onClick={(e) => handleToggleFavorite(e, listing._id || listing.id)}
                  variant="ghost"
                  size="icon"
                  disabled={processingFavorites[listing._id || listing.id]}
                  className="bg-white/80 hover:bg-white rounded-full"
                >
                  <Heart 
                    className={`h-5 w-5 ${isFavorite(listing) ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
                  />
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-sm">
                {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
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
              <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                {listing.title}
              </h3>
              <p className="text-primary font-bold mt-2">{listing.price} €</p>
              <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
