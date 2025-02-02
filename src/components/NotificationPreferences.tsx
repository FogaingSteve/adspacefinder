import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const handleToggleEmail = async (checked: boolean) => {
    setEmailEnabled(checked);
    if (checked) {
      toast.success("Notifications par email activées");
    } else {
      toast.success("Notifications par email désactivées");
    }
  };

  const handleTogglePush = async (checked: boolean) => {
    setPushEnabled(checked);
    if (checked) {
      toast.success("Notifications push activées");
    } else {
      toast.success("Notifications push désactivées");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Préférences de notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notifications par email</Label>
            <p className="text-sm text-gray-500">
              Recevoir des notifications par email pour les nouvelles annonces et messages
            </p>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={handleToggleEmail}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Notifications push</Label>
            <p className="text-sm text-gray-500">
              Recevoir des notifications push pour les interactions en temps réel
            </p>
          </div>
          <Switch
            checked={pushEnabled}
            onCheckedChange={handleTogglePush}
          />
        </div>
      </CardContent>
    </Card>
  );
};