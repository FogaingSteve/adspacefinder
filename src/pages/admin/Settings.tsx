import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres administrateur</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Paramètres de l'application</p>
        </CardContent>
      </Card>
    </div>
  );
};