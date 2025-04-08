
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

const reviewSchema = z.object({
  rating: z.number().min(1, "Veuillez attribuer une note").max(5),
  comment: z.string().min(10, "Votre commentaire doit contenir au moins 10 caractères"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  listingId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ listingId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = form.watch('rating');

  const onSubmit = async (data: ReviewFormValues) => {
    if (!user) {
      toast.error("Vous devez être connecté pour laisser un avis");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/reviews`,
        {
          listingId,
          rating: data.rating,
          comment: data.comment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success("Votre avis a été publié avec succès");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Erreur lors de la publication de l'avis:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la publication de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">Vous devez être connecté pour laisser un avis</p>
        <Button variant="link" onClick={() => window.location.href = '/auth/signin'}>
          Se connecter
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Laisser un avis</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          (hoverRating || field.value) >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Votre commentaire</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Partagez votre expérience avec ce produit..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Publication...' : 'Publier mon avis'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
