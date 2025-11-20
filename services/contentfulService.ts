import { createClient } from 'contentful';
import { Snake, Gender, Availability } from '../types';

// 使用環境變數建立連線
const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

let client: any = null;

if (spaceId && accessToken) {
  client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });
} else {
  console.warn('Contentful credentials are missing. Please check Vercel environment variables.');
}

// 將 Contentful 的資料格式轉換成我們 App 的格式
const mapContentfulSnakeToAppSnake = (item: any): Snake => {
  const fields = item.fields;
  const sys = item.sys;
  
  // 處理圖片 URL
  let imageUrl = 'https://picsum.photos/seed/error/800/800';
  
  // Contentful 的圖片結構通常在 fields.image.fields.file.url
  if (fields.image && fields.image.fields && fields.image.fields.file) {
    imageUrl = fields.image.fields.file.url;
    // 如果 URL 開頭沒有 http/https，補上 https:
    if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    }
  }

  // 處理可能是字串或數字的價格
  const rawPrice = fields.price;
  const price = typeof rawPrice === 'string' ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : (rawPrice || 0);

  return {
    id: sys.id,
    morph: fields.morph || 'Unnamed Snake', // 必填欄位
    scientificName: fields.scientificName || 'Python regius',
    price: price, // 必填欄位
    
    // 以下為選填欄位，若 Contentful 沒建立，則使用預設值
    gender: fields.gender === 'Female' ? Gender.Female : Gender.Male, 
    weight: fields.weight || 100,
    hatchDate: fields.hatchDate || new Date().toISOString().split('T')[0],
    genetics: fields.genetics ? (Array.isArray(fields.genetics) ? fields.genetics : [fields.genetics]) : [], 
    diet: fields.diet || '冷凍解凍鼠',
    availability: Availability.Available, 
    description: fields.description || 'No description provided.', // 必填欄位
    imageUrl: imageUrl, // 必填欄位
    images: [imageUrl] // 目前先用單張圖，若有多張圖需額外處理
  };
};

export const fetchSnakesFromContentful = async (): Promise<Snake[]> => {
  // 如果沒有金鑰，回傳空陣列，避免網頁崩潰
  if (!client) {
    console.warn("No Contentful client available.");
    return [];
  }

  try {
    // 抓取 Content Model ID 為 'snake' 的資料
    const response = await client.getEntries({
      content_type: 'snake', 
      order: '-sys.createdAt' // 新的排前面
    });

    console.log("Fetched snakes from Contentful:", response.items);
    return response.items.map(mapContentfulSnakeToAppSnake);
  } catch (error) {
    console.error('Error fetching from Contentful:', error);
    return [];
  }
};