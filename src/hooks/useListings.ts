
import { useState, useEffect, useCallback } from 'react';
import { listingService } from '@/services/api';
import { Listing } from '@/types/listing';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

/**
 * Hook to manage recent listings
 */
export const useRecentListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listingService.getRecentListings();
      setListings(data);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching recent listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
};

/**
 * Hook to manage user listings
 */
export const useUserListings = (userId: string) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListings = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await listingService.getUserListings(userId);
      setListings(data);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching user listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
};

/**
 * Hook to manage category listings
 */
export const useCategoryListings = (categoryId: string) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchListings = useCallback(async () => {
    if (!categoryId) return;
    
    setIsLoading(true);
    try {
      const data = await listingService.getListingsByCategory(categoryId);
      setListings(data);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching category listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
};

export interface SearchOptions {
  query?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Hook to manage search results
 */
export const useSearchListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchListings = useCallback(async (options: SearchOptions) => {
    setIsLoading(true);
    try {
      let query = options.query || '';
      
      // Add the category to the search if provided
      const searchResults = await listingService.searchListings(query, options.category);
      
      // Filter results client-side based on other criteria
      let filteredResults = [...searchResults];
      
      // Filter by city if provided
      if (options.city) {
        filteredResults = filteredResults.filter(
          listing => listing.location?.toLowerCase().includes(options.city?.toLowerCase() || '')
        );
      }
      
      // Filter by price range if provided
      if (options.minPrice !== undefined) {
        filteredResults = filteredResults.filter(
          listing => listing.price >= options.minPrice!
        );
      }
      
      if (options.maxPrice !== undefined) {
        filteredResults = filteredResults.filter(
          listing => listing.price <= options.maxPrice!
        );
      }
      
      setListings(filteredResults);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error searching listings:', err);
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { listings, isLoading, error, searchListings };
};

/**
 * Hook to manage favorites
 */
export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await listingService.getFavorites(userId);
      setFavorites(data);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { listings: favorites, isLoading, error, refetch: fetchFavorites };
};

/**
 * Hook to toggle a listing favorite status
 */
export const useToggleFavorite = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const toggleFavorite = async (listingId: string) => {
    if (!user?.id) {
      toast.error("Veuillez vous connecter pour ajouter des favoris");
      return;
    }
    
    setIsLoading(true);
    try {
      await listingService.toggleFavorite(listingId, user.id);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error toggling favorite:', err);
      toast.error("Erreur lors de l'ajout aux favoris");
    } finally {
      setIsLoading(false);
    }
  };

  return { toggleFavorite, isLoading, error };
};

/**
 * Hook to create a new listing
 */
export const useCreateListing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createListing = async (listingData: any) => {
    setIsLoading(true);
    try {
      const response = await listingService.createListing(listingData);
      setError(null);
      toast.success("Annonce créée avec succès");
      return response;
    } catch (err: any) {
      setError(err);
      console.error('Error creating listing:', err);
      toast.error("Erreur lors de la création de l'annonce: " + err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    mutateAsync: createListing,
    isPending: isLoading, 
    error 
  };
};

/**
 * Hook to delete a listing
 */
export const useDeleteListing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteListing = async (listingId: string) => {
    setIsLoading(true);
    try {
      await listingService.deleteListing(listingId);
      setError(null);
      toast.success("Annonce supprimée avec succès");
    } catch (err: any) {
      setError(err);
      console.error('Error deleting listing:', err);
      toast.error("Erreur lors de la suppression de l'annonce");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    mutateAsync: deleteListing, 
    isPending: isLoading, 
    error 
  };
};

/**
 * Hook to mark a listing as sold
 */
export const useMarkListingAsSold = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markAsSold = async (listingId: string) => {
    setIsLoading(true);
    try {
      await listingService.updateListing(listingId, { isSold: true });
      setError(null);
      toast.success("Statut de l'annonce mis à jour");
    } catch (err: any) {
      setError(err);
      console.error('Error updating listing status:', err);
      toast.error("Erreur lors de la mise à jour du statut");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    mutateAsync: markAsSold, 
    isPending: isLoading, 
    error 
  };
};
