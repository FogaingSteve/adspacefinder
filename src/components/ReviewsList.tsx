
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
}

interface ReviewsListProps {
  listingId: string;
  refreshTrigger?: number;
}

export function ReviewsList({ listingId, refreshTrigger = 0 }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/api/reviews/listing/${listingId}`);
        setReviews(response.data);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des avis');
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [listingId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-gray-500 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis!</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src={review.user?.avatar_url} alt={review.user?.name || 'Utilisateur'} />
              <AvatarFallback>{getInitials(review.user?.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">{review.user?.name || 'Utilisateur anonyme'}</h4>
                  <div className="flex items-center space-x-1 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatRelativeTime(review.createdAt)}
                </div>
              </div>
              
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
