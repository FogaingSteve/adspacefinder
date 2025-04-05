
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin } from "lucide-react";

export interface SubcategoryListingsProps {
  categoryId: string;
  subcategoryId: string;
}

export const SubcategoryListings = ({ categoryId, subcategoryId }: SubcategoryListingsProps) => {
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['listings', categoryId, subcategoryId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/listings/category/${categoryId}/subcategory/${subcategoryId}`);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const formatRelativeDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date inconnue";
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Une erreur est survenue lors du chargement des annonces.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data && data.length > 0 ? (
        data.map((listing: any) => (
          <div
            key={listing._id}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
            onClick={() => navigate(`/listings/${listing._id}`)}
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
              <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-primary font-bold mt-2">{listing.price.toLocaleString()} €</p>
              <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">Aucune annonce trouvée dans cette catégorie</p>
        </div>
      )}
    </div>
  );
};
