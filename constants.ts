import { Snake, Article, Gender, Availability } from './types';

export const FEATURED_SNAKES: Snake[] = [];

export const ARTICLES: Article[] = [
  {
    id: 'ART-001',
    slug: 'ball-python-care-guide',
    title: '飼養美學：打造球蟒的舒適豪宅',
    excerpt: '溫度、濕度與安全感。我們將解析如何在都市公寓中建立完美的爬蟲生態箱。',
    content: `
      <p>在繁忙的都市中飼養球蟒 (<em>Python regius</em>) 是一種獨特的體驗。與貓狗不同，他們需要的是一個精準控制的微氣候環境。</p>
      <br/>
      <h3 class="text-xl font-bold text-urban-green mb-2">1. 溫度的梯度 (Temperature Gradients)</h3>
      <p>球蟒是外溫動物。他們需要一個 31-33°C 的熱點區和 24-27°C 的冷區。建議使用高品質的溫控器來調節加熱墊或陶瓷燈。切勿使用無控溫的熱源，這極其危險。</p>
      <br/>
      <h3 class="text-xl font-bold text-urban-green mb-2">2. 濕度即健康 (Humidity is Health)</h3>
      <p>環境濕度應保持在 60-70%。在蛻皮期間，請提升至 80%。乾燥的冷氣房是球蟒的大敵，可能導致脫皮不全或呼吸道感染。</p>
      <br/>
      <h3 class="text-xl font-bold text-urban-green mb-2">3. 安全感與隱私 (Security)</h3>
      <p>一條感到壓力的蛇是不會進食的。在飼養箱的冷熱兩端都應設置緊湊的躲避穴。對於球蟒來說，「擁擠」反而意味著「安全」。避免過於空曠的空間。</p>
    `,
    author: 'Royal Morphs 團隊',
    date: '2023年10月12日',
    imageUrl: 'https://picsum.photos/seed/reptilecare/800/600',
    tags: ['飼養指南', '新手入門', '環境設置'],
    category: '飼養指南',
    readTime: '5 min'
  },
  {
    id: 'ART-002',
    slug: 'genetics-101',
    title: '基因解碼：隱性與共顯性的數學之美',
    excerpt: '深入淺出探討品系背後的遺傳學。如何預測你的下一窩蛋會孵出什麼驚喜？',
    content: '基因計算是現代爬蟲文化的精髓。在本指南中，我們將探討顯性、隱性以及超級形式 (Super Forms) 是如何互動的。透過簡單的孟德爾遺傳學，你也可以成為基因設計師...',
    author: 'Dr. Herp',
    date: '2023年11月05日',
    imageUrl: 'https://picsum.photos/seed/genetics/800/600',
    tags: ['基因學', '繁殖計畫'],
    category: '基因知識',
    readTime: '8 min'
  },
  {
    id: 'ART-003',
    slug: 'feeding-tips',
    title: '挑食應對：當你的球蟒絕食時',
    excerpt: '球蟒以季節性拒食聞名。在恐慌之前，先檢查你的環境設置與餵食技巧。',
    content: '球蟒是出了名的挑食者，尤其在冬季。首先，檢查溫濕度是否正確。如果一切正常，嘗試以下技巧：改變餌料大小、使用吹風機加熱餌料頭部增強氣味 (Scenting)，或是調整餵食時間至深夜...',
    author: 'Royal Morphs 團隊',
    date: '2023年12月20日',
    imageUrl: 'https://picsum.photos/seed/feeding/800/600',
    tags: ['餵食技巧', '健康管理'],
    category: '健康管理',
    readTime: '6 min'
  }
];