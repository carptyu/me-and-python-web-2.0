import { createClient } from 'contentful';
import { Snake, Gender, Availability } from '../types';

// 使用環境變數建立連線 (Delivery API)
const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

let client: any = null;

if (spaceId && accessToken) {
  client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });
} else {
  console.warn('Contentful Delivery credentials are missing.');
}

// Helper: Map Contentful entry to App Snake type
const mapContentfulSnakeToAppSnake = (item: any): Snake => {
  const fields = item.fields;
  const sys = item.sys;

  // Get Image URL safely
  let imageUrl = 'https://picsum.photos/seed/nosnake/800/800'; // Fallback
  if (fields.image?.fields?.file?.url) {
    imageUrl = fields.image.fields.file.url;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `https:${imageUrl}`;
    }
  }

  // Ensure genetics is always an array
  let genetics: string[] = [];
  if (Array.isArray(fields.genetics)) {
    genetics = fields.genetics;
  } else if (typeof fields.genetics === 'string') {
    genetics = [fields.genetics];
  }

  // Ensure images is always an array
  let images: string[] = [imageUrl];
  if (Array.isArray(fields.images)) {
    images = fields.images.map((img: any) => {
      let url = img?.fields?.file?.url;
      if (url && !url.startsWith('http')) {
        return `https:${url}`;
      }
      return url;
    }).filter(Boolean);
  }

  // If no gallery images, use main image
  if (images.length === 0) {
    images = [imageUrl];
  }

  return {
    id: sys.id,
    morph: fields.morph || 'Unknown Morph',
    scientificName: 'Python regius',
    price: fields.price || 0,
    gender: fields.gender === 'Male' ? Gender.Male : Gender.Female,
    weight: fields.weight || 0,
    hatchDate: fields.hatchDate || new Date().toISOString().split('T')[0],
    genetics: genetics,
    diet: fields.diet || 'Unknown',
    availability: (fields.availability as Availability) || Availability.Available,
    description: fields.description || '',
    imageUrl: imageUrl,
    images: images
  };
};

export const fetchSnakesFromContentful = async (): Promise<Snake[]> => {
  if (!client) {
    console.warn("No Contentful client available.");
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: 'snake',
      order: '-sys.createdAt'
    });

    console.log("Fetched snakes from Contentful:", response.items);
    return response.items.map(mapContentfulSnakeToAppSnake);
  } catch (error) {
    console.error('Error fetching from Contentful:', error);
    return [];
  }
};