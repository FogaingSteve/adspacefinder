import { useState } from "react";
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

export const ListingModeration = () => {
  const [listings, setListings] = useState<Listing[]>([]);

  const { isLoading } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: adminService.getPendingListings,
    onSuccess: (data) => setListings(data),
    onError: () => toast.error("Erreur lors du chargement des annonces")
  });

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

  if (isLoading) return <div>Chargement...</div>;

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
              <TableCell>{listing.title}</TableCell>
              <TableCell>{listing.category}</TableCell>
              <TableCell>{listing.price}€</TableCell>
              <TableCell>
                <Badge>En attente</Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="default"
                  onClick={() => handleApproveListing(listing.id!)}
                >
                  Approuver
                </Button>
                <Button
                  variant="destructive"
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