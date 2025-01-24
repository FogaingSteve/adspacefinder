import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Car, Briefcase, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Immobilier", icon: Home, color: "bg-blue-100" },
  { name: "Véhicules", icon: Car, color: "bg-green-100" },
  { name: "Emploi", icon: Briefcase, color: "bg-yellow-100" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-purple-100" },
];

const featuredListings = [
  {
    id: 1,
    title: "Appartement 3 pièces",
    price: "250,000 €",
    location: "Paris",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
  },
  {
    id: 2,
    title: "Voiture d'occasion",
    price: "15,000 €",
    location: "Lyon",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80",
  },
  {
    id: 3,
    title: "iPhone 13 Pro",
    price: "800 €",
    location: "Marseille",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trouvez ce que vous cherchez
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Des milliers d'annonces à portée de main
          </p>
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              placeholder="Que recherchez-vous ?"
              className="bg-white"
            />
            <Button className="bg-white text-primary hover:bg-gray-100">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Catégories populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/categories/${category.name.toLowerCase()}`}
              className="group p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
            >
              <div className={`${category.color} p-3 rounded-full w-fit mb-4`}>
                <category.icon className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Listings Section */}
      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold mb-8">Annonces à la une</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredListings.map((listing) => (
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
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                  {listing.title}
                </h3>
                <p className="text-primary font-bold mt-2">{listing.price}</p>
                <p className="text-gray-500 text-sm mt-1">{listing.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;