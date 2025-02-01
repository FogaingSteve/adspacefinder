import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

const ListingDetail = () => {
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  // This would normally come from an API or route params
  const listing = {
    id: 1,
    title: "Appartement 3 pièces",
    description: "Bel appartement lumineux au cœur de Paris, proche des transports et commerces. Cuisine équipée, salle de bain rénovée, parquet au sol.",
    price: "250,000 €",
    location: "Paris 11ème",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
    ],
    seller: {
      name: "Jean Dupont",
      phone: "+33 6 12 34 56 78",
      email: "jean.dupont@email.com"
    },
    createdAt: "2024-02-20"
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Découvrez cette annonce : ${listing.title} - ${listing.price}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text + "\n\n" + url)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Images and main info */}
        <div className="md:col-span-2 space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="object-cover w-full h-full"
            />
          </div>

          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-bold text-primary">{listing.price}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{listing.description}</p>
                </div>
                <div>
                  <h2 className="font-semibold mb-2">Localisation</h2>
                  <p className="text-gray-600">{listing.location}</p>
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
                  <p className="font-medium">{listing.seller.name}</p>
                  <p className="text-gray-600">{listing.seller.email}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full"
                    onClick={() => setShowSafetyDialog(true)}
                  >
                    <Phone className="mr-2" />
                    {showPhoneNumber ? listing.seller.phone : "Afficher le numéro"}
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleShare("whatsapp")}
                    >
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleShare("facebook")}
                    >
                      Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleShare("email")}
                    >
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