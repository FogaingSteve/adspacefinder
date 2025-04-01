import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingService } from "@/services/api";
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingDTO) => listingService.createListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentListings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      queryClient.invalidateQueries({ queryKey: ['categoryListings'] });
      toast.success("Annonce créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'annonce");
    }
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingDTO> }) => 
      listingService.updateListing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      toast.success("Annonce mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'annonce");
    }
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      toast.success("Annonce supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de l'annonce");
    }
  });
};

export const useMarkListingAsSold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.markAsSold(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
      toast.success("Annonce marquée comme vendue");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du marquage comme vendu");
    }
  });
};

export const useUserListings = (userId: string) => {
  return useQuery({
    queryKey: ['userListings', userId],
    queryFn: () => listingService.getUserListings(userId),
    enabled: !!userId,
  });
};

export const useRecentListings = () => {
  return useQuery({
    queryKey: ['recentListings'],
    queryFn: () => listingService.getRecentListings(),
  });
};

export const useListingById = (id: string, options = {}) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      try {
        console.log('Fetching listing by ID:', id);
        const listing = await listingService.getListingById(id);
        console.log('Listing found:', listing);
        
        // Try to fetch the vendor information directly from Supabase
        if (listing && listing.userId) {
          console.log('Fetching user profile for userId:', listing.userId);
          
          try {
            // Using the auth.users table which should exist by default
            const { data: authUserData, error: authError } = await supabase.auth.admin
              .getUserById(listing.userId);
            
            if (!authError && authUserData && authUserData.user) {
              console.log('User found in auth.users:', authUserData.user);
              const userData = authUserData.user;
              
              listing.user = {
                full_name: userData.user_metadata?.full_name || 
                           userData.user_metadata?.name || 
                           'Utilisateur',
                email: userData.email || '',
                phone: userData.user_metadata?.phone || ''
              };
              console.log('Updated user information:', listing.user);
            } else {
              console.error('Failed to find user in auth:', authError);
              toast.error("Information du vendeur non trouvée");
              listing.user = {
                full_name: 'Information vendeur non disponible',
                email: 'Email non disponible',
                phone: undefined
              };
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            
            // Fallback to fetch from custom user table if it exists
            try {
              const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', listing.userId)
                .single();
                
              if (!userError && userData) {
                console.log('User found in user_profiles:', userData);
                listing.user = {
                  full_name: userData.full_name || userData.name || 'Utilisateur',
                  email: userData.email || '',
                  phone: userData.phone || ''
                };
              } else {
                console.error('Failed to find user in custom tables:', userError);
                listing.user = {
                  full_name: 'Information vendeur non disponible',
                  email: 'Email non disponible',
                  phone: undefined
                };
              }
            } catch (fallbackError) {
              console.error("All attempts to fetch user failed:", fallbackError);
              listing.user = {
                full_name: 'Information vendeur non disponible',
                email: 'Email non disponible',
                phone: undefined
              };
            }
          }
        } else {
          console.warn('No userId available for this listing, cannot fetch vendor information');
          toast.error("ID vendeur manquant pour cette annonce");
        }
        
        return listing;
      } catch (error) {
        console.error('Error in useListingById:', error);
        throw error;
      }
    },
    enabled: !!id && id !== 'undefined',
    retry: 1,
    ...options
  });
};

export const useListingByTitle = (title: string, category: string, options = {}) => {
  return useQuery({
    queryKey: ['listingByTitle', title, category],
    queryFn: async () => {
      try {
        const decodedTitle = decodeURIComponent(title);
        console.log(`Fetching listing with decoded title: "${decodedTitle}" in category: "${category}"`);
        
        if (!decodedTitle) {
          throw new Error('Titre manquant pour la recherche');
        }
        
        const listing = await listingService.getListingByTitle(decodedTitle, category);
        console.log('Found listing by title:', listing);
        return listing;
      } catch (error) {
        console.error("Error fetching listing by title:", error);
        throw error;
      }
    },
    enabled: !!title,
    retry: 2,
    staleTime: 1000 * 60,
    ...options
  });
};

export const useSearchListings = (query: string, category?: string, exactTitle?: string) => {
  return useQuery({
    queryKey: ['searchListings', query, category, exactTitle],
    queryFn: () => listingService.searchListings(query, category, exactTitle),
    enabled: !!query,
    retry: 1,
  });
};

export const useCategoryListings = (categoryId: string, subcategoryId?: string) => {
  return useQuery({
    queryKey: ['categoryListings', categoryId, subcategoryId],
    queryFn: () => {
      if (subcategoryId) {
        return listingService.searchListings('', categoryId);
      }
      return listingService.getListingsByCategory(categoryId);
    },
    enabled: !!categoryId,
  });
};

export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => listingService.uploadImages(files),
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'upload des images");
    }
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, userId }: { listingId: string; userId: string }) =>
      listingService.toggleFavorite(listingId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['recentListings'] });
    }
  });
};

export const useFavorites = (userId: string) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => listingService.getFavorites(userId),
    enabled: !!userId,
  });
};
