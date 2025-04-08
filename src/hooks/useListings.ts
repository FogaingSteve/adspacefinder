import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { listingService } from "@/services/api";
import { toast } from "sonner";

// Get recent listings
export const useRecentListings = () => {
  return useQuery({
    queryKey: ["recentListings"],
    queryFn: async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/listings/recent");
        return response.data;
      } catch (error) {
        console.error("Error fetching recent listings:", error);
        throw error;
      }
    }
  });
};

// Search listings with enhanced filtering
export const useSearchListings = (
  query: string = "",
  category: string = "",
  city: string = "",
  priceMin: number = 0,
  priceMax: number = 0
) => {
  return useQuery({
    queryKey: ["searchListings", query, category, city, priceMin, priceMax],
    queryFn: async () => {
      try {
        console.log("Searching with params:", { query, category, city, priceMin, priceMax });
        
        // Construct the query parameters
        const params: Record<string, string> = {};
        if (query) params.q = query;
        if (category && category !== "all") params.category = category;
        
        // Fetch from search endpoint
        const response = await axios.get("http://localhost:5000/api/listings/search-results", { 
          params 
        });
        
        console.log("Search response:", response.data);
        
        // Client-side filtering for location and price if needed
        let results = response.data;
        
        // Filter by city if specified
        if (city && city !== "all") {
          results = results.filter((listing: any) => 
            listing.location?.toLowerCase().includes(city.toLowerCase())
          );
        }
        
        // Filter by price range if specified
        if (priceMin > 0 || priceMax > 0) {
          results = results.filter((listing: any) => {
            const price = parseFloat(listing.price);
            
            // If only min price specified
            if (priceMin > 0 && priceMax === 0) {
              return price >= priceMin;
            }
            
            // If only max price specified
            if (priceMin === 0 && priceMax > 0) {
              return price <= priceMax;
            }
            
            // If both min and max specified
            if (priceMin > 0 && priceMax > 0) {
              return price >= priceMin && price <= priceMax;
            }
            
            return true;
          });
        }
        
        console.log(`Search returned ${results.length} results after filtering`);
        return results;
      } catch (error) {
        console.error("Error searching listings:", error);
        throw error;
      }
    },
    enabled: Boolean(query) || Boolean(category) || Boolean(city) || priceMin > 0 || priceMax > 0
  });
};

// Get listings by category
export const useCategoryListings = (categoryId: string, limit?: number) => {
  return useQuery({
    queryKey: ["categoryListings", categoryId],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/category/${categoryId}`);
        return limit ? response.data.slice(0, limit) : response.data;
      } catch (error) {
        console.error(`Error fetching listings for category ${categoryId}:`, error);
        throw error;
      }
    },
    enabled: !!categoryId
  });
};

// Get subcategory listings
export const useSubcategoryListings = (categoryId: string, subcategoryId: string, limit?: number) => {
  return useQuery({
    queryKey: ["subcategoryListings", categoryId, subcategoryId],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/listings/category/${categoryId}/subcategory/${subcategoryId}`
        );
        return limit ? response.data.slice(0, limit) : response.data;
      } catch (error) {
        console.error(`Error fetching listings for subcategory ${subcategoryId}:`, error);
        throw error;
      }
    },
    enabled: !!categoryId && !!subcategoryId
  });
};

// Get user listings
export const useUserListings = (userId: string) => {
  return useQuery({
    queryKey: ["userListings", userId],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching listings for user ${userId}:`, error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Delete listing
export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await axios.delete(`http://localhost:5000/api/listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["userListings"] });
      queryClient.invalidateQueries({ queryKey: ["recentListings"] });
    }
  });
};

// Mark listing as sold
export const useMarkListingAsSold = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await axios.put(
        `http://localhost:5000/api/listings/${listingId}/sold`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["userListings"] });
      queryClient.invalidateQueries({ queryKey: ["recentListings"] });
    }
  });
};

// Toggle favorite
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      listingId,
      userId
    }: {
      listingId: string;
      userId: string;
    }) => {
      const response = await axios.post(
        `http://localhost:5000/api/listings/${listingId}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["listing", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["favoriteListings", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["recentListings"] });
    }
  });
};

// Get favorite listings
export const useFavoriteListings = (userId: string) => {
  return useQuery({
    queryKey: ["favoriteListings", userId],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/listings/favorites/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching favorites for user ${userId}:`, error);
        throw error;
      }
    },
    enabled: !!userId
  });
};

// Create listing hook
export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingData: any) => {
      try {
        console.log("Creating listing with data:", listingData);
        // Get token from localStorage
        const token = localStorage.getItem("token") || localStorage.getItem("userSession");
        
        if (!token) {
          throw new Error("Vous devez être connecté pour créer une annonce");
        }
        
        let authToken = token;
        // If token is a JSON string (userSession), extract the JWT
        if (token.startsWith('{')) {
          try {
            const sessionData = JSON.parse(token);
            // Use Supabase session if available
            const { data } = await supabase.auth.getSession();
            if (data.session?.access_token) {
              authToken = data.session.access_token;
            }
          } catch (e) {
            console.error("Error parsing token:", e);
          }
        }
        
        const response = await axios.post(
          "http://localhost:5000/api/listings",
          listingData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        return response.data;
      } catch (error: any) {
        console.error("Error creating listing:", error.response?.data || error);
        throw new Error(error.response?.data?.message || error.message || "Erreur lors de la création de l'annonce");
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["userListings"] });
      queryClient.invalidateQueries({ queryKey: ["recentListings"] });
      toast.success("Annonce créée avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la création de l'annonce");
    }
  });
};

// Alias for useFavoriteListings for backwards compatibility
export const useFavorites = useFavoriteListings;
