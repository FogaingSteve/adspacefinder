
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
      queryClient.invalidateQueries({ queryKey: ['recentListings'] });
      queryClient.invalidateQueries({ queryKey: ['listingById'] });
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
    retry: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useListingById = (id: string, options = {}) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      try {
        if (!id || id === 'undefined' || id === 'null') {
          throw new Error('ID invalide');
        }
        
        console.log('Fetching listing by ID:', id);
        const listing = await listingService.getListingById(id);
        console.log('Listing found:', listing);
        
        // Always try to get seller information regardless of who is logged in
        if (listing && listing.userId) {
          console.log('Fetching user profile for userId:', listing.userId);
          
          try {
            // Try to get user from Supabase profiles
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', listing.userId)
              .single();
            
            if (!profileError && profileData) {
              console.log('User profile found from profiles table:', profileData);
              listing.user = {
                full_name: profileData.full_name || profileData.name || 'Vendeur',
                email: profileData.email || 'Contact via la plateforme',
                phone: profileData.phone || undefined,
                avatar_url: profileData.avatar_url || undefined
              };
              return listing;
            }
          } catch (profilesError) {
            console.error('Error with profiles table:', profilesError);
          }
          
          // Try to get user from Supabase auth
          try {
            const { data: userData } = await supabase.auth.getUser(listing.userId);
            
            if (userData && userData.user) {
              console.log('User data found from Auth:', userData.user);
              
              listing.user = {
                full_name: userData.user.user_metadata?.full_name || 
                          userData.user.user_metadata?.name || 
                          'Vendeur',
                email: userData.user.email || 'Email non disponible',
                phone: userData.user.user_metadata?.phone || undefined,
                avatar_url: userData.user.user_metadata?.avatar_url || undefined
              };
              
              return listing;
            }
          } catch (authError) {
            console.log('Auth method error:', authError);
          }
          
          // Try users table as a last resort
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', listing.userId)
              .single();
            
            if (!userError && userData) {
              console.log('User data found from users table:', userData);
              listing.user = {
                full_name: userData.full_name || userData.name || 'Vendeur',
                email: userData.email || 'Email non disponible',
                phone: userData.phone || undefined,
                avatar_url: userData.avatar_url || undefined
              };
              return listing;
            }
          } catch (usersError) {
            console.error('Error with users table:', usersError);
          }
          
          // If we couldn't find user information anywhere, use a placeholder
          listing.user = {
            full_name: 'Vendeur #' + listing.userId.substring(0, 6),
            email: 'Contact via la plateforme',
            phone: undefined
          };
        }
        
        return listing;
      } catch (error) {
        console.error('Error in useListingById:', error);
        throw error;
      }
    },
    enabled: !!id && id !== 'undefined' && id !== 'null',
    retry: 2,
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
      queryClient.invalidateQueries({ queryKey: ['categoryListings'] });
      queryClient.invalidateQueries({ queryKey: ['userListings'] });
    }
  });
};

export const useFavorites = (userId: string) => {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: () => listingService.getFavorites(userId),
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
