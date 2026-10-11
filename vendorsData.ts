import { Vendor } from './types';

// 進口代購頁的合作廠家列表（2026-10 從 Contentful 搬進來）。
// 增刪廠家直接改這裡；id 用 MorphMarket 的 seller 代號，會出現在 /vendor/:id/appendix 網址。
// 名稱統一每個字首大寫，照字母排序（代購頁會依字首分組）。
// 要加附錄：appendixLabel 填說明文字，appendixFiles 填圖片路徑（圖片放 public/vendors/）。

const mm = (seller: string) =>
  `https://www.morphmarket.com/us/c/reptiles/pythons/ball-pythons?seller=${seller}&state=for_sale`;

export const VENDORS: Vendor[] = [
  { id: "americanmadeexoticsllc", name: "American Made Exotics", url: mm("americanmadeexoticsllc"), logo: "/vendors/americanmadeexoticsllc.webp" },
  { id: "aurareptiles", name: "Aura", url: mm("aurareptiles"), logo: "/vendors/aurareptiles.webp" },
  { id: "ballpythons101", name: "Ball Pythons 101", url: mm("ballpythons101"), logo: "/vendors/ballpythons101.webp" },
  { id: "ballroom", name: "Ballroom Pythons South", url: mm("ballroom"), logo: "/vendors/ballroom.webp" },
  { id: "jbaud", name: "Baud's Exotic Reptiles", url: mm("jbaud"), logo: "/vendors/jbaud.webp" },
  { id: "bobvu", name: "Bobs Balls", url: mm("bobvu"), logo: "/vendors/bobvu.webp" },
  { id: "brockwagner", name: "Brock Wagner Reptiles", url: mm("brockwagner"), logo: "/vendors/brockwagner.webp" },
  { id: "chimera_reptile", name: "Chimera", url: mm("chimera_reptile"), logo: "/vendors/chimera_reptile.webp" },
  { id: "conduitconstrictors", name: "Conduit Constrictors", url: mm("conduitconstrictors"), logo: "/vendors/conduitconstrictors.webp" },
  { id: "constrictedreptiles", name: "Constricted Reptiles", url: mm("constrictedreptiles"), logo: "/vendors/constrictedreptiles.webp" },
  { id: "cvexotics", name: "CV Exotics", url: mm("cvexotics"), logo: "/vendors/cvexotics.webp" },
  { id: "gtreptiles", name: "George Emde Reptiles", url: mm("gtreptiles"), logo: "/vendors/gtreptiles.webp" },
  { id: "chad-hulker", name: "Hulkers Herps", url: mm("chad-hulker"), logo: "/vendors/chad-hulker.webp" },
  { id: "kinova", name: "Kinova", url: mm("kinova"), logo: "/vendors/kinova.webp" },
  { id: "lockednloaded", name: "Locked N Loaded Ball Pythons", url: mm("lockednloaded"), logo: "/vendors/lockednloaded.webp" },
  { id: "marcbailey", name: "Marc Bailey Reptiles", url: mm("marcbailey"), logo: "/vendors/marcbailey.webp" },
  { id: "mcpythons", name: "Milbradt & Caponetto Pythons", url: mm("mcpythons"), logo: "/vendors/mcpythons.webp" },
  { id: "morph_jungle", name: "Morph Jungle", url: mm("morph_jungle"), logo: "/vendors/morph_jungle.webp" },
  { id: "nussman", name: "Nussman Reptiles", url: mm("nussman"), logo: "/vendors/nussman.webp" },
  { id: "ozzyboidsllc", name: "Ozzy Boids", url: mm("ozzyboidsllc"), logo: "/vendors/ozzyboidsllc.webp" },
  { id: "petrovcik", name: "Petrogenetics", url: mm("petrovcik"), logo: "/vendors/petrovcik.webp" },
  { id: "royalconstrictordesigns", name: "Royal Constrictor Designs", url: mm("royalconstrictordesigns"), logo: "/vendors/royalconstrictordesigns.webp" },
  { id: "stevesmorphs", name: "Steve's Morphs", url: mm("stevesmorphs"), logo: "/vendors/stevesmorphs.webp" },
  { id: "tallgrassreptiles", name: "Tallgrass Reptiles", url: mm("tallgrassreptiles"), logo: "/vendors/tallgrassreptiles.webp" },
  { id: "wilbanks", name: "Wilbanks Captive Bred Reptiles", url: mm("wilbanks"), logo: "/vendors/wilbanks.webp" },
];
