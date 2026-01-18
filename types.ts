export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum Availability {
  Available = 'Available',
  OnHold = 'On Hold',
  Sold = 'Sold',
  PreOrder = 'PreOrder'
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
  imageUrl: string; // Main thumbnail (compressed)
  images?: string[]; // Gallery images (compressed)
  originalImageUrl?: string; // Original full-resolution main image
  originalImages?: string[]; // Original full-resolution gallery images
  createdAt?: string; // ISO date string for sorting by listing time
}

export interface Article {
  id: string;
  slug: string; // URL-friendly identifier for routing
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

export interface Vendor {
  id: string; // Contentful entry ID for routing
  name: string;
  url: string;
  appendixFiles?: string[]; // URLs to appendix files/images
  appendixLabel?: string; // Optional description for appendix
}