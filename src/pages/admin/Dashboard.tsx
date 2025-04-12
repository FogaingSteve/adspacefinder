
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      setIsLoading(true);
      
      try {
        // Vérifier le token admin dans le localStorage
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken) {
          try {
            // Vérifier si le token admin est valide
            const response = await axios.get('http://localhost:5000/api/admin/verify', {
              headers: {
                Authorization: `Bearer ${adminToken}`
              }
            });
            
            if (response.data.valid) {
              console.log("Admin token valide");
              setIsAdmin(true);
              setIsLoading(false);
              return;
            }
          } catch (tokenError) {
            console.error("Erreur de vérification token admin:", tokenError);
            localStorage.removeItem('adminToken');
          }
        }
        
        // Si pas de token admin valide, vérifier si l'utilisateur est admin via ses métadonnées
        if (user?.user_metadata?.is_admin) {
          console.log("Utilisateur est admin selon les métadonnées");
          setIsAdmin(true);
        } else {
          console.log("Utilisateur n'est pas admin:", user);
          navigate("/admin");
          toast.error("Accès non autorisé");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/admin");
        toast.error("Erreur lors de la vérification des droits admin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Button disabled className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement...
        </Button>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
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
};

export default AdminDashboard;
