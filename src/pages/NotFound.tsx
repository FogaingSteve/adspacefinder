import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Page non trouvée</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">La page que vous recherchez n'existe pas.</p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};