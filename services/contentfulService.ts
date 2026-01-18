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
  console.warn('Contentful credentials not found in environment variables');
}

// Image optimization helpers
const getOptimizedImageUrl = (url: string): string => {
  if (!url) return url;
  // Add Contentful Image API parameters for compression
  // w=1200: max width 1200px (better for retina/desktop)
  // q=80: quality 80% (better detail)
  // fm=webp: format WebP (smaller file size)
  return `${url}?w=1200&q=80&fm=webp`;
};

const getOriginalImageUrl = (url: string): string => {
  // Return original URL without any parameters
  return url;
};

// Map Contentful entry to Snake type
const mapContentfulSnakeToAppSnake = (entry: any): Snake => {
  const fields = entry.fields;

  // Debug: Print all field keys to find the correct ID field name
  // console.log('Available fields for snake:', Object.keys(fields));

  // Ensure images is an array of URLs
  const getImages = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((img: any) => {
        if (typeof img === 'string') return img;
        if (img?.fields?.file?.url) return `https:${img.fields.file.url}`;
        return '';
      }).filter(Boolean);
    }
    if (typeof val === 'string') return [val];
    if (val?.fields?.file?.url) return [`https:${val.fields.file.url}`];
    return [];
  };

  // Extract plain text from Contentful Rich Text
  const extractPlainText = (richText: any): string => {
    if (!richText) return '';
    if (typeof richText === 'string') return richText;

    // Check if it's a Rich Text object from Contentful
    if (richText.nodeType && richText.content) {
      const extractText = (node: any): string => {
        if (!node) return '';
        if (node.nodeType === 'text') return node.value || '';
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('');
        }
        return '';
      };
      return extractText(richText);
    }

    return String(richText);
  };

  // Get image URL - note: Contentful field is named 'photo', not 'image' or 'images'
  const getImageUrl = (): string => {
    // Try fields.photo array (actual field name in Contentful)
    if (fields.photo && Array.isArray(fields.photo) && fields.photo[0]?.fields?.file?.url) {
      return `https:${fields.photo[0].fields.file.url}`;
    }
    // Try fields.imageUrl as string
    if (fields.imageUrl && typeof fields.imageUrl === 'string') {
      return fields.imageUrl.startsWith('//') ? `https:${fields.imageUrl}` : fields.imageUrl;
    }
    // Try fields.image as single asset
    if (fields.image?.fields?.file?.url) {
      return `https:${fields.image.fields.file.url}`;
    }
    // Try fields.images array
    if (fields.images && Array.isArray(fields.images) && fields.images[0]?.fields?.file?.url) {
      return `https:${fields.images[0].fields.file.url}`;
    }
    // Use working placeholder
    console.warn(`No image found for ${fields.morph}, using placeholder`);
    return '/placeholder.jpg';
  };

  // Get images array - note: Contentful field is named 'photo', not 'images'
  const getImagesArray = (): string[] => {
    // Try photo field first (actual field name in Contentful)
    const photoImages = getImages(fields.photo);
    if (photoImages.length > 0) return photoImages;
    // Fallback to other possible field names
    const imgs = getImages(fields.images);
    return imgs.length > 0 ? imgs : getImages(fields.image);
  };

  // Map availability string to enum
  const mapAvailability = (val: any): Availability => {
    if (!val) return Availability.Available;
    const strVal = String(val).toLowerCase().trim();

    if (strVal === 'available') return Availability.Available;
    if (strVal === 'on hold' || strVal === 'onhold') return Availability.OnHold;
    if (strVal === 'sold') return Availability.Sold;
    if (strVal === 'preorder' || strVal === 'pre-order') return Availability.PreOrder;

    return Availability.Available;
  };

  // Map gender string to enum
  const mapGender = (val: any): Gender => {
    if (!val) return Gender.Male; // Default
    const strVal = String(val).trim().toLowerCase();
    if (strVal === 'female' || strVal === '母' || strVal === '女生') return Gender.Female;
    return Gender.Male;
  };

  // Get original image URLs (without compression parameters)
  const originalMainImage = getImageUrl();
  const originalGalleryImages = getImagesArray();

  // Ensure images array has at least the main image if empty
  const finalImages = originalGalleryImages.length > 0 ? originalGalleryImages : (originalMainImage ? [originalMainImage] : []);

  // Try to find the ID field with case-insensitive search
  // Contentful API usually returns fields as they are defined in the content model
  let customId = fields.ID || fields.id || fields.Id || fields.iD;

  // If not found directly, search through all keys case-insensitively
  if (!customId) {
    const idKey = Object.keys(fields).find(key => key.toLowerCase() === 'id');
    if (idKey) {
      customId = fields[idKey];
    }
  }

  return {
    id: customId ? String(customId) : 'No ID', // Use custom ID if found, else return 'No ID' (no system ID fallback)
    morph: fields.morph || 'Unknown',
    scientificName: 'Python regius', // Default value
    genetics: [], // Empty array as requested
    price: Number(fields.price) || 0,
    imageUrl: getOptimizedImageUrl(originalMainImage),
    description: extractPlainText(fields.description) || '',
    hatchDate: fields.hatchDate || 'Unknown',
    weight: Number(fields.weight) || 0,
    gender: mapGender(fields.gender),
    diet: '未知', // Default value
    availability: mapAvailability(fields.availability),
    images: finalImages.map(getOptimizedImageUrl),
    originalImageUrl: getOriginalImageUrl(originalMainImage),
    originalImages: finalImages.map(getOriginalImageUrl),
    createdAt: entry.sys.createdAt,
  };
};

