/**
 * 代送基因檢測（美國 RGI，Rare Genetics Inc.）的方案內容與可測基因清單。
 * 基因一律用英文原名顯示，不做中文翻譯。
 *
 * ⚠️ 上線前必須確認：GENETIC_TEST_PRICING 的台幣報價目前沿用參考站數字，不是本舍定價。
 *
 * Phenome 已於 2026-09-04 取消，原始資料封存在 archive/phenome-2026-09/。
 *
 * 2026-09-04 已對照 https://www.morphmarket.com/genetic-tests 核對：
 *   - 64 個可測基因、50 Morph Panel 的 50 個、三個 Mini-Morph Complex 的內容都一致，名稱改用該頁寫法。
 *   - 該頁美金原價：單基因 US$40（加測每個 +US$20）、50 Morph Panel US$139、
 *     Mini-Morph 依群不同 US$85（Yellow Belly）／US$90（Blue Eyed Lucy）／US$100（Spider）。
 *   - 該頁沒有列出「All Recessive Panel」，隱性全套是否存在請向 RGI 確認。
 */

export type GeneGroup = {
  id: string;
  name: string;
  englishName: string;
  /** 基因英文名，同時當作唯一 id */
  genes: string[];
};

/** 台幣報價 */
export const GENETIC_TEST_PRICING = {
  /** 自選基因：第一個基因 */
  singleFirst: 1500,
  /** 自選基因：同一片蛇蛻加測，每個 */
  singleAdditional: 600,
  /** 全驗（Multi-Morph Panel），固定價 */
  multiPanel: 4500,
  /** 迷你套組，每個等位基因群 */
  miniPanelPerGroup: 3300,
  /** 隱性全套，固定價 */
  recessivePanel: 4200,
} as const;

/** 自選 n 個基因的價格 */
export function singleTestPrice(count: number): number {
  if (count <= 0) return 0;
  return GENETIC_TEST_PRICING.singleFirst + GENETIC_TEST_PRICING.singleAdditional * (count - 1);
}

/**
 * 開幕優惠：每個計費單位折 NT$100。
 * 自選基因＝每個基因各折；全驗、隱性全套＝每組折一次；迷你套組＝每群各折。
 * 活動結束時把 active 改成 false，價格與標示會自動回到原價。
 */
export const OPENING_PROMO = {
  active: true,
  name: '開幕優惠',
  perItem: 100,
} as const;

/** units 個計費單位可折的金額 */
export function promoDiscount(units: number): number {
  return OPENING_PROMO.active && units > 0 ? OPENING_PROMO.perItem * units : 0;
}

/** 全部可測基因（64 個），依等位基因群分組。其他方案的涵蓋範圍都以這裡的名稱為準。 */
export const ALL_GENE_GROUPS: GeneGroup[] = [
  {
    id: 'super-stripe',
    name: '超級直線群',
    englishName: 'Yellow Belly Complex',
    genes: ['Yellowbelly', 'Asphalt', 'Gravel', 'Spark', 'Specter'],
  },
  {
    id: 'ball8',
    name: 'Ball 8 群',
    englishName: 'Ball 8 Allele Group',
    genes: ['Black Pastel', 'Barnhart Black Pastel', 'Cinnamon', 'Enchi', 'Huffman', 'Het Red Axanthic'],
  },
  {
    id: 'bel',
    name: '藍眼白化群',
    englishName: 'Blue Eyed Lucy Complex',
    genes: ['Mojave', 'Special', 'Special (Noco)', 'Bamboo', 'Phantom/Mystic', 'Lesser', 'Butter', 'Russo', 'Honey'],
  },
  {
    id: 'blel',
    name: '黑眼白化群',
    englishName: 'Black-Eyed Lucy Allele Group',
    genes: ['Fire', 'Disco', 'Vanilla'],
  },
  {
    id: 'spider',
    name: '蜘蛛群',
    englishName: 'Spider Complex',
    genes: ['Blackhead', 'Bongo', 'Champagne', 'Chocolate', 'Cypress', 'Hidden Gene Woma', 'Spider', 'Spotnose', 'Woma', 'Wookie'],
  },
  {
    id: 'dominant',
    name: '其他顯性基因',
    englishName: 'Other Dominant Genes',
    genes: [
      'Acid', 'Red Stripe', 'Leopard', 'Orange Dream', 'Hurricane/Trick/Blitz', 'Pastel', 'GHI', 'Lace',
      'Furrow', 'Banana', 'Pinstripe',
    ],
  },
  {
    id: 'recessive',
    name: '隱性基因',
    englishName: 'Recessive Genes',
    genes: [
      'Albino', 'Candy/Toffee', 'Lavender Albino', 'Ultramel', 'Clown', 'Cryptic', 'Piebald', 'Desert Ghost',
      'Genetic Stripe', 'Hypo', 'Sunset', 'TCR Sunset', 'Axanthic - VPI', 'Axanthic - TSK/Black', 'Axanthic - GCR/MJ',
      'Puzzle', 'Monsoon', 'Dark Matter', 'Monarch', 'Zebra',
    ],
  },
];

