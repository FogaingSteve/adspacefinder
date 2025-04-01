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
        
        // Tenter de récupérer les informations du vendeur même si on n'est pas le vendeur
        if (listing && listing.userId) {
          console.log('Fetching user profile for userId:', listing.userId);
          
          try {
            // Récupérer les informations de l'utilisateur directement depuis Supabase Auth
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(listing.userId);
            
            if (userError) {
              console.error('Error getting vendor user data:', userError);
              throw userError;
            }
            
            if (userData && userData.user) {
              console.log('Vendor data found from Auth:', userData.user);
              
              listing.user = {
                full_name: userData.user.user_metadata?.full_name || 
                          userData.user.user_metadata?.name || 
                          'Vendeur',
                email: userData.user.email || 'Email non disponible',
                phone: userData.user.user_metadata?.phone || undefined
              };
              
              return listing;
            }
          } catch (adminError) {
            console.log('Admin API not accessible, trying alternative methods:', adminError);
            
            // Méthode alternative 1: Essayer de récupérer depuis la table profiles
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', listing.userId)
                .single();
              
              if (!profileError && profileData) {
                console.log('User profile found from profiles table:', profileData);
                listing.user = {
                  full_name: profileData.full_name || profileData.name || 'Vendeur',
                  email: profileData.email || 'Email non disponible',
                  phone: profileData.phone || undefined
                };
                return listing;
              }
            } catch (profilesError) {
              console.error('Error with profiles table:', profilesError);
            }
            
            // Méthode alternative 2: Essayer de récupérer depuis la table users
            try {
              const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .eq('id', listing.userId)
                .single();
              
              if (!usersError && usersData) {
                console.log('User data found from users table:', usersData);
                listing.user = {
                  full_name: usersData.full_name || usersData.name || 'Vendeur',
                  email: usersData.email_address || usersData.email || 'Email non disponible',
                  phone: usersData.phone || undefined
                };
                return listing;
              }
            } catch (usersError) {
              console.error('Error with users table:', usersError);
            }
            
            // Méthode alternative 3: Valeurs par défaut avec ID vendeur
            listing.user = {
              full_name: 'Vendeur #' + listing.userId.substring(0, 6),
              email: 'Contact via la plateforme',
              phone: undefined
            };
          }
        } else {
          console.warn('No userId available for this listing');
          listing.user = {
            full_name: 'Information vendeur non disponible',
            email: 'Email non disponible',
            phone: undefined
          };
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
