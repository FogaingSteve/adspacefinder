import axios from 'axios';
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

const API_URL = 'http://localhost:5000/api';

// Créer une instance axios avec la configuration par défaut
const api = axios.create({
  baseURL: API_URL
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  } else {
    if (config.url?.includes('/categories') || config.url?.includes('/listings/recent')) {
      return config;
    }
    toast.error("Veuillez vous connecter");
    return Promise.reject("Non authentifié");
  }
  return config;
});

// Service pour les annonces
export const listingService = {
  async createListing(listing: CreateListingDTO): Promise<Listing> {
    try {
      console.log("Session:", await supabase.auth.getSession());
      const response = await api.post('/listings', listing);
      toast.success("Annonce créée avec succès");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Veuillez vous connecter pour créer une annonce");
      } else {
        toast.error("Erreur lors de la création de l'annonce");
        console.error("Erreur création annonce:", error);
      }
      throw error;
    }
  },

  async updateListing(id: string, listing: Partial<CreateListingDTO>): Promise<Listing> {
    try {
      const response = await api.put(`/listings/${id}`, listing);
      return response.data;
    } catch (error) {
      console.error("Erreur mise à jour annonce:", error);
      throw new Error("Erreur lors de la mise à jour de l'annonce");
    }
  },

  async deleteListing(id: string): Promise<void> {
    try {
      await api.delete(`/listings/${id}`);
    } catch (error) {
      console.error("Erreur suppression annonce:", error);
      throw new Error("Erreur lors de la suppression de l'annonce");
    }
  },

  async markAsSold(id: string): Promise<Listing> {
    try {
      const response = await api.put(`/listings/${id}/sold`);
      return response.data;
    } catch (error) {
      console.error("Erreur marquage comme vendu:", error);
      throw new Error("Erreur lors du marquage comme vendu");
    }
  },

  async getRecentListings(): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/recent`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération annonces récentes:", error);
      throw new Error("Erreur lors de la récupération des annonces récentes");
    }
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    try {
      console.log("Récupération des annonces pour userId:", userId);
      const response = await api.get(`/listings/user/${userId}`);
      console.log("Annonces reçues:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération annonces utilisateur:", error);
      toast.error("Erreur lors de la récupération de vos annonces");
      throw error;
    }
  },

  async getListingsByCategory(categoryId: string): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération annonces par catégorie:", error);
      throw new Error("Erreur lors de la récupération des annonces par catégorie");
    }
  },

  async searchListings(query: string, category?: string, exactTitle?: string): Promise<Listing[]> {
    try {
      const params: any = { q: query };
      if (category) {
        params.category = category;
      }
      if (exactTitle) {
        params.exactTitle = exactTitle;
      }
      
      console.log("Recherche avec params:", params);
      // Use regular axios here to avoid authentication issues for public routes
      const response = await axios.get(`${API_URL}/listings/search`, { params });
      
      if (!response.data) {
        console.error("Réponse API vide");
        throw new Error("Aucune donnée reçue du serveur");
      }
      
      console.log("Résultats de recherche:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur recherche annonces:", error);
      console.error("Détails:", error.response?.data);
      
      if (error.response?.status === 500) {
        if (error.response?.data?.message?.includes("Cast to ObjectId failed")) {
          throw new Error("Format d'ID invalide pour cette recherche");
        }
      }
      
      throw new Error("Erreur lors de la recherche d'annonces");
    }
  },

  async getListingByTitle(title: string): Promise<Listing> {
    try {
      const results = await this.searchListings(title, undefined, title);
      if (results && results.length > 0) {
        return results[0];
      }
      throw new Error("Annonce non trouvée");
    } catch (error) {
      console.error("Erreur récupération annonce par titre:", error);
      throw new Error("Erreur lors de la récupération de l'annonce par titre");
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const response = await api.post(`/listings/upload`, formData);
      return response.data.urls;
    } catch (error) {
      console.error("Erreur upload images:", error);
      throw new Error("Erreur lors de l'upload des images");
    }
  },

  async toggleFavorite(listingId: string, userId: string): Promise<void> {
    try {
      await api.post(`/listings/${listingId}/favorite`, { userId });
    } catch (error) {
      console.error("Erreur toggle favori:", error);
      throw new Error("Erreur lors de l'ajout/retrait des favoris");
    }
  },

  async getFavorites(userId: string): Promise<Listing[]> {
    try {
      const response = await api.get(`/listings/favorites/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération favoris:", error);
      throw new Error("Erreur lors de la récupération des favoris");
    }
  }
};

// Service pour les catégories
export const categoryService = {
  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération catégories:", error);
      throw error;
    }
  },

  async getCategory(categoryId: string) {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération catégorie ${categoryId}:`, error);
      throw error;
    }
  },

  async getSubcategory(categoryId: string, subcategoryId: string) {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}/${subcategoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération sous-catégorie ${subcategoryId}:`, error);
      throw error;
    }
  }
};
