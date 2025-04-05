import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, MapPin, CalendarDays, Store, User, Mail, Home, Calendar, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings } from "@/hooks/useListings";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";
import { supabase } from "@/lib/supabase";

const ProfileView = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) throw new Error("No profile ID");
      
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        return response.data;
      } catch (apiError) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          return data;
        } catch (supabaseError) {
          console.error("Error fetching profile:", supabaseError);
          return { id, name: "Utilisateur" };
        }
      }
    },
    enabled: !!id
  });
  
  const { data: listings, isLoading: listingsLoading } = useUserListings(id || "");
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };
  
  const isOwnProfile = currentUser?.id === id;
  
  if (profileLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 md:col-span-1" />
          <div className="md:col-span-2">
            <Skeleton className="h-12 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Profil non trouvé</h2>
          <p className="text-red-700 mb-4">
            Ce profil n'existe pas ou a été supprimé.
          </p>
          <Link to="/">
            <Button>
              Retourner à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.name?.charAt(0) || profile.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profile.name || profile.full_name || "Utilisateur"}</h2>
                {profile.joined_date && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>Membre depuis {formatDate(profile.joined_date)}</span>
                  </div>
                )}
              </div>
              
              {!isOwnProfile && (
                <div className="space-y-2">
                  <Link to={`/messages`} state={{ sellerId: id }}>
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-700">Détails du profil</h3>
                
                {profile.location && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                
                {profile.email && (
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                )}
                
                {profile.home_address && (
                  <div className="flex items-start">
                    <Home className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                    <span>{profile.home_address}</span>
                  </div>
                )}
                
                {profile.bio && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-700 mb-2">À propos</h3>
                    <p className="text-sm text-gray-600">{profile.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="listings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="listings">Annonces ({listings?.length || 0})</TabsTrigger>
              <TabsTrigger value="reviews">Avis (0)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="listings">
              {listingsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-48" />
                  ))}
                </div>
              ) : listings?.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune annonce</h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "Vous n'avez pas encore publié d'annonces."
                      : "Cet utilisateur n'a pas encore publié d'annonces."}
                  </p>
                  {isOwnProfile && (
                    <Button className="mt-4" asChild>
                      <Link to="/listings/create">Publier une annonce</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map((listing: any) => (
                    <Link
                      key={listing.id || listing._id}
                      to={`/listings/${listing.id || listing._id}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={listing.images?.[0] || "https://via.placeholder.com/400x300?text=Pas+d'image"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                          }}
                        />
                        {listing.isSold && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold transform -rotate-12">
                              Vendu
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg text-gray-900 line-clamp-1 mb-1">
                          {listing.title}
                        </h3>
                        <p className="text-primary font-bold">{listing.price.toLocaleString()} CFA</p>
                        <div className="flex items-center gap-1 mt-2 text-gray-500 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{listing.location}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun avis</h3>
                <p className="text-gray-500">
                  {isOwnProfile
                    ? "Vous n'avez pas encore reçu d'avis."
                    : "Cet utilisateur n'a pas encore reçu d'avis."}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
