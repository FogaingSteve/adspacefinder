import { useMutation } from "@tanstack/react-query";
import { listingService } from "@/services/api";
import { CreateListingDTO } from "@/types/listing";
import { toast } from "sonner";

export const useCreateListing = () => {
  return useMutation({
    mutationFn: (data: CreateListingDTO) => listingService.createListing(data),
    onSuccess: () => {
      toast.success("Annonce créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'annonce");
    }
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