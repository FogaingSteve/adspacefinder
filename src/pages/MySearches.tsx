
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface SavedSearch {
  id: string;
  user_id: string;
  query: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  location?: string;
  notifications_enabled: boolean;
  created_at: string;
}

const MySearches = () => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSearch, setNewSearch] = useState({
    query: "",
    category: "",
    price_min: "",
    price_max: "",
    location: "",
    notifications_enabled: true
  });

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchSearches = async () => {
      setIsLoading(true);
      try {
        // Create the table if it doesn't exist
        await initSearchesTable();
        
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setSearches(data || []);
      } catch (error) {
        console.error('Error fetching saved searches:', error);
        toast.error("Erreur lors du chargement des recherches sauvegardées");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearches();
  }, [user?.id]);
  
  const initSearchesTable = async () => {
    try {
      // Check if the table exists
      const { error } = await supabase
        .from('saved_searches')
        .select('id')
        .limit(1);
        
      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS saved_searches (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
            query TEXT,
            category TEXT,
            price_min NUMERIC,
            price_max NUMERIC,
            location TEXT,
            notifications_enabled BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);
        `;
        
        await supabase.rpc('pgql', { query: createTableSQL });
      }
    } catch (error) {
      console.error('Error initializing saved searches table:', error);
    }
  };
  
  const handleAddSearch = async () => {
    if (!user?.id) return;
    
    if (!newSearch.query && !newSearch.category && !newSearch.location) {
      toast.error("Veuillez spécifier au moins un critère de recherche");
      return;
    }
    
    try {
      const searchData = {
        user_id: user.id,
        query: newSearch.query,
        category: newSearch.category || null,
        price_min: newSearch.price_min ? parseFloat(newSearch.price_min) : null,
        price_max: newSearch.price_max ? parseFloat(newSearch.price_max) : null,
        location: newSearch.location || null,
        notifications_enabled: newSearch.notifications_enabled
      };
      
      const { data, error } = await supabase
        .from('saved_searches')
        .insert(searchData)
        .select()
        .single();
        
      if (error) throw error;
      
      setSearches([data, ...searches]);
      
      // Reset form
      setNewSearch({
        query: "",
        category: "",
        price_min: "",
        price_max: "",
        location: "",
        notifications_enabled: true
      });
      
      toast.success("Recherche sauvegardée avec succès");
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error("Erreur lors de la sauvegarde de la recherche");
    }
  };
  
  const toggleNotifications = async (searchId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ notifications_enabled: enabled })
        .eq('id', searchId);
        
      if (error) throw error;
      
      setSearches(searches.map(search => 
        search.id === searchId ? { ...search, notifications_enabled: enabled } : search
      ));
      
      toast.success(`Notifications ${enabled ? 'activées' : 'désactivées'}`);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error("Erreur lors de la modification des notifications");
    }
  };
  
  const deleteSearch = async (searchId: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);
        
      if (error) throw error;
      
      setSearches(searches.filter(search => search.id !== searchId));
      toast.success("Recherche supprimée");
    } catch (error) {
      console.error('Error deleting search:', error);
      toast.error("Erreur lors de la suppression de la recherche");
    }
  };
  
  const executeSearch = (search: SavedSearch) => {
    const queryParams = new URLSearchParams();
    if (search.query) queryParams.set('q', search.query);
    if (search.category) queryParams.set('category', search.category);
    if (search.location) queryParams.set('location', search.location);
    if (search.price_min) queryParams.set('priceMin', search.price_min.toString());
    if (search.price_max) queryParams.set('priceMax', search.price_max.toString());
    
    window.location.href = `/?${queryParams.toString()}`;
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Vous devez être connecté pour voir vos recherches sauvegardées</h2>
              <Button asChild>
                <Link to="/auth/signin">Se connecter</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mes recherches sauvegardées</h1>
      
      <Tabs defaultValue="saved">
        <TabsList className="mb-6">
          <TabsTrigger value="saved">Recherches sauvegardées</TabsTrigger>
          <TabsTrigger value="new">Nouvelle recherche</TabsTrigger>
        </TabsList>
        
        <TabsContent value="saved">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center">Chargement des recherches...</div>
                </CardContent>
              </Card>
            ) : searches.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <div className="text-center">
                    <p className="mb-4">Vous n'avez pas encore de recherches sauvegardées</p>
                    <Button variant="outline" onClick={() => document.querySelector('[value="new"]')?.dispatchEvent(new Event('click'))}>
                      Créer une nouvelle recherche
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              searches.map((search) => (
                <Card key={search.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {search.query || search.category || "Recherche " + search.id.substring(0, 6)}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleNotifications(search.id, !search.notifications_enabled)}
                          title={search.notifications_enabled ? "Désactiver les notifications" : "Activer les notifications"}
                        >
                          {search.notifications_enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteSearch(search.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Supprimer cette recherche"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {search.query && (
                        <Badge variant="outline">Terme: {search.query}</Badge>
                      )}
                      {search.category && (
                        <Badge variant="outline">Catégorie: {search.category}</Badge>
                      )}
                      {search.location && (
                        <Badge variant="outline">Lieu: {search.location}</Badge>
                      )}
                      {(search.price_min || search.price_max) && (
                        <Badge variant="outline">
                          Prix: {search.price_min || "0"} - {search.price_max || "max"}
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => executeSearch(search)}
                    >
                      Lancer cette recherche
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle recherche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="query">Mots-clés</Label>
                  <Input 
                    id="query" 
                    placeholder="Ex: iPhone, voiture, table..." 
                    value={newSearch.query}
                    onChange={(e) => setNewSearch({...newSearch, query: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input 
                    id="category" 
                    placeholder="Ex: Électronique, Véhicules..." 
                    value={newSearch.category}
                    onChange={(e) => setNewSearch({...newSearch, category: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input 
                    id="location" 
                    placeholder="Ex: Paris, Lyon..." 
                    value={newSearch.location}
                    onChange={(e) => setNewSearch({...newSearch, location: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price_min">Prix minimum</Label>
                    <Input 
                      id="price_min" 
                      type="number" 
                      placeholder="0" 
                      value={newSearch.price_min}
                      onChange={(e) => setNewSearch({...newSearch, price_min: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="price_max">Prix maximum</Label>
                    <Input 
                      id="price_max" 
                      type="number" 
                      placeholder="999999" 
                      value={newSearch.price_max}
                      onChange={(e) => setNewSearch({...newSearch, price_max: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="notifications_enabled"
                    checked={newSearch.notifications_enabled}
                    onChange={(e) => setNewSearch({...newSearch, notifications_enabled: e.target.checked})}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="notifications_enabled" className="cursor-pointer">
                    Activer les notifications pour cette recherche
                  </Label>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button onClick={handleAddSearch}>
                    Sauvegarder cette recherche
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MySearches;
