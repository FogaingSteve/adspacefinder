import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ListingDetails = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Détails de l'annonce</h1>
      <Card>
        <CardHeader>
          <CardTitle>Annonce</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Détails de l'annonce</p>
        </CardContent>
      </Card>
    </div>
  );
};