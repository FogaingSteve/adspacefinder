
import { useParams } from "react-router-dom";
import { CategoryListings } from "@/components/CategoryListings";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryIcons } from "@/data/topCategories";
import { Link } from "react-router-dom";
import { categoryService, listingService } from "@/services/api";

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  // Fetch category info from MongoDB
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      return await categoryService.getCategory(categoryId);
    },
    enabled: !!categoryId
  });

  // Fetch listings count for each subcategory
  const { data: categoryListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['category-listings', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      return await listingService.getListingsByCategory(categoryId);
    },
    enabled: !!categoryId
  });

  // Calculate subcategory counts
  const getSubcategoryCount = (subcategoryId: string) => {
    if (!categoryListings) return 0;
    return categoryListings.filter(listing => listing.subcategory === subcategoryId).length;
  };

  const isLoading = categoryLoading || listingsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-1/4 mb-8" />
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Catégorie non trouvée</p>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[categoryId as keyof typeof categoryIcons] || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        {CategoryIcon && <CategoryIcon className="h-6 w-6" />}
        <h1 className="text-3xl font-bold">{category.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {category.subcategories.map((subcategory: any) => {
          const count = getSubcategoryCount(subcategory.id);
          
          return (
            <div key={subcategory.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">
                  {subcategory.name} 
                  <span className="text-sm text-gray-500 ml-2">({count} annonces)</span>
                </h2>
                <Link 
                  to={`/categories/${categoryId}/${subcategory.id}`}
                  className="text-primary hover:underline"
                >
                  Voir plus
                </Link>
              </div>
              
              {/* We'll pass the subcategory ID here to fetch specific listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CategoryListings 
                  categoryId={categoryId} 
                  subcategoryId={subcategory.id}
                  limit={4} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPage;
