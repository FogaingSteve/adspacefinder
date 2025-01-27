import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, History, BarChart, Heart, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    {
      title: "Annonces actives",
      value: "12",
      icon: Package,
    },
    {
      title: "Messages non lus",
      value: "4",
      icon: MessageSquare,
    },
    {
      title: "Vues totales",
      value: "1,234",
      icon: Eye,
    },
  ];

  const recentListings = [
    {
      id: 1,
      title: "iPhone 13 Pro",
      date: "2024-02-20",
      views: 45,
      favorites: 12,
      status: "active",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
    },
    {
      id: 2,
      title: "MacBook Pro 2021",
      date: "2024-02-18",
      views: 123,
      favorites: 8,
      status: "expired",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Jean Dupont",
      message: "Bonjour, est-ce que l'iPhone est toujours disponible ?",
      date: "2024-02-20",
      unread: true,
    },
    {
      id: 2,
      sender: "Marie Martin",
      message: "Je suis intéressé par le MacBook",
      date: "2024-02-19",
      unread: false,
    },
  ];

  const favorites = [
    {
      id: 1,
      title: "Appartement Paris",
      price: "250,000 €",
      date: "2024-02-20",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
    },
    {
      id: 2,
      title: "Voiture occasion",
      price: "15,000 €",
      date: "2024-02-19",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80",
    },
  ];

  const filteredListings = recentListings.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase())
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

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Annonces récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.date}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-sm">
                            <Eye className="h-4 w-4" /> {listing.views}
                          </span>
                          <span className="flex items-center gap-1 text-sm">
                            <Heart className="h-4 w-4" /> {listing.favorites}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          listing.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {listing.status === "active" ? "Active" : "Expirée"}
                      </span>
                    </div>
                  ))}
                </div>
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