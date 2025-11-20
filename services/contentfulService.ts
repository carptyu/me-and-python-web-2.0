import { createClient } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import { Snake, Gender, Availability } from '../types';

// 使用環境變數建立連線 (Delivery API)
const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const managementToken = import.meta.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN;

let client: any = null;
let managementClient: any = null;

if (spaceId && accessToken) {
  client = createClient({
    space: spaceId,
    accessToken: accessToken,
  });
} else {
  console.warn('Contentful Delivery credentials are missing.');
}

if (managementToken) {
  managementClient = createManagementClient({
    accessToken: managementToken,
  });
} else {
  console.warn('Contentful Management Token is missing. Add/Delete operations will fail.');
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

export const addSnakeToContentful = async (snakeData: Partial<Snake>, imageFile: File | null): Promise<void> => {
  if (!managementClient || !spaceId) {
    throw new Error('Missing Management Token or Space ID');
  }

  try {
    const space = await managementClient.getSpace(spaceId);
    const environment = await space.getEnvironment('master');

    let imageAsset = null;

    // 1. Upload Image if provided
    if (imageFile) {
      console.log('Uploading image...');
      // Create Asset from file
      // Note: Contentful Management API requires a slightly complex flow for file upload
      // Simplified: Create Asset with uploadFrom -> Process -> Publish

      // We need to read the file as an ArrayBuffer or Stream, but createAssetFromFiles helper is useful if available.
      // Since we are in browser, we might need to use the upload API directly or use the helper.
      // The SDK's createAssetFromFiles is for Node.js usually. In browser, we use createAsset and pass the file.

      // Step 1: Create Upload
      const upload = await environment.createUpload({ file: imageFile });

      // Step 2: Create Asset
      const asset = await environment.createAsset({
        fields: {
          title: {
            'en-US': `${snakeData.morph} Image`
          },
          file: {
            'en-US': {
              fileName: imageFile.name,
              contentType: imageFile.type,
              uploadFrom: {
                sys: {
                  type: 'Link',
                  linkType: 'Upload',
                  id: upload.sys.id
                }
              }
            }
          }
        }
      });

      // Step 3: Process Asset
      const processedAsset = await asset.processForAllLocales();

      // Step 4: Publish Asset (Need to wait for processing, but SDK usually handles promise? 
      // Actually processForAllLocales returns the asset but processing happens async. 
      // We might need to poll or wait a bit. For simplicity, we try to publish after a short delay or check status.)

      // Simple wait loop
      let isProcessed = false;
      let currentAsset = processedAsset;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentAsset = await environment.getAsset(currentAsset.sys.id);
        if (currentAsset.fields.file['en-US'].url) {
          isProcessed = true;
          break;
        }
      }

      if (isProcessed) {
        imageAsset = await currentAsset.publish();
      } else {
        console.warn('Image processing timed out, proceeding without publishing image immediately.');
        imageAsset = currentAsset;
      }
    }

    // 2. Create Entry
    console.log('Creating entry...');
    const entryFields: any = {
      morph: { 'en-US': snakeData.morph },
      price: { 'en-US': snakeData.price },
      gender: { 'en-US': snakeData.gender },
      weight: { 'en-US': snakeData.weight },
      description: { 'en-US': snakeData.description },
      hatchDate: { 'en-US': snakeData.hatchDate },
      diet: { 'en-US': snakeData.diet },
      // genetics is array of strings
      genetics: { 'en-US': snakeData.genetics },
    };

    if (imageAsset) {
      entryFields.image = {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: imageAsset.sys.id
          }
        }
      };
    }

    const entry = await environment.createEntry('snake', {
      fields: entryFields
    });

    // 3. Publish Entry
    await entry.publish();
    console.log('Snake added successfully!');

  } catch (error) {
    console.error('Error adding snake to Contentful:', error);
    throw error;
  }
};

export const deleteSnakeFromContentful = async (snakeId: string): Promise<void> => {
  if (!managementClient || !spaceId) {
    throw new Error('Missing Management Token or Space ID');
  }

  try {
    const space = await managementClient.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    const entry = await environment.getEntry(snakeId);

    // Must unpublish before deleting
    if (entry.isPublished()) {
      await entry.unpublish();
    }

    await entry.delete();
    console.log('Snake deleted successfully!');
  } catch (error) {
    console.error('Error deleting snake from Contentful:', error);
    throw error;
  }
};