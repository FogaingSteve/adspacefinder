import { useState } from "react";
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
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

const formSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Prix invalide"),
  location: z.string().min(3, "La localisation doit contenir au moins 3 caractères"),
  images: z.array(z.string()).min(1, "Veuillez ajouter au moins une image"),
});

type FormValues = z.infer<typeof formSchema>;

const CreateListing = () => {
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: "",
      location: "",
      images: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Données du formulaire:", data);
    toast.success("Annonce publiée avec succès!");
    navigate("/");
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
                      <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
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
            <Button onClick={form.handleSubmit(onSubmit)}>Publier l'annonce</Button>
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
                      <SelectItem value="immobilier">Immobilier</SelectItem>
                      <SelectItem value="vehicules">Véhicules</SelectItem>
                      <SelectItem value="emploi">Emploi</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
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
                <Button type="submit">Publier</Button>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default CreateListing;
