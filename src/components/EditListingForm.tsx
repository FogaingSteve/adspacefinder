import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateListingDTO, Listing } from "@/types/listing";
import { listingService } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useCategories } from "@/data/topCategories";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Le titre doit comporter au moins 3 caractères.",
  }),
  description: z.string().min(10, {
    message: "La description doit comporter au moins 10 caractères.",
  }),
  price: z.coerce.number().gt(0, {
    message: "Le prix doit être supérieur à 0.",
  }),
  location: z.string().min(3, {
    message: "Le lieu doit comporter au moins 3 caractères.",
  }),
  category: z.string().min(1, {
    message: "Veuillez sélectionner une catégorie.",
  }),
  subcategory: z.string().min(1, {
    message: "Veuillez sélectionner une sous-catégorie.",
  }),
});

interface EditListingFormProps {
  listing: Listing;
  onSuccess: () => void;
}

export function EditListingForm({ listing, onSuccess }: EditListingFormProps) {
  const [images, setImages] = useState<string[]>(listing.images || []);
  const navigate = useNavigate();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      category: listing.category,
      subcategory: listing.subcategory,
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updatedListing: CreateListingDTO = {
        ...values,
        images: images,
      };

      await listingService.updateListing(listing._id || listing.id || '', updatedListing);
      toast.success("Annonce mise à jour avec succès!");
      onSuccess();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'annonce.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titre</FormLabel>
            <FormControl>
              <Input placeholder="Nommez votre annonce" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input placeholder="Décrivez votre annonce" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prix</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Définir le prix" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lieu</FormLabel>
            <FormControl>
              <Input placeholder="Entrez le lieu" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : (
                  categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat.id}>{cat.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subcategory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sous-catégorie</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une sous-catégorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Chargement...</SelectItem>
                ) : (
                  categories
                    ?.find(cat => cat.id === form.getValues().category)
                    ?.subcategories.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>{subcat.name}</SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <ImageUpload 
          value={images} 
          onChange={setImages} 
          onRemove={(index) => {
            const newImages = [...images];
            newImages.splice(index, 1);
            setImages(newImages);
          }}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Mise à jour..." : "Mettre à jour l'annonce"}
      </Button>
    </form>
  );
}
