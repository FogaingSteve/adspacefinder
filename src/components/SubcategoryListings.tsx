import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { categories } from "@/data/categories";
import { useQuery } from "@tanstack/react-query";
import { listingService } from "@/services/api";

interface SubcategoryListingsProps {
  categoryId: string;
  subcategoryId: string;
}

export const SubcategoryListings = ({ categoryId, subcategoryId }: SubcategoryListingsProps) => {
  const category = categories.find(c => c.id === categoryId);
  const subcategory = category?.subcategories.find(s => s.id === subcategoryId);

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', categoryId, subcategoryId],
    queryFn: () => listingService.getListingsByCategory(categoryId),
  });

  if (!category || !subcategory) {
    return <div>Catégorie ou sous-catégorie non trouvée</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="aspect-video bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{subcategory.name}</h1>
          <p className="text-gray-600">
            {category.name} &gt; {subcategory.name}
          </p>
        </div>
        <div className="text-center py-12">
          <div className="mb-4">
            <img 
              src="/placeholder.svg" 
              alt="Aucune annonce" 
              className="w-32 h-32 mx-auto opacity-50"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune annonce disponible pour le moment
          </h2>
          <p className="text-gray-500 mb-4">
            Soyez le premier à publier une annonce dans cette catégorie
          </p>
          <Button asChild>
            <Link to="/create-listing">Publier une annonce</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{subcategory.name}</h1>
        <p className="text-gray-600">
          Découvrez toutes les annonces dans la catégorie {category.name} &gt; {subcategory.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listings/${listing.id}`}
            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={listing.images[0]}
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
                {new Date(listing.createdAt || '').toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long'
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