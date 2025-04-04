import { useQuery } from "@tanstack/react-query";
import { listingService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export const SubcategoryListings = ({ categoryId, subcategoryId, limit }: { 
  categoryId: string; 
  subcategoryId: string;
  limit?: number;
}) => {
  console.log("SubcategoryListings params:", { categoryId, subcategoryId, limit });
  
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['subcategoryListings', categoryId, subcategoryId],
    queryFn: async () => {
      try {
        console.log(`Fetching listings for category ${categoryId}, subcategory ${subcategoryId}`);
        // Use the searchListings method with empty query but specified category/subcategory
        const results = await listingService.searchListings('', categoryId);
        console.log("Search results before filtering:", results.length);
        
        // Filter by subcategory client-side (more reliable)
        const filtered = results.filter(listing => 
          listing.subcategory === subcategoryId
        );
        
        console.log(`Filtered to ${filtered.length} listings for subcategory ${subcategoryId}`);
        
        // Apply limit if provided
        return limit ? filtered.slice(0, limit) : filtered;
      } catch (error) {
        console.error("Error fetching subcategory listings:", error);
        throw error;
      }
    },
    enabled: !!categoryId && !!subcategoryId,
    retry: 2
  });

  if (error) {
    console.error("Error loading listings:", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Une erreur est survenue lors du chargement des annonces.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune annonce trouvée dans cette sous-catégorie</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <Link key={listing.id || listing._id} to={`/listings/${listing.id || listing._id}`}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                <img
                  src={listing.images?.[0] || 'https://placehold.co/400x400/e2e8f0/1e293b?text=Image+non+disponible'}
                  alt={listing.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/1e293b?text=Image+non+disponible';
                  }}
                />
                {listing.isSold && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs rounded-bl-lg">
                    Vendu
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{listing.title}</h3>
                <p className="text-xl font-bold text-primary mt-1">
                  {listing.price.toLocaleString()} CFA
                </p>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {listing.location}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
