
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Facebook, Mail, MessageSquare, MapPin, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../services/api"; // Utiliser l'instance api exportée
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
        if (fetchByTitle && title) {
          // Décodez le titre s'il est encodé dans l'URL
          const decodedTitle = decodeURIComponent(title);
          console.log("Fetching by title:", decodedTitle, "and category:", category);
          
          // Si la catégorie est disponible, l'utiliser pour la requête
          if (category) {
            const response = await api.get(`/listings/search`, {
              params: { 
                q: decodedTitle,
                category: category
              }
            });
            
            if (response.data && response.data.length > 0) {
              // Retourner le premier résultat qui correspond au titre exact
              const exactMatch = response.data.find((item: any) => 
                item.title.toLowerCase() === decodedTitle.toLowerCase()
              );
              
              return exactMatch || response.data[0];
            }
            throw new Error('Annonce non trouvée');
          } else {
            // Recherche uniquement par titre si la catégorie n'est pas spécifiée
            const response = await api.get(`/listings/title/${encodeURIComponent(decodedTitle)}`);
            if (!response.data) {
              throw new Error('Annonce non trouvée');
            }
            return response.data;
          }
        } else if (id) {
          // Récupérer par ID
          console.log("Fetching by ID:", id);
          const response = await api.get(`/listings/${id}`);
          if (!response.data) {
            throw new Error('Annonce non trouvée');
          }
          return response.data;
        } else {
          throw new Error('Aucun identifiant ou titre fourni');
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        throw error;
      }
    },
    enabled: !!(fetchByTitle ? title : id),
    retry: 2
  });

  // Requête pour obtenir les données de l'utilisateur depuis Supabase
  const { data: userData, isLoading: isUserLoading, error: userError } = useQuery({
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
    retry: 1
  });

  const isLoading = isListingLoading || isUserLoading;
  const hasError = listingError || userError;

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = listing ? `Découvrez cette annonce : ${listing.title} - ${listing.price}€` : '';
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + "\n\n" + url)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
  };

  // Rediriger si nous sommes sur /listings/undefined
  if (id === 'undefined' && !fetchByTitle) {
    return <Navigate to="/" replace />;
  }

  if ((!id && !title) || (id === 'undefined' && !title)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Aucun identifiant d'annonce n'a été fourni.
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

  if (hasError || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cette annonce n'existe pas ou a été supprimée.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Images and main info */}
          <div className="md:col-span-2 space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {listing.images && listing.images.length > 0 ? (
                  listing.images.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fallback for broken images
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src="/placeholder.svg"
                        alt={`${listing.title} - Aucune image`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

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
                    <h2 className="font-semibold mb-2">Date de publication</h2>
                    <p className="text-gray-600">
                      {listing.createdAt 
                        ? new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })
                        : "Date inconnue"}
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
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Impossible de charger les informations du vendeur.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Si tout est bien chargé, afficher l'annonce complète
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Images and main info */}
        <div className="md:col-span-2 space-y-6">
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images && listing.images.length > 0 ? (
                listing.images.map((image: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${listing.title} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Fallback for broken images
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src="/placeholder.svg"
                      alt={`${listing.title} - Aucune image`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-bold text-primary">{listing.price} CFA</p>
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
                  <h2 className="font-semibold mb-2">Date de publication</h2>
                  <p className="text-gray-600">
                    {listing.createdAt
                      ? new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })
                      : "Date inconnue"}
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
