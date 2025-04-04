
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CreateListingDTO, UpdateListingDTO } from "@/types/listing";
import { useUserListings, useDeleteListing, useMarkListingAsSold } from "@/hooks/useListings";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import axios from "axios";

export interface EditListingFormProps {
  listingId?: string;
  initialData?: CreateListingDTO;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditListingForm: React.FC<EditListingFormProps> = ({
  listingId,
  initialData,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateListingDTO>({
    defaultValues: initialData || {
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
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("description", initialData.description);
      setValue("price", initialData.price);
      setValue("category", initialData.category);
      setValue("subcategory", initialData.subcategory);
      setValue("location", initialData.location);
      setValue("images", initialData.images);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data: CreateListingDTO) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (listingId) {
        // Update existing listing
        await axios.put(`http://localhost:5000/api/listings/${listingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Annonce mise à jour avec succès');
      } else {
        // Create new listing
        await axios.post('http://localhost:5000/api/listings', data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Annonce créée avec succès');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error(listingId ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const getSubcategoryOptions = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.subcategories?.map((subcategory: any) => ({
      value: subcategory.id,
      label: subcategory.name,
    })) || [];
  };

  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");
  const subcategoryOptions = getSubcategoryOptions(selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setValue("subcategory", "");
  };

  const handleImageUpload = async (images: File[]): Promise<string[]> => {
    if (!images.length) return [];
    
    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/listings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors du téléchargement des images');
      return [];
    }
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
        <ImageUpload 
          onImageUpload={handleImageUpload} 
          setValue={setValue} 
          register={register} 
          errors={errors} 
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
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
      </div>
    </form>
  );
};
