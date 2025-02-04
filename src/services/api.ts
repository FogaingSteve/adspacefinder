import axios from 'axios';
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000/api';

// Créer une instance axios avec la configuration par défaut
const api = axios.create({
  baseURL: API_URL
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ou récupérer depuis Supabase
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const listingService = {
  async createListing(listing: CreateListingDTO): Promise<Listing> {
    try {
      const response = await api.post('/listings', listing);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Veuillez vous connecter pour créer une annonce");
      } else {
        toast.error("Erreur lors de la création de l'annonce");
      }
      throw error;
    }
  },

  async updateListing(id: string, listing: Partial<CreateListingDTO>): Promise<Listing> {
    try {
      const response = await axios.put(`${API_URL}/listings/${id}`, listing);
      return response.data;
    } catch (error) {
      console.error("Erreur mise à jour annonce:", error);
      throw new Error("Erreur lors de la mise à jour de l'annonce");
    }
  },

  async deleteListing(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/listings/${id}`);
    } catch (error) {
      console.error("Erreur suppression annonce:", error);
      throw new Error("Erreur lors de la suppression de l'annonce");
    }
  },

  async markAsSold(id: string): Promise<Listing> {
    try {
      const response = await axios.put(`${API_URL}/listings/${id}/sold`);
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
      const response = await axios.get(`${API_URL}/listings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération annonces utilisateur:", error);
      throw new Error("Erreur lors de la récupération des annonces de l'utilisateur");
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

  async searchListings(query: string): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/search`, { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error("Erreur recherche annonces:", error);
      throw new Error("Erreur lors de la recherche d'annonces");
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      const response = await axios.post(`${API_URL}/listings/upload`, formData);
      return response.data.urls;
    } catch (error) {
      console.error("Erreur upload images:", error);
      throw new Error("Erreur lors de l'upload des images");
    }
  },

  async toggleFavorite(listingId: string, userId: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/listings/${listingId}/favorite`, { userId });
    } catch (error) {
      console.error("Erreur toggle favori:", error);
      throw new Error("Erreur lors de l'ajout/retrait des favoris");
    }
  },

  async getFavorites(userId: string): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/favorites/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération favoris:", error);
      throw new Error("Erreur lors de la récupération des favoris");
    }
  }
};
