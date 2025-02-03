import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService } from "@/services/admin";

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  emailTemplate: string;
}

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: false,
    pushEnabled: false,
    emailTemplate: "",
  });

  const { isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: adminService.getNotificationSettings,
    onSuccess: (data) => setSettings(data),
    onError: () => toast.error("Erreur lors du chargement des paramètres")
  });

  const handleSaveSettings = async () => {
    try {
      await adminService.updateNotificationSettings(settings);
      toast.success("Paramètres mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des paramètres");
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notifications par email</Label>
          <p className="text-sm text-gray-500">
            Activer les notifications par email pour les nouveaux messages et annonces
          </p>
        </div>
        <Switch
          checked={settings.emailEnabled}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, emailEnabled: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notifications push</Label>
          <p className="text-sm text-gray-500">
            Activer les notifications push pour les interactions en temps réel
          </p>
        </div>
        <Switch
          checked={settings.pushEnabled}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, pushEnabled: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Template d'email</Label>
        <Input
          value={settings.emailTemplate}
          onChange={(e) => 
            setSettings({ ...settings, emailTemplate: e.target.value })
          }
          placeholder="Template HTML pour les emails..."
          className="h-32"
          type="textarea"
        />
      </div>

      <Button onClick={handleSaveSettings}>
        Sauvegarder les paramètres
      </Button>
    </div>
  );
};