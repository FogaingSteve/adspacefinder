
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Facebook, Mail, MessageSquare, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";

const ListingDetail = () => {
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const { id, title, category } = useParams();
  const location = useLocation();

  // Déterminer si nous utilisons l'ID ou le titre pour récupérer l'annonce
  const fetchByTitle = location.pathname.includes('/categories/');
  
  // Requête pour obtenir l'annonce depuis MongoDB via l'API
  const { data: listing, isLoading: isListingLoading, error: listingError } = useQuery({
    queryKey: ['listing', fetchByTitle ? title : id, category],
    queryFn: async () => {
      try {
        if (fetchByTitle && title && category) {
          // Décodez le titre s'il est encodé dans l'URL
          const decodedTitle = decodeURIComponent(title);
          console.log("Fetching by title:", decodedTitle, "and category:", category);
          
          // Recherche par titre et catégorie
          const response = await axios.get(`http://localhost:5000/api/listings/search`, {
            params: { 
              q: decodedTitle,
              category: category
            }
          });
          
          console.log("Search response:", response.data);
          
          if (response.data && response.data.length > 0) {
            // Retourner le premier résultat qui correspond au titre exact
            const exactMatch = response.data.find((item: any) => 
              item.title.toLowerCase() === decodedTitle.toLowerCase()
            );
            
            if (exactMatch) {
              return exactMatch;
            } else if (response.data[0]) {
              return response.data[0];
            }
          }
          throw new Error('Annonce non trouvée');
        } else if (id) {
          // Récupérer par ID
          console.log("Fetching by ID:", id);
          const response = await axios.get(`http://localhost:5000/api/listings/${id}`);
          if (!response.data) {
            throw new Error('Annonce non trouvée');
          }
          return response.data;
        } else {
          throw new Error('Aucun identifiant ou titre fourni');
        }
      } catch (error: any) {
        console.error("Error fetching listing:", error);
        console.error("Error response:", error.response?.data);
        toast.error("Impossible de charger l'annonce");
        throw error;
      }
    },
    enabled: !!(fetchByTitle ? (title && category) : id),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Log the actual API URL being fetched for debugging
  useEffect(() => {
    if (fetchByTitle && title && category) {
      const decodedTitle = decodeURIComponent(title);
      console.log(`API URL: http://localhost:5000/api/listings/search?q=${encodeURIComponent(decodedTitle)}&category=${encodeURIComponent(category)}`);
    }
  }, [fetchByTitle, title, category]);

  // Requête pour obtenir les données de l'utilisateur depuis Supabase
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', listing?.userId],
    queryFn: async () => {
      if (!listing?.userId) {
        throw new Error('No user ID provided');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, email, phone')
        .eq('id', listing.userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!listing?.userId,
    retry: false
  });

  const isLoading = isListingLoading || isUserLoading;

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = listing ? `Découvrez cette annonce : ${listing.title} - ${listing.price}€` : '';
    
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + "\n\n" + url)}`
    };

    window.open(shareUrls[platform], "_blank");
  };

  // Rediriger si nous sommes sur /listings/undefined
  if (id === 'undefined' && !fetchByTitle) {
    return <Navigate to="/" replace />;
  }

  if ((!id && !title) || (id === 'undefined' && !title)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Aucun identifiant d'annonce n'a été fourni.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (listingError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Cette annonce est introuvable ou a été supprimée. Erreur: {(listingError as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="w-full h-[400px] rounded-lg" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing || !userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Cette annonce n'existe pas ou a été supprimée.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vérifier si les images sont disponibles
  const hasImages = listing.images && listing.images.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Images and main info */}
        <div className="md:col-span-2 space-y-6">
          {hasImages ? (
            <Carousel className="w-full">
              <CarouselContent>
                {listing.images.map((image: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${listing.title} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback for broken images
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              <p className="text-gray-400">Aucune image disponible</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-bold text-primary">{listing.price} €</p>
              {listing.isSold && (
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                  Vendu
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{listing.description}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Localisation</h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {listing.location}
                  </p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Catégorie</h2>
                  <p className="text-gray-600">
                    {listing.category} {listing.subcategory ? `> ${listing.subcategory}` : ''}
                  </p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Date de publication</h2>
                  <p className="text-gray-600">
                    {new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller contact card */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Contacter le vendeur</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{userData.full_name}</p>
                  <p className="text-gray-600">{userData.email}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {userData.phone && (
                    <Button 
                      className="w-full"
                      onClick={() => setShowSafetyDialog(true)}
                    >
                      <Phone className="mr-2" />
                      {showPhoneNumber ? userData.phone : "Afficher le numéro"}
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center gap-2"
                      onClick={() => handleShare("whatsapp")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center gap-2"
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 flex items-center gap-2"
                      onClick={() => handleShare("email")}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSafetyDialog} onOpenChange={setShowSafetyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conseils de sécurité</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Ne pas envoyer de paiements sans avoir vérifié le produit.</li>
                <li>Ne pas envoyer d'argent par des moyens de transfert d'argent, par virement bancaire ou par n'importe quels autres moyens.</li>
                <li>Donner rdv au vendeur dans un lieu public à une heure de passage.</li>
              </ol>
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowPhoneNumber(true);
                setShowSafetyDialog(false);
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
