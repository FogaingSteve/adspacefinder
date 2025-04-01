
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
  favorites?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  user?: UserInfo;
}

export interface UserInfo {
  full_name: string;
  email: string;
  phone?: string;
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
