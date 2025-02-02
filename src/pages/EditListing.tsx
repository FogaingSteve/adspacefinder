import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const EditListing = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Modifier l'annonce</h1>
      <Card>
        <CardHeader>
          <CardTitle>Modification</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Formulaire de modification</p>
        </CardContent>
      </Card>
    </div>
  );
};