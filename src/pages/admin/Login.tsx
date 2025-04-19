
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Verify if token is valid
      axios.get('http://localhost:5000/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }).then(() => {
        navigate('/admin/dashboard');
      }).catch((error) => {
        console.error("Admin token verification failed:", error);
        // Token invalid, clear it
        localStorage.removeItem('adminToken');
      });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Admin login attempt:", { email });
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });
      
      // Store the token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      toast.success("Connexion réussie");
      
      console.log("Admin login successful, redirecting to dashboard...");
      
      // Navigate to dashboard
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Administration</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au panneau d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@exemple.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-center w-full text-gray-500">
            Accès réservé aux administrateurs
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
