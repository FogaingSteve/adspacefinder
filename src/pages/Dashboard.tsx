
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, Eye, Heart, Search, Edit, Trash2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings, useDeleteListing, useMarkListingAsSold, useFavorites, useToggleFavorite } from "@/hooks/useListings";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userListings, isLoading: listingsLoading, refetch: refetchListings } = useUserListings(user?.id || "");
  const { data: favorites, isLoading: favoritesLoading, refetch: refetchFavorites } = useFavorites(user?.id || "");
  const deleteListing = useDeleteListing();
  const markAsSold = useMarkListingAsSold();
  const toggleFavorite = useToggleFavorite();
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const stats = [
    {
      title: "Annonces actives",
      value: userListings?.filter(l => !l.isSold).length || "0",
      icon: Package,
    },
    {
      title: "Messages non lus",
      value: "0",
      icon: MessageSquare,
    },
    {
      title: "Favoris",
      value: favorites?.length || "0",
      icon: Heart,
    },
  ];

  const filteredListings = userListings?.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      await deleteListing.mutateAsync(id);
      setListingToDelete(null);
      toast.success("Annonce supprimée avec succès");
      refetchListings();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de l'annonce");
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAsSold = async (id: string) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      const result = await markAsSold.mutateAsync(id);
      toast.success(result.isSold ? "Annonce marquée comme vendue" : "Annonce marquée comme disponible");
      refetchListings();
    } catch (error) {
      console.error("Erreur lors du marquage:", error);
      toast.error("Erreur lors du marquage de l'annonce");
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!user) return;
    
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      await toggleFavorite.mutateAsync({
        listingId: id,
        userId: user.id
      });
      toast.success("Retiré des favoris");
      refetchFavorites();
    } catch (error) {
      console.error("Erreur lors du retrait des favoris:", error);
      toast.error("Erreur lors du retrait des favoris");
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Package className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune annonce</h3>
      <p className="mt-2 text-sm text-gray-500">
        Commencez par créer votre première annonce
      </p>
      <Button asChild className="mt-4">
        <Link to="/listings/create">
          Créer une annonce
        </Link>
      </Button>
    </div>
  );

  const LoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="w-20 h-20 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Vous devez être connecté</h1>
          <p className="mb-6">Connectez-vous pour accéder à votre tableau de bord</p>
          <Button asChild>
            <Link to="/auth/signin">Se connecter</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher dans vos annonces..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">Mes annonces</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Mes annonces</span>
                  <Button asChild size="sm">
                    <Link to="/listings/create">Créer une annonce</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <LoadingState />
                ) : !filteredListings || filteredListings.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {filteredListings.map((listing) => (
                      <div
                        key={listing.id || listing._id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <div className="relative w-20 h-20">
                          <img
                            src={listing.images && listing.images[0] ? listing.images[0] : "https://via.placeholder.com/400x300?text=Pas+d'image"}
                            alt={listing.title}
                            className="w-20 h-20 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                            }}
                          />
                          {listing.isSold && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full transform -rotate-12">
                                Vendu
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-1">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(listing.createdAt || "").toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm">
                              <Heart className={`h-4 w-4 ${(listing.favorites?.length || 0) > 0 ? 'text-red-500 fill-red-500' : ''}`} /> 
                              {listing.favorites?.length || 0}
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {listing.price} €
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listings/${listing.id || listing._id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listings/${listing.id || listing._id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsSold(listing.id || listing._id)}
                            disabled={processingIds[listing.id || listing._id]}
                            className={listing.isSold ? "text-green-500" : ""}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {processingIds[listing.id || listing._id] ? "..." : (listing.isSold ? "Disponible" : "Vendu")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setListingToDelete(listing.id || listing._id)}
                            disabled={processingIds[listing.id || listing._id]}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {processingIds[listing.id || listing._id] ? "..." : "Supprimer"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Annonces favorites</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <LoadingState />
                ) : !favorites || favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Aucune annonce favorite
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ajoutez des annonces à vos favoris pour les retrouver ici
                    </p>
                    <Button asChild className="mt-4">
                      <Link to="/">Explorer les annonces</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id || favorite._id}
                        className="flex flex-col border rounded-lg overflow-hidden"
                      >
                        <div className="relative h-48">
                          <img
                            src={favorite.images && favorite.images[0] ? favorite.images[0] : "https://via.placeholder.com/400x300?text=Pas+d'image"}
                            alt={favorite.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                            }}
                          />
                          {favorite.isSold && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <div className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold transform -rotate-12">
                                Vendu
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-medium text-lg line-clamp-1">{favorite.title}</h3>
                          <p className="text-primary font-bold mt-1">
                            {favorite.price} €
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(favorite.createdAt || "").toLocaleDateString()}
                          </p>
                          <div className="mt-auto pt-4 flex justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/listings/${favorite.id || favorite._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFavorite(favorite.id || favorite._id)}
                              disabled={processingIds[favorite.id || favorite._id]}
                              className="text-red-500"
                            >
                              <Heart className="h-4 w-4 mr-2 fill-current" />
                              {processingIds[favorite.id || favorite._id] ? "..." : "Retirer"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!listingToDelete} onOpenChange={() => setListingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'annonce sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => listingToDelete && handleDelete(listingToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
