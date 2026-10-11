import { Vendor } from './types';

// 進口代購頁的合作廠家列表（2026-10 從 Contentful 搬進來）。
// 增刪廠家直接改這裡；id 用 MorphMarket 的 seller 代號，會出現在 /vendor/:id/appendix 網址。
// 名稱統一每個字首大寫，照字母排序（代購頁會依字首分組）。
// 要加附錄：appendixLabel 填說明文字，appendixFiles 填圖片路徑（圖片放 public/vendors/）。

const mm = (seller: string) =>
  `https://www.morphmarket.com/us/c/reptiles/pythons/ball-pythons?seller=${seller}&state=for_sale`;

export const VENDORS: Vendor[] = [
  { id: "americanmadeexoticsllc", name: "American Made Exotics", url: mm("americanmadeexoticsllc") },
  { id: "aurareptiles", name: "Aura", url: mm("aurareptiles") },
  { id: "ballpythons101", name: "Ball Pythons 101", url: mm("ballpythons101") },
  { id: "ballroom", name: "Ballroom Pythons South", url: mm("ballroom") },
  { id: "jbaud", name: "Baud's Exotic Reptiles", url: mm("jbaud") },
  { id: "bobvu", name: "Bobs Balls", url: mm("bobvu") },
  { id: "brockwagner", name: "Brock Wagner Reptiles", url: mm("brockwagner") },
  { id: "chimera_reptile", name: "Chimera", url: mm("chimera_reptile") },
  { id: "conduitconstrictors", name: "Conduit Constrictors", url: mm("conduitconstrictors") },
  { id: "constrictedreptiles", name: "Constricted Reptiles", url: mm("constrictedreptiles") },
  { id: "cvexotics", name: "CV Exotics", url: mm("cvexotics") },
  { id: "gtreptiles", name: "George Emde Reptiles", url: mm("gtreptiles") },
  { id: "chad-hulker", name: "Hulkers Herps", url: mm("chad-hulker") },
  { id: "kinova", name: "Kinova", url: mm("kinova") },
  { id: "lockednloaded", name: "Locked N Loaded Ball Pythons", url: mm("lockednloaded") },
  { id: "marcbailey", name: "Marc Bailey Reptiles", url: mm("marcbailey") },
  { id: "mcpythons", name: "Milbradt & Caponetto Pythons", url: mm("mcpythons") },
  { id: "morph_jungle", name: "Morph Jungle", url: mm("morph_jungle") },
  { id: "nussman", name: "Nussman Reptiles", url: mm("nussman") },
  { id: "ozzyboidsllc", name: "Ozzy Boids", url: mm("ozzyboidsllc") },
  { id: "petrovcik", name: "Petrogenetics", url: mm("petrovcik") },
  { id: "royalconstrictordesigns", name: "Royal Constrictor Designs", url: mm("royalconstrictordesigns") },
  { id: "stevesmorphs", name: "Steve's Morphs", url: mm("stevesmorphs") },
  { id: "tallgrassreptiles", name: "Tallgrass Reptiles", url: mm("tallgrassreptiles") },
  { id: "wilbanks", name: "Wilbanks Captive Bred Reptiles", url: mm("wilbanks") },
];
