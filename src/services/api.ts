import axios from 'axios';
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000/api';

export const listingService = {
  async createListing(listing: CreateListingDTO): Promise<Listing> {
    try {
      const response = await axios.post(`${API_URL}/listings`, listing);
      return response.data;
    } catch (error) {
      console.error("Erreur création annonce:", error);
      throw new Error("Erreur lors de la création de l'annonce");
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

  async searchListings(query: string): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/search`, {
        params: { q: query }
      });
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

      const response = await axios.post(`${API_URL}/listings/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.urls;
    } catch (error) {
      console.error("Erreur upload images:", error);
      throw new Error("Erreur lors de l'upload des images");
    }
  },

  async toggleFavorite(listingId: string, userId: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/listings/${listingId}/favorite`, { userId });
      toast.success("Statut des favoris mis à jour");
    } catch (error) {
      console.error("Erreur mise à jour favoris:", error);
      throw new Error("Erreur lors de la mise à jour des favoris");
    }
  },

  async getFavorites(userId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/favorites`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération favoris:", error);
      throw new Error("Erreur lors de la récupération des favoris");
    }
  }
};