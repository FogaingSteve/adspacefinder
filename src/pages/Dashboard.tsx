import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, History, BarChart } from "lucide-react";

export default function Dashboard() {
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
      icon: BarChart,
    },
  ];

  const recentListings = [
    {
      id: 1,
      title: "iPhone 13 Pro",
      date: "2024-02-20",
      views: 45,
      status: "active",
    },
    {
      id: 2,
      title: "MacBook Pro 2021",
      date: "2024-02-18",
      views: 123,
      status: "expired",
    },
  ];

  const recentSearches = [
    "Appartement Paris",
    "Voiture occasion",
    "iPhone 13",
  ];

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

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">Mes annonces</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Annonces récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{listing.views} vues</span>
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
                <p className="text-muted-foreground">
                  Aucun message récent à afficher.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recherches récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <History className="h-4 w-4 text-muted-foreground" />
                      {search}
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