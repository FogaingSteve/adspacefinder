
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
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { id } = useParams();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles:users(full_name, email, phone)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Images and main info */}
        <div className="md:col-span-2 space-y-6">
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images.map((image: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </CarouselItem>
              ))}
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
                    {new Date(listing.created_at).toLocaleDateString("fr-FR", {
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
                  <p className="font-medium">{listing.profiles?.full_name}</p>
                  <p className="text-gray-600">{listing.profiles?.email}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {listing.profiles?.phone && (
                    <Button 
                      className="w-full"
                      onClick={() => setShowSafetyDialog(true)}
                    >
                      <Phone className="mr-2" />
                      {showPhoneNumber ? listing.profiles.phone : "Afficher le numéro"}
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
