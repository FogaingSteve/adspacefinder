import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifs">Notifications par email</Label>
            <Switch id="email-notifs" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifs">Notifications push</Label>
            <Switch id="push-notifs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-visible">Profil visible</Label>
            <Switch id="profile-visible" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-phone">Afficher mon numéro de téléphone</Label>
            <Switch id="show-phone" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}