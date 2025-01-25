import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { categories } from "@/data/categories";

const cities = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"];
const priceRanges = [
  "0 - 500,000 CFA",
  "500,000 - 2,000,000 CFA",
  "2,000,000 - 10,000,000 CFA",
  "10,000,000+ CFA",
];

const mockListings = {
  immobilier: {
    "vente-appartement": [
      {
        id: 1,
        title: "Appartement F4 avec terrasse",
        price: "45 000 000 CFA",
        location: "Yaoundé, Cameroun",
        image: "https://images.unsplash.com/photo-1517022812141-23620dba5c23",
        timePosted: "2 heures",
        attributes: {
          surface: "120 m²",
          pieces: 4,
          etage: 3,
          ascenseur: true,
        }
      },
      {
        id: 2,
        title: "Studio meublé centre-ville",
        price: "15 000 000 CFA",
        location: "Douala, Cameroun",
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
        timePosted: "5 heures",
        attributes: {
          surface: "35 m²",
          pieces: 1,
          etage: 2,
          ascenseur: false,
        }
      }
    ],
    "location-appartement": [
      {
        id: 3,
        title: "Appartement F3 avec balcon",
        price: "200 000 CFA/mois",
        location: "Yaoundé, Cameroun",
        image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
        timePosted: "1 jour",
        attributes: {
          surface: "85 m²",
          pieces: 3,
          meuble: true,
        }
      }
    ]
  },
  vehicules: {
    voitures: [
      {
        id: 4,
        title: "Toyota Fortuner 2018",
        price: "19 500 000 CFA",
        location: "Yaoundé, Cameroun",
        image: "/lovable-uploads/e7fea7e5-02f3-4b4f-8e3b-bdcc57d233ca.png",
        timePosted: "4 heures",
        attributes: {
          marque: "Toyota",
          annee: 2018,
          kilometrage: "45000 km",
          carburant: "Diesel",
        }
      },
      {
        id: 5,
        title: "Peugeot 3008 GT Line",
        price: "15 000 000 CFA",
        location: "Douala, Cameroun",
        image: "https://images.unsplash.com/photo-1493962853295-0fd70327578a",
        timePosted: "1 jour",
        attributes: {
          marque: "Peugeot",
          annee: 2020,
          kilometrage: "25000 km",
          carburant: "Essence",
        }
      }
    ]
  },
  emploi: {
    "offres-emploi": [
      {
        id: 6,
        title: "Développeur Full Stack React/Node.js",
        price: "Salaire selon profil",
        location: "Yaoundé, Cameroun",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        timePosted: "3 heures",
        attributes: {
          contrat: "CDI",
          secteur: "Informatique",
          experience: "3-5 ans",
        }
      }
    ]
  },
  mode: {
    vetements: [
      {
        id: 7,
        title: "Costume homme sur mesure",
        price: "150 000 CFA",
        location: "Douala, Cameroun",
        image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
        timePosted: "6 heures",
        attributes: {
          taille: "L",
          etat: "Neuf",
          marque: "Hugo Boss",
        }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(subcategories).map(([subcategoryId, listings]) => (
              <div key={subcategoryId}>
                <h3 className="text-lg font-semibold mb-4">
                  {category.subcategories.find(sub => sub.id === subcategoryId)?.name}
                </h3>
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4 block"
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

      {/* Categories Section */}
      <div className="container mx-auto px-4 py-16">
        {renderListingsByCategory()}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
