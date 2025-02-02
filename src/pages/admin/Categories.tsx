import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Categories = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des catégories</h1>
      <Card>
        <CardHeader>
          <CardTitle>Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Liste des catégories</p>
        </CardContent>
      </Card>
    </div>
  );
};