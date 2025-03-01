
import { useParams } from "react-router-dom";
import { SubcategoryListings } from "@/components/SubcategoryListings";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcons } from "@/data/topCategories";

const SubcategoryPage = () => {
  const { categoryId, subcategoryId } = useParams<{ categoryId: string; subcategoryId: string }>();

  // Fetch subcategory info from MongoDB
  const { data, isLoading } = useQuery({
    queryKey: ['subcategory', categoryId, subcategoryId],
    queryFn: async () => {
      if (!categoryId || !subcategoryId) return null;
      return await categoryService.getSubcategory(categoryId, subcategoryId);
    },
    enabled: !!categoryId && !!subcategoryId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Sous-catégorie non trouvée</p>
      </div>
    );
  }

  const { category, subcategory } = data;
  const CategoryIcon = categoryIcons[categoryId as keyof typeof categoryIcons] || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          {CategoryIcon && <CategoryIcon className="h-5 w-5" />}
          <span className="text-gray-600">{category.name}</span>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold">{subcategory.name}</h1>
        </div>
      </div>

      <SubcategoryListings categoryId={categoryId} subcategoryId={subcategoryId} />
    </div>
  );
};

export default SubcategoryPage;
