
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { RecentListings } from "@/components/RecentListings";
import { useSearchListings, SearchOptions } from "@/hooks/useListings";
import { toast } from "sonner";
import { useCategories, categoryIcons } from "@/data/topCategories";
import { CategoryListings } from "@/components/CategoryListings";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const priceRanges = [
  "Tous les prix",
  "0 - 500,000 CFA",
  "500,000 - 2,000,000 CFA",
  "2,000,000 - 10,000,000 CFA",
  "10,000,000+ CFA",
];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [filters, setFilters] = useState<SearchOptions>({
    query: "",
    category: "",
    city: "",
    minPrice: 0,
    maxPrice: 0
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

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cities');
        return response.data;
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        return ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"]; // Fallback to static cities
      }
    }
  });

  const parsePriceRange = (range: string) => {
    if (range === "Tous les prix" || !range) {
      return { min: 0, max: 0 }; // 0 means no limit
    }
    
    const parts = range.split(' - ');
    if (parts.length !== 2) {
      return { min: 0, max: 0 };
    }
    
    let min = parseInt(parts[0].replace(/\D/g, ''));
    let max = parts[1].includes('+') 
      ? Number.MAX_SAFE_INTEGER 
      : parseInt(parts[1].replace(/\D/g, ''));
      
    return { min, max };
  };

  const { listings: searchResults, isLoading, searchListings } = useSearchListings();

  const applyFilters = () => {
    if (!searchQuery.trim() && !selectedCategory && !selectedCity && !priceRange) {
      toast.error("Veuillez sélectionner au moins un critère de recherche");
      return;
    }
    
    const { min: priceMin, max: priceMax } = parsePriceRange(priceRange);
    
    const searchOptions: SearchOptions = {
      query: searchQuery,
      category: selectedCategory,
      city: selectedCity,
      minPrice: priceMin,
      maxPrice: priceMax
    };
    
    // Mettre à jour les filtres d'état
    setFilters(searchOptions);
    
    // Effectuer la recherche
    searchListings(searchOptions);
    
    // Créer l'URL de recherche pour la navigation
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set('q', searchQuery);
    if (selectedCategory) queryParams.set('category', selectedCategory);
    if (selectedCity) queryParams.set('city', selectedCity);
    if (priceMin > 0) queryParams.set('priceMin', priceMin.toString());
    if (priceMax > 0) queryParams.set('priceMax', priceMax.toString());
    
    // Mettre à jour l'URL sans naviguer vers une nouvelle page
    window.history.pushState({}, '', `/?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                onKeyPress={handleKeyPress}
              />
              <Button 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={applyFilters}
                disabled={isLoading}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : (
                    categories?.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat.id || cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Ville" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  {(citiesData || ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Bamenda", "Kribi"]).map((city: string) => (
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

      {searchQuery && searchResults && searchResults.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Résultats de recherche</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {searchResults.map((listing) => (
              <Link
                key={listing.id || listing._id}
                to={`/listings/${listing.id || listing._id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
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
                  <p className="text-primary font-bold mt-2">{listing.price} €</p>
                  <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults && searchResults.length === 0 && !isLoading && (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Aucun résultat trouvé</h2>
          <p className="text-gray-600">Essayez d'autres critères de recherche.</p>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Top Catégories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {categoriesLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Skeleton className="h-8 w-8 mb-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : (
            categories?.slice(0, 10).map((category: any) => {
              const Icon = categoryIcons[category.id as keyof typeof categoryIcons] || null;
              return (
                <Link
                  key={category._id}
                  to={`/categories/${category.id || category._id}`}
                  className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {Icon && <Icon className="h-8 w-8 mb-2 text-primary" />}
                  <span className="text-sm text-center">{category.name}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {!categoriesLoading && categories?.map((category: any) => (
        <div key={category._id} className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Link 
              to={`/categories/${category.id}`}
              className="text-primary hover:underline"
            >
              Voir tout
            </Link>
          </div>
          <CategoryListings categoryId={category.id} limit={4} />
        </div>
      ))}

      <div className="container mx-auto px-4">
        <RecentListings />
      </div>
    </div>
  );
};

export default Index;
