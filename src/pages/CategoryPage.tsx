import { useParams } from "react-router-dom";
import { CategoryListings } from "@/components/CategoryListings";
import { categories } from "@/data/categories";
import { Car, CarFront, Bus, Truck } from "lucide-react";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Catégorie non trouvée</p>
      </div>
    );
  }

  const getIcon = () => {
    switch (categoryId) {
      case "vehicules":
        return <Car className="h-6 w-6" />;
      case "motos":
        return <CarFront className="h-6 w-6" />;
      case "bus":
        return <Bus className="h-6 w-6" />;
      case "camions":
        return <Truck className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        {getIcon()}
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {category.subcategories.map((subcategory) => (
          <div key={subcategory.id} className="space-y-4">
            <h2 className="text-2xl font-semibold">{subcategory.name}</h2>
            <CategoryListings categoryId={category.id} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;