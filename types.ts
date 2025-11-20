export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum Availability {
  Available = 'Available',
  OnHold = 'On Hold',
  Sold = 'Sold'
}

export interface Snake {
  id: string;
  morph: string;
  scientificName: string; // Usually Python regius
  price: number;
  gender: Gender;
  weight: number; // in grams
  hatchDate: string;
  genetics: string[];
  diet: string; // e.g., "Frozen/Thawed Rat Pup"
  availability: Availability;
  description: string;
  imageUrl: string; // Main thumbnail
  images?: string[]; // Gallery images
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
  category: string;
  readTime: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}