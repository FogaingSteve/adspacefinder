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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService } from "@/services/admin";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminService.getCategories,
    onSuccess: (data) => setCategories(data),
    onError: () => toast.error("Erreur lors du chargement des catégories")
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await adminService.addCategory({ name: newCategoryName });
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      toast.success("Catégorie ajoutée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await adminService.deleteCategory(categoryId);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success("Catégorie supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nom de la nouvelle catégorie"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleAddCategory}>Ajouter</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};