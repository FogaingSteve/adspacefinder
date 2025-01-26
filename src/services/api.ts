import { CreateListingDTO, Listing } from "@/types/listing";
import { supabase } from "@/lib/supabase";

// L'URL de notre API Node.js
const API_URL = "http://localhost:5000/api";

export const listingService = {
  async createListing(listing: CreateListingDTO): Promise<Listing> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une annonce");
    }

    try {
      // Créer un FormData pour envoyer les images
      const formData = new FormData();
      
      // Ajouter les données de l'annonce
      formData.append('title', listing.title);
      formData.append('description', listing.description);
      formData.append('price', listing.price.toString());
      formData.append('category', listing.category);
      formData.append('location', listing.location);
      formData.append('userId', user.id);

      // Ajouter les images
      if (listing.images && listing.images.length > 0) {
        listing.images.forEach((image, index) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.id}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création de l'annonce");
      }

      return response.json();
    } catch (error) {
      console.error("Erreur création annonce:", error);
      throw error;
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour uploader des images");
    }

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("images", file));

      const response = await fetch(`${API_URL}/listings/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.id}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload des images");
      }

      return response.json();
    } catch (error) {
      console.error("Erreur upload images:", error);
      throw error;
    }
  }
};