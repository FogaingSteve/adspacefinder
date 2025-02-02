import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminService } from "@/services/admin";

interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminService.getCategories,
    meta: {
      onSuccess: (data) => setCategories(data),
      onError: () => toast.error("Erreur lors du chargement des catégories")
    }
  });

  const handleAddCategory = async () => {
    try {
      await adminService.addCategory({ name: newCategory });
      toast.success("Catégorie ajoutée avec succès");
      setNewCategory("");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategory) return;
    try {
      await adminService.addSubcategory(selectedCategory, newSubcategory);
      toast.success("Sous-catégorie ajoutée avec succès");
      setNewSubcategory("");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la sous-catégorie");
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Ajouter une catégorie</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="category">Nom de la catégorie</Label>
            <Input
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Ex: Électronique"
            />
          </div>
          <Button onClick={handleAddCategory} className="mt-6">
            Ajouter
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Ajouter une sous-catégorie</h3>
        <div className="space-y-4">
          <div>
            <Label>Sélectionner une catégorie</Label>
            <select
              className="w-full border rounded-md p-2"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory || ""}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="subcategory">Nom de la sous-catégorie</Label>
              <Input
                id="subcategory"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="Ex: Smartphones"
              />
            </div>
            <Button onClick={handleAddSubcategory} className="mt-6">
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Catégories existantes</h3>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border p-4 rounded-md">
              <h4 className="font-medium">{category.name}</h4>
              <div className="mt-2 space-x-2">
                {category.subcategories.map((sub, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};