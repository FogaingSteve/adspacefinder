
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Edit, Trash, Eye, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings, useDeleteListing, useMarkListingAsSold } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Listing } from "@/types/listing";

const MyListings = () => {
  const { user } = useAuth();
  const { data: listings, isLoading, refetch } = useUserListings(user?.id || "");
  const deleteListing = useDeleteListing();
  const markAsSold = useMarkListingAsSold();
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log("Fetching listings for user:", user.id);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setActionInProgress(id);
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Annonce supprimée avec succès");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error("Erreur suppression:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    setActionInProgress(id);
    try {
      await markAsSold.mutateAsync(id);
      toast.success("Statut de l'annonce mis à jour");
      refetch();
    } catch (error) {
      toast.error("Erreur lors du marquage");
      console.error("Erreur lors du marquage:", error);
    } finally {
      setActionInProgress(null);
    }
  };

  const formatRelativeTime = (date: string | Date | undefined): string => {
    if (!date) return "Date inconnue";
    
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return `il y a ${formatDistanceToNow(parsedDate, { locale: fr })}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Connectez-vous pour voir vos annonces</h2>
            <Button asChild>
              <Link to="/auth/signin">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mes annonces</h1>
            
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between pb-6 border-b">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-24 h-24 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-5 w-20 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32" />
                  </div>
                ))}
              </div>
            ) : !listings || listings.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-4">Vous n'avez pas encore d'annonces</h2>
                <Button asChild>
                  <Link to="/listings/create">Créer une annonce</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {listings.map((listing: Listing) => {
                  const listingId = listing.id || listing._id;
                  return (
                    <div 
                      key={listingId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-0 gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={listing.images && listing.images[0] ? listing.images[0] : "https://via.placeholder.com/400x300?text=Pas+d'image"}
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                          }}
                        />
                        <div>
                          <h3 className="font-medium">{listing.title}</h3>
                          <p className="text-primary font-bold">{listing.price} €</p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(listing.createdAt)}
                          </p>
                          <p className={`text-sm ${listing.isSold ? 'text-red-600' : 'text-green-600'}`}>
                            {listing.isSold ? 'Vendu' : 'Disponible'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          disabled={actionInProgress === listingId}
                        >
                          <Link to={`/listings/${listingId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          disabled={actionInProgress === listingId}
                        >
                          <Link to={`/listings/${listingId}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteId(listingId)}
                          disabled={actionInProgress === listingId}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsSold(listingId)}
                          disabled={actionInProgress === listingId}
                          title={listing.isSold ? "Marquer comme disponible" : "Marquer comme vendu"}
                        >
                          {listing.isSold ? (
                            <XCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={actionInProgress === confirmDeleteId}
            >
              {actionInProgress === confirmDeleteId ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyListings;
