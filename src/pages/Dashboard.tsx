import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings, useDeleteListing, useMarkListingAsSold } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Copy, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditListingForm } from "@/components/EditListingForm";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingListing, setEditingListing] = useState<any>(null);
  const deleteListing = useDeleteListing();
  const markListingAsSold = useMarkListingAsSold();

  const {
    data: listings,
    isLoading,
    refetch,
  } = useUserListings(user?.id || "");

  useEffect(() => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour voir vos annonces");
    }
  }, [user]);

  const filteredListings = listings?.filter((listing) =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Annonce supprimée avec succès");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'annonce");
    }
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      await markListingAsSold.mutateAsync(id);
      toast.success("Statut de l'annonce mis à jour");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut de l'annonce");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Lien copié dans le presse-papier!");
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Label htmlFor="search">Rechercher une annonce</Label>
        <Input
          type="text"
          id="search"
          placeholder="Rechercher par titre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1"
        />
      </div>

      <Table>
        <TableCaption>Vos annonces publiées.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Titre</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredListings?.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-medium">{listing.title}</TableCell>
              <TableCell>{listing.category}</TableCell>
              <TableCell>{listing.price} €</TableCell>
              <TableCell>
                {format(new Date(listing.createdAt), "PPP", { locale: fr })}
              </TableCell>
              <TableCell>
                {listing.isSold ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500 h-4 w-4" />
                    Vendu
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="text-red-500 h-4 w-4" />
                    Disponible
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(`${window.location.origin}/listings/${listing.id}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingListing(listing)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleteListing.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={listing.isSold ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleMarkAsSold(listing.id)}
                    disabled={markListingAsSold.isPending}
                  >
                    {listing.isSold ? "Marquer comme disponible" : "Marquer comme vendu"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingListing && (
        <Dialog open={!!editingListing} onOpenChange={() => setEditingListing(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier l'annonce</DialogTitle>
            </DialogHeader>
            <EditListingForm 
              listing={editingListing} 
              onSuccess={() => {
                setEditingListing(null);
                refetch();
              }}
              onCancel={() => setEditingListing(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
