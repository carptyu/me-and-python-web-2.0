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