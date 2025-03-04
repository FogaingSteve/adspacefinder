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
      
      // Use the dedicated endpoint to avoid ObjectId parsing issues
      const response = await axios.get(`${API_URL}/listings/search-results`, { params });
      
      if (!response.data) {
        console.error("Réponse API vide");
        throw new Error("Aucune donnée reçue du serveur");
      }
      
      console.log("Résultats de recherche:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur recherche annonces:", error);
      console.error("Détails:", error.response?.data);
      
      throw new Error("Erreur lors de la recherche d'annonces: " + (error.response?.data?.message || error.message));
    }
  },

  async getListingById(id: string): Promise<Listing> {
    try {
      const response = await axios.get(`${API_URL}/listings/${id}`);
      if (!response.data) {
        throw new Error('Annonce non trouvée');
      }
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération annonce par ID:", error);
      if (error.response?.status === 404) {
        throw new Error("Cette annonce n'existe pas ou a été supprimée");
      }
      throw new Error("Erreur lors de la récupération de l'annonce: " + error.message);
    }
  },

  async getListingByTitle(title: string, category: string): Promise<Listing> {
    try {
      console.log(`Recherche annonce par titre "${title}" dans catégorie "${category}"`);
      
      // Make sure title is properly formatted
      const cleanTitle = title.trim();
      console.log(`Titre nettoyé: "${cleanTitle}"`);
      
      // IMPROVED APPROACH: First try direct API call for exact title match
      try {
        console.log("Tentative d'appel API direct pour correspondance exacte du titre");
        const directResponse = await axios.get(`${API_URL}/listings/exact-title/${encodeURIComponent(cleanTitle)}`);
        
        if (directResponse.data && !Array.isArray(directResponse.data)) {
          console.log("Succès: Annonce trouvée par appel direct:", directResponse.data);
          return directResponse.data;
        }
      } catch (err) {
        console.log("L'appel direct a échoué, tentative de recherche alternative", err);
      }
      
      // FALLBACK 1: Try with exactTitle parameter
      try {
        console.log("Tentative: recherche par titre exacte");
        const exactTitleResponse = await axios.get(`${API_URL}/listings/search-results`, { 
          params: { 
            exactTitle: cleanTitle
          }
        });
        
        if (exactTitleResponse.data && exactTitleResponse.data.length > 0) {
          console.log("Succès: Annonce trouvée par titre exacte:", exactTitleResponse.data[0]);
          return exactTitleResponse.data[0];
        }
      } catch (err) {
        console.log("Échec: Recherche par titre exacte a échoué", err);
      }
      
      // FALLBACK 2: Try with title as query parameter
      try {
        console.log("Tentative: recherche par titre comme query");
        const queryResponse = await axios.get(`${API_URL}/listings/search-results`, { 
          params: { 
            q: cleanTitle
          }
        });
        
        if (queryResponse.data && queryResponse.data.length > 0) {
          console.log("Succès: Annonce trouvée avec titre comme query:", queryResponse.data[0]);
          return queryResponse.data[0];
        }
      } catch (err) {
        console.log("Échec: Recherche avec titre comme query a échoué", err);
      }
      
      // FALLBACK 3: Try with title and category
      if (category && category.length > 0) {
        try {
          console.log("Tentative: recherche par titre et catégorie", { title: cleanTitle, category });
          const withCategoryResponse = await axios.get(`${API_URL}/listings/search-results`, { 
            params: { 
              q: cleanTitle,
              category: category
            }
          });
          
          if (withCategoryResponse.data && withCategoryResponse.data.length > 0) {
            console.log("Succès: Annonce trouvée avec titre et catégorie:", withCategoryResponse.data[0]);
            return withCategoryResponse.data[0];
          }
        } catch (err) {
          console.log("Échec: Recherche avec titre et catégorie a échoué", err);
        }
      }
      
      console.log("Toutes les tentatives de recherche ont échoué");
      throw new Error("Annonce introuvable");
    } catch (error: any) {
      console.error("Erreur récupération annonce par titre:", error);
      throw new Error("Cette annonce est introuvable");
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
