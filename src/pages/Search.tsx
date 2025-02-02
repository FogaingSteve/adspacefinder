import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Search = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recherche</h1>
      <Card>
        <CardHeader>
          <CardTitle>Résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Résultats de recherche</p>
        </CardContent>
      </Card>
    </div>
  );
};