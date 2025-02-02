import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { ListingModeration } from "@/components/admin/ListingModeration";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { Statistics } from "@/components/admin/Statistics";
import { NotificationSettings } from "@/components/admin/NotificationSettings";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        navigate("/");
        return;
      }
      
      // Check if user has admin role in metadata
      const userMetadata = user.user_metadata || {};
      const isUserAdmin = userMetadata.role === 'admin';
      
      if (!isUserAdmin) {
        navigate("/");
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="listings">Annonces</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Modération des annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <ListingModeration />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <Statistics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}