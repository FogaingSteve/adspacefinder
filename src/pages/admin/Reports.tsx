import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Reports = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Rapports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Rapports d'activité</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Statistiques et rapports</p>
        </CardContent>
      </Card>
    </div>
  );
};