
import axios from 'axios';
import { Listing } from '@/types/listing';

const API_URL = 'http://localhost:5000/api/admin';

export const adminService = {
  async getUsers() {
    try {
      const response = await axios.get(`${API_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async banUser(userId: string) {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/ban`);
      return response.data;
    } catch (error) {
      console.error("Error banning user:", error);
      throw error;
    }
  },

  async getPendingListings(): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/listings/pending`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending listings:", error);
      throw error;
    }
  },

  async approveListing(listingId: string) {
    try {
      const response = await axios.post(`${API_URL}/listings/${listingId}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving listing:", error);
      throw error;
    }
  },

  async rejectListing(listingId: string) {
    try {
      const response = await axios.post(`${API_URL}/listings/${listingId}/reject`);
      return response.data;
    } catch (error) {
      console.error("Error rejecting listing:", error);
      throw error;
    }
  },

  async getStatistics() {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw error;
    }
  },

  async getNotificationSettings() {
    try {
      const response = await axios.get(`${API_URL}/notifications/settings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      throw error;
    }
  },

  async updateNotificationSettings(settings: any) {
    try {
      const response = await axios.put(`${API_URL}/notifications/settings`, settings);
      return response.data;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async addCategory(categoryData: { name: string }) {
    try {
      const response = await axios.post(`${API_URL}/categories`, categoryData);
      return response.data;
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    }
  },

  async deleteCategory(categoryId: string) {
    try {
      const response = await axios.delete(`${API_URL}/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
};
