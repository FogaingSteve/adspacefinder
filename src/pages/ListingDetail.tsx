
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Heart, MessageCircle, Phone, Share, 
  MapPin, Calendar, Tag, Store, User, Mail, X
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToggleFavorite } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import axios from "axios";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [processingFavorite, setProcessingFavorite] = useState(false);
  const toggleFavorite = useToggleFavorite();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  
  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
      return response.data;
    }
  });
  
  const { data: seller } = useQuery({
    queryKey: ['user', listing?.userId],
    queryFn: async () => {
      if (!listing?.userId) throw new Error("No seller ID");
      
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${listing.userId}`);
        return response.data;
      } catch (apiError) {
        try {
          // First try to get from profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', listing.userId)
            .single();
            
          if (!profileError && profileData) {
            return profileData;
          }
          
          // If not found in profiles, try to get from auth.users with raw_user_meta_data
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, created_at, raw_user_meta_data')
            .eq('id', listing.userId)
            .single();
          
          if (userError) throw userError;
          
          // Transform the data to match expected format
          return {
            id: userData.id,
            email: userData.email,
            created_at: userData.created_at,
            user_metadata: userData.raw_user_meta_data || {},
            name: userData.raw_user_meta_data?.name || listing.userName || "Vendeur anonyme",
            full_name: userData.raw_user_meta_data?.full_name
          };
        } catch (supabaseError) {
          console.error("Error fetching seller info:", supabaseError);
          return { 
            id: listing.userId,
            name: listing.userName || "Vendeur anonyme"
          };
        }
      }
    },
    enabled: !!listing?.userId
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour ajouter aux favoris");
      return;
    }
    
    setProcessingFavorite(true);
    
    try {
      await toggleFavorite.mutateAsync({
        listingId: id!,
        userId: user.id
      });
      
      toast.success("Favori mis à jour");
    } catch (error) {
      console.error("Erreur toggle favori:", error);
      toast.error("Erreur lors de l'ajout aux favoris");
    } finally {
      setProcessingFavorite(false);
    }
  };
  
  const handleShareListing = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien de l'annonce copié dans le presse-papier");
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };
  
  const isFavorite = () => {
    if (!user || !listing?.favorites) return false;
    return listing.favorites.includes(user.id);
  };

  const openImageDialog = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="mt-4">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !listing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Annonce non trouvée</h2>
          <p className="text-red-700 mb-4">
            Cette annonce n'existe pas ou a été supprimée.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retourner à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Link to="/" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="text-sm breadcrumbs text-gray-500">
          <span>Accueil</span>
          <span className="mx-2">/</span>
          {listing.category && (
            <>
              <Link to={`/categories/${listing.category}`} className="hover:text-primary">
                {listing.category}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-700">{listing.title}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            {listing.images && listing.images.length > 0 ? (
              <div>
                <div className="relative aspect-video overflow-hidden cursor-pointer" 
                     onClick={() => openImageDialog(selectedImageIndex)}>
                  <img
                    src={listing.images[selectedImageIndex]}
                    alt={`${listing.title} - image principale`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Image+non+disponible";
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {selectedImageIndex + 1}/{listing.images.length}
                  </div>
                </div>
                
                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {listing.images.map((img: string, index: number) => (
                    <div 
                      key={index}
                      className={`aspect-square overflow-hidden cursor-pointer border-2 ${
                        selectedImageIndex === index ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={img}
                        alt={`${listing.title} - miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/150x150/e2e8f0/1e293b?text=Image+non+disponible";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">Aucune image disponible</p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShareListing}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={processingFavorite}
                  className={isFavorite() ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 ${isFavorite() ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-primary mb-4">
              {listing.price.toLocaleString()} CFA
            </div>
            
            {listing.isSold && (
              <Badge variant="destructive" className="mb-4">
                Vendu
              </Badge>
            )}
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Date de publication</div>
                  <div>{formatDate(listing.createdAt)}</div>
                </div>
              </div>
              
              {listing.category && (
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Catégorie</div>
                    <Link to={`/categories/${listing.category}`} className="hover:text-primary">
                      {listing.category}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Store className="h-5 w-5 mr-2" />
                Informations sur le vendeur
              </h3>
              
              {seller ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {seller.name || 
                       seller.user_metadata?.name || 
                       seller.user_metadata?.full_name || 
                       seller.full_name || 
                       "Nom non spécifié"}
                    </span>
                  </div>
                  
                  <Link 
                    to={`/profile/${seller.id}`}
                    className="block w-full"
                  >
                    <Button className="w-full">
                      Voir le profil du vendeur
                    </Button>
                  </Link>
                  
                  <Link 
                    to={`/messages`}
                    state={{ sellerId: seller.id, listingId: listing.id }}
                    className="block w-full mt-2"
                  >
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contacter le vendeur
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  Chargement des informations du vendeur...
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Conseils de sécurité</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Rencontrez le vendeur dans un lieu public sécurisé</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Vérifiez le produit avant de payer</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Ne payez pas d'avance ou via des services de transfert non sécurisés</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{listing.title} - Image {selectedImageIndex + 1}/{listing.images?.length || 0}</span>
              <DialogClose className="rounded-full p-1 hover:bg-gray-200">
                <X className="h-5 w-5" />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          {listing.images && listing.images.length > 0 && (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((img: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="flex justify-center items-center">
                        <img
                          src={img}
                          alt={`${listing.title} - image ${index + 1}`}
                          className="max-h-[60vh] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Image+non+disponible";
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              {/* Thumbnails in dialog */}
              <div className="grid grid-cols-6 gap-2 mt-4">
                {listing.images.map((img: string, index: number) => (
                  <div 
                    key={index}
                    className={`aspect-square overflow-hidden cursor-pointer border-2 ${
                      selectedImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`${listing.title} - miniature ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/150x150/e2e8f0/1e293b?text=Image+non+disponible";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
