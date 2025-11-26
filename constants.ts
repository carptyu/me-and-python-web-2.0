import { Snake, Article, Gender, Availability } from './types';

export const FEATURED_SNAKES: Snake[] = [
  {
    id: 'BP-001',
    morph: 'Banana Clown (香蕉小丑)',
    scientificName: 'Python regius',
    price: 38000,
    gender: Gender.Male,
    weight: 150,
    hatchDate: '2023-08-15',
    genetics: ['Banana', 'Clown'],
    diet: '冷凍解凍乳鼠 (Rat Pup)',
    availability: Availability.Available,
    description: '極致的黃色表現，乾淨無雜點。對於追求極致香蕉基因的玩家來說，這是完美的選擇。目前進食慾望強烈。',
    imageUrl: 'https://picsum.photos/seed/snake1/800/800',
    images: [
      'https://picsum.photos/seed/snake1/800/800',
      'https://picsum.photos/seed/snake1-head/800/800',
      'https://picsum.photos/seed/snake1-belly/800/800'
    ]
  },
  {
    id: 'BP-002',
    morph: 'Blue Eyed Leucistic (白金)',
    scientificName: 'Python regius',
    price: 18000,
    gender: Gender.Female,
    weight: 210,
    hatchDate: '2023-07-01',
    genetics: ['Mojave', 'Lesser'],
    diet: '活體乳鼠',
    availability: Availability.Available,
    description: '純淨的白色鱗片搭配深邃的藍眼。如同都市中的一件現代藝術品，性格溫馴，適合新手飼養。',
    imageUrl: 'https://picsum.photos/seed/snake2/800/800',
    images: [
      'https://picsum.photos/seed/snake2/800/800',
      'https://picsum.photos/seed/snake2-detail/800/800'
    ]
  },
  {
    id: 'BP-003',
    morph: 'Pied 100% Het Clown (派德)',
    scientificName: 'Python regius',
    price: 25000,
    gender: Gender.Male,
    weight: 180,
    hatchDate: '2023-09-10',
    genetics: ['Piebald', 'Het Clown'],
    diet: '冷凍解凍跳跳鼠',
    availability: Availability.OnHold,
    description: '高白表現的派德，擁有美麗的圖騰破碎感。這是作為未來繁殖計畫基石的絕佳雄性。',
    imageUrl: 'https://picsum.photos/seed/snake3/800/800',
    images: [
      'https://picsum.photos/seed/snake3/800/800',
      'https://picsum.photos/seed/snake3-pattern/800/800'
    ]
  },
  {
    id: 'BP-004',
    morph: 'GHI Mojave (GHI 莫哈維)',
    scientificName: 'Python regius',
    price: 13500,
    gender: Gender.Female,
    weight: 120,
    hatchDate: '2023-10-05',
    genetics: ['GHI', 'Mojave'],
    diet: '冷凍解凍絨毛鼠',
    availability: Availability.Available,
    description: '深沉、Moody、充滿對比。這種暗色系組合隨著蛻皮次數增加，質感會越發強烈。適合喜歡深色系風格的藏家。',
    imageUrl: 'https://picsum.photos/seed/snake4/800/800',
    images: ['https://picsum.photos/seed/snake4/800/800']
  },
  {
    id: 'BP-005',
    morph: 'Acid Huffman (酸性哈夫曼)',
    scientificName: 'Python regius',
    price: 75000,
    gender: Gender.Male,
    weight: 300,
    hatchDate: '2023-05-20',
    genetics: ['Acid', 'Huffman'],
    diet: '冷凍解凍亞成鼠',
    availability: Availability.Sold,
    description: '頂級遺傳基因。其混亂且獨特的紋路在球蟒界是世界級的表現。',
    imageUrl: 'https://picsum.photos/seed/snake5/800/800',
    images: ['https://picsum.photos/seed/snake5/800/800']
  },
  {
    id: 'BP-006',
    morph: 'Sunset (日落)',
    scientificName: 'Python regius',
    price: 105000,
    gender: Gender.Male,
    weight: 110,
    hatchDate: '2023-11-01',
    genetics: ['Sunset'],
    diet: '活體跳跳鼠',
    availability: Availability.PreOrder,
    description: '橘色的聖杯。這種強烈的橘紅色澤不會褪色。對於高端育種計畫來說是必備的基因。',
    imageUrl: 'https://picsum.photos/seed/snake6/800/800',
    images: ['https://picsum.photos/seed/snake6/800/800']
  }
];

export const ARTICLES: Article[] = [
  {
    id: 'ART-001',
    slug: 'ball-python-care-guide',
    title: '飼養美學：打造球蟒的舒適豪宅',
    excerpt: '溫度、濕度與安全感。我們將解析如何在都市公寓中建立完美的爬蟲生態箱。',
    content: `
      <p>在繁忙的都市中飼養球蟒 (<em>Python regius</em>) 是一種獨特的體驗。與貓狗不同，牠們需要的是一個精準控制的微氣候環境。</p>
      <br/>
      <h3 class="text-xl font-bold text-urban-green mb-2">1. 溫度的梯度 (Temperature Gradients)</h3>
      <p>球蟒是外溫動物。牠們需要一個 31-33°C 的熱點區和 24-27°C 的冷區。建議使用高品質的溫控器來調節加熱墊或陶瓷燈。切勿使用無控溫的熱源，這極其危險。</p>
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