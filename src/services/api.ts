import { CreateListingDTO, Listing } from "@/types/listing";
import { supabase } from "@/lib/supabase";

// Cette URL devra être remplacée par l'URL de votre API Node.js une fois déployée
const API_URL = "http://localhost:3000/api";

export const listingService = {
  async createListing(listing: CreateListingDTO): Promise<Listing> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une annonce");
    }

    try {
      const response = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}` // À adapter selon votre système d'auth
        },
        body: JSON.stringify({
          ...listing,
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'annonce");
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