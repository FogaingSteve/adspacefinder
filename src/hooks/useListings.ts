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
        
        // Try to fetch the vendor information from Supabase
        if (listing && listing.userId) {
          console.log('Fetching user profile for userId:', listing.userId);
          
          try {
            // Récupérer directement depuis l'API supabase.auth.getUser
            const { data, error } = await supabase.auth.getUser();
            
            if (error) {
              console.error('Error getting current user:', error);
              throw error;
            }
            
            if (data && data.user) {
              console.log('Current user:', data.user);
              
              // Tenter de récupérer l'utilisateur spécifique depuis supabase
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', listing.userId)
                .single();
              
              if (userError) {
                console.error('Error fetching vendor profile:', userError);
                
                // Si l'erreur est que la table profiles n'existe pas, utiliser les metadonnées d'auth
                if (userError.message.includes("does not exist")) {
                  console.log('Trying to get user data from auth metadata');
                  
                  // Utiliser getSession pour récupérer l'utilisateur, pas besoin de l'admin API
                  const { data: sessionData } = await supabase.auth.getSession();
                  
                  if (sessionData && sessionData.session) {
                    const user = sessionData.session.user;
                    
                    if (user && user.id === listing.userId) {
                      console.log('User data from session:', user);
                      listing.user = {
                        full_name: user.user_metadata?.full_name || 
                                  user.user_metadata?.name || 
                                  'Utilisateur',
                        email: user.email || 'Email non disponible',
                        phone: user.user_metadata?.phone || undefined
                      };
                    } else {
                      // Fallback pour un autre utilisateur
                      listing.user = {
                        full_name: 'Information vendeur non disponible',
                        email: 'Email non disponible',
                        phone: undefined
                      };
                    }
                  }
                }
              } else if (userData) {
                console.log('Vendor profile found:', userData);
                listing.user = {
                  full_name: userData.full_name || userData.name || 'Utilisateur',
                  email: userData.email || 'Email non disponible',
                  phone: userData.phone || undefined
                };
              }
            } else {
              console.log('No current user found');
              listing.user = {
                full_name: 'Information vendeur non disponible',
                email: 'Email non disponible',
                phone: undefined
              };
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Impossible de récupérer les informations du vendeur");
            listing.user = {
              full_name: 'Information vendeur non disponible',
              email: 'Email non disponible',
              phone: undefined
            };
          }
        } else {
          console.warn('No userId available for this listing, cannot fetch vendor information');
          toast.error("ID vendeur manquant pour cette annonce");
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
