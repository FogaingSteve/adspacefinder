import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { categories } from "@/data/categories";

// Fonction helper pour générer des annonces fictives
const generateMockListings = (categoryId: string, subcategoryId: string, count: number = 8) => {
  const category = categories.find(c => c.id === categoryId);
  const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
  
  if (!category || !subcategory) return [];

  return Array.from({ length: count }, (_, i) => ({
    id: `${categoryId}-${subcategoryId}-${i + 1}`,
    title: `${subcategory.name} #${i + 1}`,
    price: `${Math.floor(Math.random() * 1000000)} CFA`,
    location: ["Yaoundé", "Douala", "Bafoussam", "Kribi"][Math.floor(Math.random() * 4)] + ", Cameroun",
    image: [
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      "https://images.unsplash.com/photo-1472396961693-142e6e269027"
    ][Math.floor(Math.random() * 4)],
    timePosted: `Il y a ${Math.floor(Math.random() * 24)} heures`
  }));
};

interface SubcategoryListingsProps {
  categoryId: string;
  subcategoryId: string;
}

export const SubcategoryListings = ({ categoryId, subcategoryId }: SubcategoryListingsProps) => {
  const category = categories.find(c => c.id === categoryId);
  const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
  const listings = generateMockListings(categoryId, subcategoryId);

  if (!category || !subcategory) {
    return <div>Catégorie ou sous-catégorie non trouvée</div>;
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
                src={listing.image}
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
                {listing.timePosted}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                {listing.title}
              </h3>
              <p className="text-primary font-bold mt-2">{listing.price}</p>
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