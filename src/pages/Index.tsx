import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Home, Car, Briefcase, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Footer } from "@/components/Footer";

const categories = [
  { name: "Immobilier", icon: Home, color: "bg-blue-100" },
  { name: "Véhicules", icon: Car, color: "bg-green-100" },
  { name: "Emploi", icon: Briefcase, color: "bg-yellow-100" },
  { name: "Shopping", icon: ShoppingBag, color: "bg-purple-100" },
];

const featuredListings = [
  {
    id: 1,
    category: "Véhicules",
    subcategory: "Voitures",
    title: "Toyota Fortuner 2018",
    price: "19 500 000 CFA",
    location: "Yaoundé, Cameroun",
    image: "/lovable-uploads/e7fea7e5-02f3-4b4f-8e3b-bdcc57d233ca.png",
    timePosted: "4 heures",
  },
  {
    id: 2,
    category: "Immobilier",
    subcategory: "Appartements",
    title: "Bel appartement F3 avec terrasse",
    price: "250 000 CFA/mois",
    location: "Douala, Cameroun",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    timePosted: "2 heures",
  },
  {
    id: 3,
    category: "Emploi",
    subcategory: "CDI",
    title: "Développeur Full Stack React/Node.js",
    price: "Salaire selon profil",
    location: "Yaoundé, Cameroun",
    image: "https://images.unsplash.com/photo-1487252665478-49b61b47f302",
    timePosted: "1 jour",
  },
  {
    id: 4,
    category: "Shopping",
    subcategory: "Mode",
    title: "iPhone 13 Pro Max - 256Go",
    price: "450 000 CFA",
    location: "Douala, Cameroun",
    image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a",
    timePosted: "3 heures",
  },
  {
    id: 5,
    category: "Immobilier",
    subcategory: "Maisons",
    title: "Villa moderne avec piscine",
    price: "180 000 000 CFA",
    location: "Kribi, Cameroun",
    image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23",
    timePosted: "5 heures",
  },
  {
    id: 6,
    category: "Véhicules",
    subcategory: "Motos",
    title: "Yamaha R1 2022",
    price: "8 500 000 CFA",
    location: "Yaoundé, Cameroun",
    image: "https://images.unsplash.com/photo-1466721591366-2d5fba72006d",
    timePosted: "1 heure",
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const cities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"];
  const priceRanges = [
    "0 - 500,000 CFA",
    "500,000 - 2,000,000 CFA",
    "2,000,000 - 10,000,000 CFA",
    "10,000,000+ CFA",
  ];

  const filteredListings = featuredListings.filter((listing) => {
    const matchesSearch = listing.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || listing.location.includes(selectedCity);
    const matchesCategory =
      !selectedCategory ||
      listing.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCity && matchesCategory;
  });

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
          {filteredListings.map((listing) => (
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
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-gray-500">{listing.subcategory}</span>
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
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;