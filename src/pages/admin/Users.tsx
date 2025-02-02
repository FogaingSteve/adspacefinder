import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Users = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Liste des utilisateurs</p>
        </CardContent>
      </Card>
    </div>
  );
};