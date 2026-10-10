
export type UserRole = 'user' | 'admin';

export interface Address {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  image: string;
  phone: string;
  address: Address;
  active: boolean;
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  status: 'success';
  message?: string;
  token: string;
  data: User;
}

export interface ProfilePayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: Partial<Address>;
}
