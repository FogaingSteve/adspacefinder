
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

export const SubcategoryListings = ({ categoryId, subcategoryId }: { categoryId: string, subcategoryId: string }) => {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch listings for this subcategory
  const { data, isLoading, error } = useQuery({
    queryKey: ['subcategory-listings', categoryId, subcategoryId, page],
    queryFn: async () => {
      const response = await axios.get(`/api/listings/category/${categoryId}/subcategory/${subcategoryId}`);
      return response.data;
    },
    keepPreviousData: true
  });

  // Reset page when subcategory changes
  useEffect(() => {
    setPage(1);
  }, [categoryId, subcategoryId]);

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading listings: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Paginate listings
  const paginatedListings = data?.slice((page - 1) * pageSize, page * pageSize) || [];
  const totalPages = Math.ceil((data?.length || 0) / pageSize);

  if (paginatedListings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune annonce trouvée dans cette sous-catégorie.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedListings.map((listing: any) => (
          <Link key={listing._id} to={`/listings/${listing._id}`}>
            <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                    Pas d'image
                  </div>
                )}
                {listing.isSold && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    Vendu
                  </Badge>
                )}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-2">
                <p className="font-bold text-lg">{listing.price.toLocaleString()} FCFA</p>
                <p className="text-gray-500 text-sm line-clamp-2">{listing.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </div>
                <Button size="sm" variant="ghost" className="gap-1">
                  Voir <ExternalLink className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
