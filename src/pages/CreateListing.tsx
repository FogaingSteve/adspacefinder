import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";
import { useCreateListing } from "@/hooks/useListings";
import { categoryService } from "@/services/api";
import { toast } from "sonner";
import { useCategories } from "@/data/topCategories";

const formSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  subcategory: z.string().min(1, "Veuillez sélectionner une sous-catégorie"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide"),
  location: z.string().min(3, "La localisation doit contenir au moins 3 caractères"),
  images: z.array(z.string()).min(1, "Veuillez ajouter au moins une image"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateListing = () => {
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const createListingMutation = useCreateListing();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      price: "",
      location: "",
      images: [],
    },
  });

  const selectedCategory = form.watch("category");

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const category = await categoryService.getCategory(selectedCategory);
          console.log("Subcategories fetched:", category.subcategories);
          setSubcategories(category.subcategories || []);
          
          // Reset subcategory when category changes
          form.setValue("subcategory", "");
        } catch (error) {
          console.error("Failed to fetch subcategories:", error);
          toast.error("Erreur lors du chargement des sous-catégories");
          setSubcategories([]);
        }
      };
      
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, form]);

  const onSubmit = (data: FormValues) => {
    createListingMutation.mutate({
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      price: parseFloat(data.price),
      location: data.location,
      images: data.images
    }, {
      onSuccess: () => {
        // Redirection vers la page d'accueil après création
        navigate("/");
      }
    });
  };

  const formData = form.watch();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isPreview ? "Prévisualisation de l'annonce" : "Créer une nouvelle annonce"}
      </h1>

      {isPreview ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">{formData.title}</h2>
              <p className="text-xl font-bold text-primary">{formData.price} €</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Image+non+disponible";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Catégorie</h3>
                  <p className="text-gray-600">{formData.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sous-catégorie</h3>
                  <p className="text-gray-600">{formData.subcategory}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Localisation</h3>
                  <p className="text-gray-600">{formData.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsPreview(false)}>
              Retour à l'édition
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={createListingMutation.isPending}>
              {createListingMutation.isPending ? "Publication en cours..." : "Publier l'annonce"}
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(urls) => field.onChange(urls)}
                      onRemove={(url) => {
                        const newUrls = field.value.filter((val) => val !== url);
                        field.onChange(newUrls);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'annonce</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: iPhone 13 Pro Max 256Go" {...field} />
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
                    <Textarea
                      placeholder="Décrivez votre article en détail..."
                      className="min-h-[150px]"
                      {...field}
                    />
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
                      ) : categories && categories.length > 0 ? (
                        categories.map((category: any) => (
                          <SelectItem key={category.slug || category._id} value={category.slug || category._id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>Aucune catégorie disponible</SelectItem>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCategory || subcategories.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedCategory ? "Sélectionnez d'abord une catégorie" : "Sélectionnez une sous-catégorie"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!selectedCategory ? (
                        <SelectItem value="no-category" disabled>Sélectionnez d'abord une catégorie</SelectItem>
                      ) : subcategories.length > 0 ? (
                        subcategories.map((subcategory: any) => (
                          <SelectItem key={subcategory.slug || subcategory._id} value={subcategory.slug || subcategory._id}>
                            {subcategory.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>Chargement des sous-catégories...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
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
                  <FormLabel>Localisation</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Paris 75001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Annuler
              </Button>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPreview(true)}
                >
                  Prévisualiser
                </Button>
                <Button type="submit" disabled={createListingMutation.isPending}>
                  {createListingMutation.isPending ? "Publication en cours..." : "Publier l'annonce"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CreateListing;
