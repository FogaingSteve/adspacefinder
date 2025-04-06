
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminService } from "@/services/admin";
import { Listing } from "@/types/listing";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";

export const ListingModeration = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les annonces en attente
  useEffect(() => {
    const fetchPendingListings = async () => {
      setIsLoading(true);
      try {
        // Fetch from backend
        const response = await axios.get(
          "http://localhost:5000/api/listings/admin/pending", 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        console.log("Annonces en attente:", response.data);
        setListings(response.data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des annonces en attente:", error);
        toast.error("Erreur lors du chargement des annonces en attente");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.user_metadata?.is_admin) {
      fetchPendingListings();
    }
  }, [user]);

  const handleApproveListing = async (listingId: string) => {
    try {
      await adminService.approveListing(listingId);
      toast.success("Annonce approuvée");
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (error) {
      toast.error("Erreur lors de l'approbation de l'annonce");
    }
  };

  const handleRejectListing = async (listingId: string) => {
    try {
      await adminService.rejectListing(listingId);
      toast.success("Annonce rejetée");
      setListings(listings.filter(listing => listing.id !== listingId));
    } catch (error) {
      toast.error("Erreur lors du rejet de l'annonce");
    }
  };

  if (isLoading) return <div>Chargement des annonces en attente...</div>;

  if (listings.length === 0) {
    return <div className="text-center p-6">Aucune annonce en attente de modération</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-medium">{listing.title}</TableCell>
              <TableCell>{listing.category}</TableCell>
              <TableCell>{listing.price}€</TableCell>
              <TableCell>
                <Badge variant="outline">En attente</Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApproveListing(listing.id!)}
                >
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRejectListing(listing.id!)}
                >
                  Rejeter
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
