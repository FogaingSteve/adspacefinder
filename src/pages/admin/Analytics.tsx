import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analyses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analyses et métriques</p>
        </CardContent>
      </Card>
    </div>
  );
};