
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
import { useParams, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useListingById } from "@/hooks/useListings";
import { UserInfo } from "@/types/listing";
import { toast } from "sonner";

const ListingDetail = () => {
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  console.log("Current URL:", window.location.href);
  console.log("Listing ID from params:", id);
  
  const { 
    data: listing, 
    isLoading, 
    error: listingError 
  } = useListingById(id || '', {
    enabled: !!id,
    retry: 3,
  });

  useEffect(() => {
    if (listingError) {
      console.error("Error loading listing:", listingError);
    }
  }, [listing, listingError]);

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

  const handleImageError = (imageUrl: string) => {
    console.log(`Image failed to load: ${imageUrl}`);
    setImageErrors(prev => ({...prev, [imageUrl]: true}));
  };

  const defaultUserInfo: UserInfo = {
    full_name: 'Information vendeur non disponible',
    email: 'Email non disponible',
    phone: undefined
  };

  if (!id) {
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

  if (!listing) {
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

  // Check if user information is valid
  const userInfo = listing.user || defaultUserInfo;
  const hasValidUser = userInfo && 
                      userInfo.full_name && 
                      userInfo.full_name !== 'Information vendeur non disponible' &&
                      userInfo.full_name !== 'Utilisateur';

  console.log("User info to display:", userInfo);
  console.log("Has valid user:", hasValidUser);

  // Filter out images that failed to load
  const validImages = listing?.images ? 
    listing.images.filter(img => !imageErrors[img]) : 
    [];
    
  const hasImages = validImages.length > 0;
  const defaultImageUrl = 'https://placehold.co/400x300/e2e8f0/1e293b?text=Image+non+disponible';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {hasImages ? (
            <Carousel className="w-full">
              <CarouselContent>
                {validImages.map((image: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${listing.title} - Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={() => handleImageError(image)}
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
              <img 
                src={defaultImageUrl}
                alt="Image non disponible"
                className="object-contain w-full h-full"
              />
            </div>
          )}

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
                  <h2 className="font-semibold mb-2">Catégorie</h2>
                  <p className="text-gray-600">
                    {listing.category} {listing.subcategory ? `> ${listing.subcategory}` : ''}
                  </p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Date de publication</h2>
                  <p className="text-gray-600">
                    {new Date(listing.createdAt || "").toLocaleDateString("fr-FR", {
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

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Contacter le vendeur</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="font-medium text-lg">
                    {hasValidUser 
                      ? userInfo.full_name 
                      : 'Information vendeur non disponible'}
                  </p>
                  {hasValidUser && userInfo.email && userInfo.email !== 'Email non disponible' && (
                    <p className="text-gray-600">{userInfo.email}</p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {hasValidUser && userInfo.phone && (
                    <Button 
                      className="w-full"
                      onClick={() => setShowSafetyDialog(true)}
                    >
                      <Phone className="mr-2" />
                      {showPhoneNumber ? userInfo.phone : "Afficher le numéro"}
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
