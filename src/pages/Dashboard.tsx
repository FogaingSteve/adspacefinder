import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, Eye, Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserListings } from "@/hooks/useListings";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { data: userListings, isLoading } = useUserListings(user?.id || "");

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
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Annonces récentes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          listing.isSold
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {listing.isSold ? "Vendu" : "Active"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border rounded-lg ${
                        message.unread ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{message.sender}</h3>
                        <span className="text-sm text-gray-500">{message.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{message.message}</p>
                      {message.unread && (
                        <span className="inline-block px-2 py-1 mt-2 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Annonces favorites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={favorite.image}
                        alt={favorite.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{favorite.title}</h3>
                        <p className="text-primary font-bold mt-1">
                          {favorite.price}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {favorite.date}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
