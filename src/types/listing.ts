export interface Listing {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  location: string;
  images: string[];
  userId: string;
  isSold?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateListingDTO {
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  location: string;
  images: string[];
}
