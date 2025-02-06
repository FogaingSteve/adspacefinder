
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, Eye, Heart, Search, Edit, Trash2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings, useDeleteListing, useMarkListingAsSold, useFavorites } from "@/hooks/useListings";
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

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: userListings, isLoading: listingsLoading } = useUserListings(user?.id || "");
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(user?.id || "");
  const deleteListing = useDeleteListing();
  const markAsSold = useMarkListingAsSold();

  const stats = [
    {
      title: "Annonces actives",
      value: userListings?.length || "0",
      icon: Package,
    },
    {
      title: "Messages non lus",
      value: "0",
      icon: MessageSquare,
    },
    {
      title: "Vues totales",
      value: "0",
      icon: Eye,
    },
  ];

  const filteredListings = userListings?.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    await deleteListing.mutateAsync(id);
    setListingToDelete(null);
  };

  const handleMarkAsSold = async (id: string) => {
    await markAsSold.mutateAsync(id);
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
                <CardTitle>Annonces récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <LoadingState />
                ) : filteredListings.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    {filteredListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(listing.createdAt || "").toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm">
                              <Eye className="h-4 w-4" /> 0
                            </span>
                            <span className="flex items-center gap-1 text-sm">
                              <Heart className="h-4 w-4" /> 0
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listings/${listing.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/listings/${listing.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsSold(listing.id)}
                            disabled={listing.isSold}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {listing.isSold ? "Vendu" : "Marquer vendu"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setListingToDelete(listing.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
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
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="flex gap-4 p-4 border rounded-lg"
                      >
                        <img
                          src={favorite.images[0]}
                          alt={favorite.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">{favorite.title}</h3>
                          <p className="text-primary font-bold mt-1">
                            {favorite.price} €
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(favorite.createdAt || "").toLocaleDateString()}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {}}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Retirer des favoris
                          </Button>
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