/**
 * 全驗（Multi-Morph Panel）實際涵蓋的 50 個基因，固定內容不可自選。
 * 不在此清單的 14 個：Cinnamon、Het Red Axanthic、Honey、Disco、Vanilla、Furrow、
 * Banana、Pinstripe、TCR Sunset、Axanthic - GCR/MJ、Monsoon、Dark Matter、Monarch、Zebra。
 */
export const MULTI_PANEL_COVERAGE: string[] = [
  // 超級直線群
  'Yellowbelly', 'Asphalt', 'Gravel', 'Spark', 'Specter',
  // Ball 8 群
  'Black Pastel', 'Barnhart Black Pastel', 'Enchi', 'Huffman',
  // 藍眼白化群
  'Mojave', 'Special', 'Special (Noco)', 'Bamboo', 'Phantom/Mystic', 'Lesser', 'Butter', 'Russo',
  // 黑眼白化群
  'Fire',
  // 蜘蛛群
  'Blackhead', 'Bongo', 'Champagne', 'Chocolate', 'Cypress', 'Hidden Gene Woma', 'Spider', 'Spotnose', 'Woma', 'Wookie',
  // 其他顯性
  'Acid', 'Red Stripe', 'Leopard', 'Orange Dream', 'Hurricane/Trick/Blitz', 'Pastel', 'GHI', 'Lace',
  // 隱性
  'Albino', 'Candy/Toffee', 'Lavender Albino', 'Ultramel', 'Clown', 'Cryptic', 'Piebald',
  'Desert Ghost', 'Genetic Stripe', 'Hypo', 'Sunset', 'Axanthic - VPI', 'Axanthic - TSK/Black', 'Puzzle',
];

/** 隱性全套（All Recessive Panel）涵蓋的 14 個隱性基因，固定內容不可自選 */
export const RECESSIVE_PANEL_COVERAGE: string[] = [
  'Albino', 'Candy/Toffee', 'Lavender Albino', 'Ultramel', 'Clown', 'Cryptic', 'Piebald',
  'Desert Ghost', 'Genetic Stripe', 'Hypo', 'Sunset', 'Axanthic - VPI', 'Axanthic - TSK/Black', 'Puzzle',
];

/**
 * 迷你套組（Mini-Morph Panel）可選的等位基因群，一群計一次費用。
 * groupId 對應 ALL_GENE_GROUPS 的 id；genes 是該群實際會驗的基因（藍眼白化群只驗其中 6 個）。
 */
export const MINI_PANEL_GROUPS: { groupId: string; genes: string[] }[] = [
  { groupId: 'super-stripe', genes: ['Yellowbelly', 'Asphalt', 'Gravel', 'Spark', 'Specter'] },
  { groupId: 'bel', genes: ['Mojave', 'Special', 'Bamboo', 'Phantom/Mystic', 'Lesser', 'Russo'] },
  {
    groupId: 'spider',
    genes: ['Blackhead', 'Bongo', 'Champagne', 'Chocolate', 'Cypress', 'Hidden Gene Woma', 'Spider', 'Spotnose', 'Woma', 'Wookie'],
  },
];
