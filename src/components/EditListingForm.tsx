import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CreateListingDTO, UpdateListingDTO } from "@/types/listing";
import { useCreateListing, useUpdateListing } from "@/hooks/useListings";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

interface EditListingFormProps {
  listingId?: string;
  defaultValues?: CreateListingDTO;
  onSubmit: (data: CreateListingDTO) => void;
  isLoading: boolean;
  categories: any[];
  onImageUpload: (images: File[]) => Promise<string[]>;
}

export const EditListingForm: React.FC<EditListingFormProps> = ({
  listingId,
  defaultValues,
  onSubmit,
  isLoading,
  categories,
  onImageUpload
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateListingDTO>({
    defaultValues: defaultValues || {
      title: "",
      description: "",
      price: 0,
      category: "",
      subcategory: "",
      location: "",
      images: [],
    },
  });

  useEffect(() => {
    if (defaultValues) {
      setValue("title", defaultValues.title);
      setValue("description", defaultValues.description);
      setValue("price", defaultValues.price);
      setValue("category", defaultValues.category);
      setValue("subcategory", defaultValues.subcategory);
      setValue("location", defaultValues.location);
      setValue("images", defaultValues.images);
    }
  }, [defaultValues, setValue]);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const getSubcategoryOptions = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.subcategories.map((subcategory: any) => ({
      value: subcategory.id,
      label: subcategory.name,
    })) || [];
  };

  const [selectedCategory, setSelectedCategory] = useState(defaultValues?.category || "");
  const subcategoryOptions = getSubcategoryOptions(selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue("subcategory", "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre de l'annonce</Label>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Vends iPhone 13 Pro Max"
          {...register("title", { required: "Le titre est obligatoire" })}
          className="mt-1"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Ex: En parfait état, comme neuf, batterie à 100%"
          {...register("description", { required: "La description est obligatoire" })}
          className="mt-1"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="price">Prix</Label>
        <Input
          id="price"
          type="number"
          placeholder="Ex: 50000"
          {...register("price", {
            required: "Le prix est obligatoire",
            valueAsNumber: true,
          })}
          className="mt-1"
        />
        {errors.price && (
          <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Select onValueChange={(value) => {
          handleCategoryChange(value);
          setValue("category", value);
        }}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="subcategory">Sous-catégorie</Label>
        <Select
          onValueChange={(value) => setValue("subcategory", value)}
          disabled={!selectedCategory}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Sélectionner une sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            {subcategoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subcategory && (
          <p className="text-red-500 text-sm mt-1">{errors.subcategory.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="location">Ville</Label>
        <Input
          id="location"
          type="text"
          placeholder="Ex: Yaoundé, Douala"
          {...register("location", { required: "La ville est obligatoire" })}
          className="mt-1"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="images">Images</Label>
        <ImageUpload onImageUpload={onImageUpload} setValue={setValue} register={register} errors={errors} />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer"
        )}
      </Button>
    </form>
  );
};
