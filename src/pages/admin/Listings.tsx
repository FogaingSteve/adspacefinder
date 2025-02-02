import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Listings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des annonces</h1>
      <Card>
        <CardHeader>
          <CardTitle>Annonces</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Liste des annonces</p>
        </CardContent>
      </Card>
    </div>
  );
};