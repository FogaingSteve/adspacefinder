
export interface Listing {
  id?: string;
  _id?: string;
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user?: UserInfo;
}

export interface UserInfo {
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
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

export interface UpdateListingDTO extends Partial<CreateListingDTO> {
  isSold?: boolean;
}
