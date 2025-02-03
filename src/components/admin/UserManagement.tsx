import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { adminService } from "@/services/admin";

interface User {
  id: string;
  email: string;
  created_at: string;
  isBanned: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  const { isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
    onSuccess: (data) => setUsers(data),
    onError: () => toast.error("Erreur lors du chargement des utilisateurs")
  });

  const handleBanUser = async (userId: string) => {
    try {
      await adminService.banUser(userId);
      toast.success("Utilisateur banni avec succès");
      // Refresh users list
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isBanned: true } : user
      ));
    } catch (error) {
      toast.error("Erreur lors du bannissement de l'utilisateur");
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Date d'inscription</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{user.isBanned ? "Banni" : "Actif"}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleBanUser(user.id)}
                  disabled={user.isBanned}
                >
                  Bannir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};