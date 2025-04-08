
import { useState, useEffect, useCallback } from 'react';
import { listingService } from '@/services/api';
import { Listing } from '@/types/listing';
import { toast } from 'sonner';

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

interface SearchOptions {
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
          listing => listing.city?.toLowerCase() === options.city?.toLowerCase()
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
