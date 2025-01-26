import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Car, Smartphone, Shirt, Home, Microwave, Armchair, Briefcase, Handshake, Baby, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { categories } from "@/data/categories";
import { RecentListings } from "@/components/RecentListings";

const cities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"];
const priceRanges = [
  "0 - 500,000 CFA",
  "500,000 - 2,000,000 CFA",
  "2,000,000 - 10,000,000 CFA",
  "10,000,000+ CFA",
];

const topCategories = [
  { icon: Car, name: "Véhicules", link: "/categories/vehicules" },
  { icon: Smartphone, name: "Electronique", link: "/categories/electronique" },
  { icon: Shirt, name: "Mode & Beauté", link: "/categories/mode" },
  { icon: Home, name: "Immobilier", link: "/categories/immobilier" },
  { icon: Microwave, name: "Electroménager", link: "/categories/electromenager" },
  { icon: Armchair, name: "Pour la maison", link: "/categories/maison" },
  { icon: Briefcase, name: "Emplois", link: "/categories/emplois" },
  { icon: Handshake, name: "Services", link: "/categories/services" },
  { icon: Baby, name: "Pour l'enfant", link: "/categories/enfant" },
  { icon: Trophy, name: "Sports & Loisirs", link: "/categories/sports" },
};

// Mock data for listings
const mockListings = {
  immobilier: {
    "vente-appartement": [
      {
        id: "1",
        title: "Bel appartement avec vue",
        price: "45,000,000 CFA",
        location: "Yaoundé, Bastos",
        image: "/placeholder.svg",
        timePosted: "Il y a 2 heures"
      },
      // ... Add more listings as needed
    ],
    "location-appartement": [
      {
        id: "2",
        title: "Studio meublé",
        price: "150,000 CFA/mois",
        location: "Douala, Bonanjo",
        image: "/placeholder.svg",
        timePosted: "Il y a 1 jour"
      }
    ]
  },
  vehicules: {
    "voitures": [
      {
        id: "3",
        title: "Toyota Corolla 2019",
        price: "8,500,000 CFA",
        location: "Yaoundé",
        image: "/placeholder.svg",
        timePosted: "Il y a 3 heures"
      }
    ]
  }
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const renderListingsByCategory = () => {
    return Object.entries(mockListings).map(([categoryId, subcategories]) => {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return null;

      return (
        <div key={categoryId} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {category.name}
          </h2>
          <div className="flex flex-col space-y-6">
            {Object.entries(subcategories).map(([subcategoryId, listings]) => (
              <div key={subcategoryId} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {category.subcategories.find(sub => sub.id === subcategoryId)?.name}
                </h3>
                <div className="flex flex-col space-y-4">
                  {listings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listings/${listing.id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3 aspect-video relative overflow-hidden">
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
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg text-gray-900 group-hover:text-primary">
                                {listing.title}
                              </h3>
                              <p className="text-primary font-bold mt-2">{listing.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.location}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

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
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Que recherchez-vous ?"
                className="bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="bg-white text-primary hover:bg-gray-100">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Fourchette de prix" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Top Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {topCategories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <category.icon className="h-8 w-8 mb-2 text-primary" />
              <span className="text-sm text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Listings Section */}
      <div className="container mx-auto px-4">
        <RecentListings />
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        {renderListingsByCategory()}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