export const fetchSnakesFromContentful = async (): Promise<Snake[]> => {
  if (!client) {
    console.warn('Contentful client not initialized');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: 'snake',
      order: '-sys.createdAt'
    });

    console.log("Fetched snakes from Contentful:", response.items);

    // Debug: Log the first item's fields to see the structure
    if (response.items.length > 0) {
      console.log("First snake raw data:", JSON.stringify(response.items[0].fields, null, 2));
    }

    return response.items.map(mapContentfulSnakeToAppSnake);
  } catch (error) {
    console.error('Error fetching from Contentful:', error);
    return [];
  }
};

// Vendor type for import service
import { Vendor } from '../types';

// Map Contentful vendor entry to Vendor type
const mapContentfulVendorToAppVendor = (entry: any): Vendor => {
  const fields = entry.fields;

  // Get appendix files URLs
  const getAppendixFiles = (): string[] => {
    if (!fields.appendixFiles) return [];
    if (Array.isArray(fields.appendixFiles)) {
      return fields.appendixFiles.map((file: any) => {
        if (file?.fields?.file?.url) {
          return `https:${file.fields.file.url}`;
        }
        return '';
      }).filter(Boolean);
    }
    return [];
  };

  // Extract plain text from Rich Text or Long Text
  const getAppendixLabel = (): string => {
    if (!fields.appendixLabel) return '';
    if (typeof fields.appendixLabel === 'string') return fields.appendixLabel;
    // Handle Rich Text
    if (fields.appendixLabel.nodeType && fields.appendixLabel.content) {
      const extractText = (node: any): string => {
        if (!node) return '';
        if (node.nodeType === 'text') return node.value || '';
        if (node.content && Array.isArray(node.content)) {
          return node.content.map(extractText).join('');
        }
        return '';
      };
      return extractText(fields.appendixLabel);
    }
    return String(fields.appendixLabel);
  };

  return {
    id: entry.sys.id, // Contentful entry ID for routing
    name: fields.name || 'Unknown Vendor',
    url: fields.url || '#',
    appendixFiles: getAppendixFiles(),
    appendixLabel: getAppendixLabel(),
  };
};

export const fetchVendorsFromContentful = async (): Promise<Vendor[]> => {
  if (!client) {
    console.warn('Contentful client not initialized');
    return [];
  }

  try {
    const response = await client.getEntries({
      content_type: 'vendor',
      order: 'sys.createdAt'
    });

    console.log("Fetched vendors from Contentful:", response.items);

    return response.items.map(mapContentfulVendorToAppVendor);
  } catch (error) {
    console.error('Error fetching vendors from Contentful:', error);
    return [];
  }
};