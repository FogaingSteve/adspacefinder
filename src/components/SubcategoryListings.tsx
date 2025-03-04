
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "./ui/skeleton";

interface SubcategoryListingsProps {
  categoryId: string;
  subcategoryId: string;
}

export const SubcategoryListings = ({ categoryId, subcategoryId }: SubcategoryListingsProps) => {
  // Fetch category and subcategory info
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/categories/${categoryId}`);
      return response.data;
    },
  });

  // Fetch listings for this subcategory
  const { data: listings, isLoading: isListingsLoading } = useQuery({
    queryKey: ['subcategoryListings', categoryId, subcategoryId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:5000/api/listings/category/${categoryId}/subcategory/${subcategoryId}`
      );
      return response.data;
    },
  });

  const isLoading = isCategoryLoading || isListingsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
      </div>
    );
  }

  if (!categoryData || !listings || listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Aucune annonce disponible</h2>
          <p className="text-gray-600">
            Il n'y a pas encore d'annonces dans cette sous-catégorie.
          </p>
        </div>
      </div>
    );
  }

  const subcategory = categoryData.subcategories.find((s: any) => s.id === subcategoryId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{subcategory?.name || "Sous-catégorie"}</h1>
        <p className="text-gray-600">
          Découvrez toutes les annonces dans la catégorie {categoryData.name} &gt; {subcategory?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing: any) => (
          <Link
            key={listing._id}
            to={`/categories/${categoryId}/${subcategoryId}/${encodeURIComponent(listing.title)}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={listing.images[0] || "https://via.placeholder.com/400x300"}
                alt={listing.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </Button>
              </div>
              <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-sm">
                {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                {listing.title}
              </h3>
              <p className="text-primary font-bold mt-2">{listing.price} CFA</p>
              <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{listing.location}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
