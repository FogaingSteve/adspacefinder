import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ResetPassword = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Réinitialisation du mot de passe</h1>
      <Card>
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Formulaire de réinitialisation</p>
        </CardContent>
      </Card>
    </div>
  );
};