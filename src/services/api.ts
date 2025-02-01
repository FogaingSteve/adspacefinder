import axios from 'axios';
import { CreateListingDTO, Listing } from "@/types/listing";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000/api'; // Ajustez l'URL selon votre configuration

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
};
