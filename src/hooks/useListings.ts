import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingService } from "@/services/api";
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";

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

export const useListingById = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingService.getListingById(id),
    enabled: !!id,
    retry: 1,
  });
};

export const useListingByTitle = (title: string, category: string) => {
  return useQuery({
    queryKey: ['listingByTitle', title, category],
    queryFn: () => listingService.getListingByTitle(title, category),
    enabled: !!(title && category),
    retry: 1,
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
