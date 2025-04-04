
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Listing, CreateListingDTO } from "@/types/listing";
import { categoryService } from "@/services/api";
import { useUpdateListing } from "@/hooks/useListings";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

export interface EditListingFormProps {
  listing: Listing;
  onSuccess: () => void;
  onCancel?: () => void;
}

const EditListingForm = ({ listing, onSuccess, onCancel }: EditListingFormProps) => {
  const [title, setTitle] = useState(listing.title || "");
  const [description, setDescription] = useState(listing.description || "");
  const [price, setPrice] = useState(listing.price || 0);
  const [location, setLocation] = useState(listing.location || "");
  const [category, setCategory] = useState(listing.category || "");
  const [subcategory, setSubcategory] = useState(listing.subcategory || "");
  const [images, setImages] = useState<string[]>(listing.images || []);

  const updateListing = useUpdateListing();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // Get subcategories based on selected category
  const subcategories = categories?.find(c => c.id === category)?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !location || !category || !subcategory) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    try {
      // Make sure all required fields are present
      const updateData: CreateListingDTO = {
        title: title,
        description: description,
        price: Number(price),
        category: category,
        subcategory: subcategory,
        location: location,
        images: images
      };

      console.log("Updating listing with data:", updateData);
      await updateListing.mutateAsync({
        id: listing._id || listing.id || "",
        data: updateData
      });

      toast.success("Annonce mise à jour avec succès");
      onSuccess();
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  // Use this effect to reset form if listing changes
  useEffect(() => {
    setTitle(listing.title || "");
    setDescription(listing.description || "");
    setPrice(listing.price || 0);
    setLocation(listing.location || "");
    setCategory(listing.category || "");
    setSubcategory(listing.subcategory || "");
    setImages(listing.images || []);
  }, [listing]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-32"
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Prix (€)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select 
            value={category} 
            onValueChange={setCategory}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subcategory">Sous-catégorie</Label>
          <Select 
            value={subcategory} 
            onValueChange={setSubcategory}
            disabled={!category || subcategories.length === 0}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionner une sous-catégorie" />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Images</Label>
          <div className="mt-2">
            {images && images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUpload images={images} setImages={setImages} />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={updateListing.isPending}>
          {updateListing.isPending ? "Mise à jour..." : "Mettre à jour l'annonce"}
        </Button>
      </div>
    </form>
  );
};

export default EditListingForm;
