
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Mail, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory: string;
  createdAt: string;
  isSold: boolean;
}

const ProfileView = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch user listings
  const { data: listings, isLoading: isListingsLoading } = useQuery({
    queryKey: ['user-listings', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/listings/user/${userId}`);
      return response.data as Listing[];
    },
    enabled: !!userId && !isLoading,
  });

  const handleMessageUser = async () => {
    if (!user || !userId) return;
    
    try {
      // Check if a conversation already exists
      const { data: existingConversation, error: existingError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing conversation:', existingError);
        return;
      }

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/messages?conversation=${existingConversation.id}`);
        return;
      }

      // Create a new conversation
      const { data: newConversation, error: newError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: userId,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (newError) {
        console.error('Error creating conversation:', newError);
        return;
      }

      // Navigate to the new conversation
      navigate(`/messages?conversation=${newConversation.id}`);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-8">
          <div className="flex gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Tabs defaultValue="listings">
            <TabsList>
              <TabsTrigger value="listings">Annonces</TabsTrigger>
              <TabsTrigger value="about">À propos</TabsTrigger>
            </TabsList>
            <TabsContent value="listings" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-xl text-center">Utilisateur non trouvé</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.user_metadata?.avatar_url || ""} />
            <AvatarFallback>{profile.user_metadata?.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{profile.user_metadata?.name || "Utilisateur"}</h1>
            <div className="flex items-center gap-1 text-gray-500">
              <CalendarDays className="h-4 w-4" />
              <span>Membre depuis {format(new Date(profile.created_at), 'MMMM yyyy', { locale: fr })}</span>
            </div>
            {user?.id !== userId && (
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleMessageUser}
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList>
            <TabsTrigger value="listings">Annonces</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="mt-4">
            {isListingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing._id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      <img
                        src={listing.images[0] || '/placeholder.svg'}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                      {listing.isSold && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Vendu
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <CardDescription>{listing.price} FCFA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm line-clamp-2">{listing.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link to={`/listings/${listing._id}`}>
                        <Button variant="outline" size="sm">Voir l'annonce</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune annonce publiée</p>
            )}
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Bio</h3>
                    <p className="text-gray-600">{profile.user_metadata?.bio || "Aucune bio renseignée"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Contact</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
