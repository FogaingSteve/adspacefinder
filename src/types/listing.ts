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