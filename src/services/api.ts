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
    // Laisser passer certaines routes publiques sans token
    if (config.url?.includes('/categories') || 
        config.url?.includes('/listings/recent') || 
        (config.method === 'get' && config.url?.includes('/listings/'))) {
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
      console.log("Mise à jour annonce ID:", id);
      console.log("Données à mettre à jour:", listing);
      
      // Vérifier si l'ID est valide
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error("ID d'annonce invalide");
      }
      
      // S'assurer que les données sont valides avant l'envoi
      const cleanedListing: Partial<CreateListingDTO> = {};
      Object.entries(listing).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // @ts-ignore
          cleanedListing[key] = value;
        }
      });
      
      // Vérifier que nous avons des données à mettre à jour
      if (Object.keys(cleanedListing).length === 0) {
        throw new Error("Aucune donnée valide à mettre à jour");
      }
      
      const response = await api.put(`/listings/${id}`, cleanedListing);
      console.log("Réponse mise à jour:", response.data);
      toast.success("Annonce mise à jour avec succès");
      return response.data;
    } catch (error: any) {
      console.error("Erreur mise à jour annonce:", error);
      console.error("Détails:", error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error("Veuillez vous connecter pour modifier cette annonce");
      } else if (error.response?.status === 403) {
        toast.error("Vous n'êtes pas autorisé à modifier cette annonce");
      } else {
        toast.error(error.message || "Erreur lors de la mise à jour de l'annonce");
      }
      
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
      console.log(`Trying to mark listing ${id} as sold/unsold`);
      const response = await api.put(`/listings/${id}/sold`);
      console.log("Réponse markAsSold:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur marquage comme vendu:", error);
      console.error("Détails:", error.response?.data);
      throw error;
    }
  },

  async getRecentListings(): Promise<Listing[]> {
    try {
      // Utiliser axios directement au lieu de l'instance api pour éviter les problèmes d'authentification
      const response = await axios.get(`${API_URL}/listings/recent`);
      
      // Enrich listings with user data
      const enrichedListings = await Promise.all(response.data.map(async (listing: Listing) => {
        if (listing.userId) {
          try {
            // Try to get user from Supabase profiles
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', listing.userId)
              .single();
              
            if (!error && data) {
              listing.user = {
                full_name: data.full_name || data.name || 'Vendeur',
                email: data.email || 'Contact via la plateforme',
                phone: data.phone,
                avatar_url: data.avatar_url
              };
            }
          } catch (e) {
            console.log("Error fetching user data for listing:", e);
            listing.user = {
              full_name: `Vendeur #${listing.userId.substring(0, 6)}`,
              email: 'Contact via la plateforme'
            };
          }
        }
        return listing;
      }));
      
      return enrichedListings;
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
      console.log(`Fetching listing with ID: ${id}`);
    
      // Vérification de l'ID valide
      if (!id || id === 'undefined' || id === 'null') {
        console.error('ID invalide fourni:', id);
        throw new Error('ID d\'annonce invalide');
      }
    
      // Nettoyage de l'ID pour éviter les problèmes
      const cleanId = id.trim();
      console.log(`Cleaned ID: ${cleanId}`);
    
      const response = await axios.get(`${API_URL}/listings/${cleanId}`);
    
      if (!response.data) {
        console.error('Réponse vide de l\'API pour ID:', cleanId);
        throw new Error('Annonce non trouvée');
      }
    
      // Récupérer les informations du vendeur si userId existe
      if (response.data && response.data.userId) {
        try {
          console.log("Fetching user info for userId:", response.data.userId);
        
          // Récupérer depuis la table profiles
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', response.data.userId)
              .single();
            
            if (!profileError && profileData) {
              console.log("User profile found:", profileData);
              response.data.user = {
                full_name: profileData.full_name || profileData.name || 'Vendeur',
                email: profileData.email || 'Contact via la plateforme',
                phone: profileData.phone || undefined,
                avatar_url: profileData.avatar_url || undefined
              };
              return response.data;
            }
          } catch (profileErr) {
            console.log("Profiles table error:", profileErr);
          }
          
          // Si aucune information utilisateur n'est trouvée dans profiles, essayer auth
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(response.data.userId);
            
            if (userData && userData.user) {
              console.log("User found from auth admin:", userData);
              response.data.user = {
                full_name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || 'Vendeur',
                email: userData.user.email || 'Contact via la plateforme',
                phone: userData.user.user_metadata?.phone || undefined,
                avatar_url: userData.user.user_metadata?.avatar_url || undefined
              };
              return response.data;
            }
          } catch (authErr) {
            console.log("Auth admin error, trying regular auth:", authErr);
            
            // Fallback to regular auth if admin fails
            const { data: regularUserData } = await supabase.auth.getUser(response.data.userId);
            if (regularUserData && regularUserData.user) {
              console.log("User found from regular auth:", regularUserData);
              response.data.user = {
                full_name: regularUserData.user.user_metadata?.full_name || regularUserData.user.user_metadata?.name || 'Vendeur',
                email: regularUserData.user.email || 'Contact via la plateforme',
                phone: regularUserData.user.user_metadata?.phone || undefined,
                avatar_url: regularUserData.user.user_metadata?.avatar_url || undefined
              };
              return response.data;
            }
          }
          
          // Si toujours aucune information, utiliser un placeholder
          response.data.user = {
            full_name: `Vendeur #${response.data.userId.substring(0, 6)}`,
            email: 'Contact via la plateforme',
            phone: undefined
          };
        } catch (userError) {
          console.error("Error during user data retrieval:", userError);
          response.data.user = {
            full_name: 'Vendeur',
            email: 'Contact via la plateforme',
            phone: undefined
          };
        }
      }
    
      console.log("Final listing data with user info:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Erreur récupération annonce par ID:", error);
      console.error("Status:", error.response?.status);
      console.error("Message:", error.response?.data?.message || error.message);
    
      if (error.response?.status === 404) {
        throw new Error("Cette annonce n'existe pas ou a été supprimée");
      }
    
      throw new Error("Erreur lors de la récupération de l'annonce: " + 
        (error.response?.data?.message || error.message));
    }
  },

  async getListingByTitle(title: string, category: string): Promise<Listing> {
    try {
      console.log(`Recherche annonce par titre "${title}" dans catégorie "${category}"`);
      
      // Make sure title is properly formatted and decoded
      const cleanTitle = decodeURIComponent(title.trim());
      console.log(`Titre nettoyé et décodé: "${cleanTitle}"`);
      
      // STRATEGY 1: Try with search endpoint and exactTitle parameter
      try {
        console.log("Stratégie 1: recherche avec paramètre exactTitle");
        const exactTitleResponse = await axios.get(`${API_URL}/listings/search-results`, { 
          params: { 
            exactTitle: cleanTitle
          }
        });
        
        if (exactTitleResponse.data && exactTitleResponse.data.length > 0) {
          console.log("Succès Stratégie 1: Annonce trouvée par titre exacte:", exactTitleResponse.data[0]);
          return exactTitleResponse.data[0];
        }
      } catch (err) {
        console.log("Échec Stratégie 1: Recherche par titre exacte a échoué", err);
      }
      
      // STRATEGY 2: Try ALL listings and filter client-side (last resort)
      try {
        console.log("Stratégie 2: récupérer toutes les annonces récentes et filtrer côté client");
        const allListingsResponse = await axios.get(`${API_URL}/listings/recent`);
        
        if (allListingsResponse.data && allListingsResponse.data.length > 0) {
          // Case insensitive match
          const foundListing = allListingsResponse.data.find((listing: any) => 
            listing.title.toLowerCase() === cleanTitle.toLowerCase()
          );
          
          if (foundListing) {
            console.log("Succès Stratégie 2: Annonce trouvée dans les listings récents:", foundListing);
            return foundListing;
          }
        }
      } catch (err) {
        console.log("Échec Stratégie 2: Récupération des listings récents a échoué", err);
      }
      
      // STRATEGY 3: Try with title as query parameter
      try {
        console.log("Stratégie 3: recherche par titre comme query");
        const queryResponse = await axios.get(`${API_URL}/listings/search-results`, { 
          params: { 
            q: cleanTitle
          }
        });
        
        if (queryResponse.data && queryResponse.data.length > 0) {
          console.log("Succès Stratégie 3: Annonce trouvée avec titre comme query:", queryResponse.data[0]);
          return queryResponse.data[0];
        }
      } catch (err) {
        console.log("Échec Stratégie 3: Recherche avec titre comme query a échoué", err);
      }
      
      // STRATEGY 4: Try with title and category
      if (category && category.length > 0) {
        try {
          console.log("Stratégie 4: recherche par titre et catégorie", { title: cleanTitle, category });
          const withCategoryResponse = await axios.get(`${API_URL}/listings/search-results`, { 
            params: { 
              q: cleanTitle,
              category: category
            }
          });
          
          if (withCategoryResponse.data && withCategoryResponse.data.length > 0) {
            console.log("Succès Stratégie 4: Annonce trouvée avec titre et catégorie:", withCategoryResponse.data[0]);
            return withCategoryResponse.data[0];
          }
        } catch (err) {
          console.log("Échec Stratégie 4: Recherche avec titre et catégorie a échoué", err);
        }
      }
      
      console.log("Toutes les stratégies de recherche ont échoué");
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
      
      // Enrich favorites with user data
      const enrichedFavorites = await Promise.all(response.data.map(async (listing: Listing) => {
        if (listing.userId) {
          try {
            // Try to get user from Supabase profiles
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', listing.userId)
              .single();
              
            if (!error && data) {
              listing.user = {
                full_name: data.full_name || data.name || 'Vendeur',
                email: data.email || 'Contact via la plateforme',
                phone: data.phone,
                avatar_url: data.avatar_url
              };
            }
          } catch (e) {
            console.log("Error fetching user data for favorite:", e);
            listing.user = {
              full_name: `Vendeur #${listing.userId.substring(0, 6)}`,
              email: 'Contact via la plateforme'
            };
          }
        }
        return listing;
      }));
      
      return enrichedFavorites;
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
