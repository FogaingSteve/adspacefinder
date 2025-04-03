
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateListing } from "@/hooks/useListings";
import { useCategories } from "@/data/topCategories";
import { ImageUpload } from "@/components/ImageUpload";
import { Listing } from "@/types/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface EditListingFormProps {
  listing: Listing;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditListingForm = ({ listing, onCancel, onSuccess }: EditListingFormProps) => {
  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price.toString());
  const [category, setCategory] = useState(listing.category);
  const [subcategory, setSubcategory] = useState(listing.subcategory);
  const [location, setLocation] = useState(listing.location);
  const [images, setImages] = useState<string[]>(listing.images);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const updateListing = useUpdateListing();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const selectedCategoryObj = categories?.find((cat: any) => cat.id === category);
  const subcategories = selectedCategoryObj?.subcategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !price || !category || !subcategory || !location || images.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast({
        title: "Prix invalide",
        description: "Veuillez entrer un prix valide",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateListing.mutateAsync({
        id: listing.id || listing._id || "",
        data: {
          title,
          description,
          price: numericPrice,
          category,
          subcategory,
          location,
          images,
        }
      });

      toast({
        title: "Annonce mise à jour",
        description: "Votre annonce a été mise à jour avec succès",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'annonce",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'annonce *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de votre annonce"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit (état, caractéristiques, etc.)"
              required
              rows={5}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Prix (€) *
            </label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Prix en euros"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                  ) : (
                    categories?.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
                Sous-catégorie *
              </label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Choisir une sous-catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcat: any) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Localisation *
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville / Quartier"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photos *
            </label>
            <ImageUpload images={images} setImages={setImages} />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour l'annonce"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
