// Aura 清單轉檔：node scripts/convert-aura-list.cjs <試算表匯出的.csv> auraListData.ts（不給輸出檔則只印摘要）
const fs = require('fs');
const [, , src, out] = process.argv;
const text = fs.readFileSync(src, 'utf8').replace(/^﻿/, '');

// 簡易 CSV 解析（支援引號與引號內換行）
const rows = [];
let row = [], cell = '', q = false;
for (let i = 0; i < text.length; i++) {
  const c = text[i];
  if (q) {
    if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
    else cell += c;
  } else if (c === '"') q = true;
  else if (c === ',') { row.push(cell); cell = ''; }
  else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
  else if (c !== '\r') cell += c;
}
if (cell || row.length) { row.push(cell); rows.push(row); }

const head = rows[0].map(h => h.replace(/\*/g, '').trim());
const col = n => head.indexOf(n);
const data = rows.slice(1).filter(r => r[col('Title')]?.trim());

const count = k => {
  const m = {};
  data.forEach(r => { const v = r[col(k)] || '(空)'; m[v] = (m[v] || 0) + 1; });
  return m;
};

const isoDate = s => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s || '').trim());
  return m ? `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}` : '';
};

const items = data.map(r => {
  const title = r[col('Title')].trim();
  const o = {
    id: r[col('Animal_Id')].trim(),
    genes: title.replace(/\.\.\.$/, '').split(',').map(s => s.trim()).filter(Boolean),
    sex: r[col('Sex')].trim(),
    maturity: r[col('Maturity')].trim(),
    price: Number(r[col('Price')]) || 0,
  };
  if (/\.\.\.$/.test(title)) o.truncated = true;
  const dob = isoDate(r[col('Dob')]);
  if (dob) o.dob = dob;
  const clutch = r[col('Group_Id')].trim();
  if (clutch) o.clutch = clutch;
  if (/^yes$/i.test(r[col('Proven_Breeder')].trim())) o.proven = true;
  return o;
});

if (!out) {
  console.log('rows', data.length);
  for (const k of ['Category', 'Maturity', 'State', 'Visibility', 'Enabled', 'Sex', 'Quantity', 'Is_Negotiable'])
    console.log(k, JSON.stringify(count(k)));
  const filled = head.filter((h, i) => data.some(r => (r[i] || '').trim()));
  console.log('non-empty cols', filled.join(', '));
  const prices = items.map(i => i.price).sort((a, b) => a - b);
  console.log('price min/max', prices[0], prices[prices.length - 1], 'under500', prices.filter(p => p < 500).length, 'zero', prices.filter(p => !p).length);
  console.log('truncated', items.filter(i => i.truncated).length);
  console.log('dup ids', items.length - new Set(items.map(i => i.id)).size);
  console.log('bad dob', data.filter(r => r[col('Dob')].trim() && !isoDate(r[col('Dob')])).map(r => r[col('Dob')]).slice(0, 10));
  const g = {};
  items.forEach(i => i.genes.forEach(x => { g[x] = (g[x] || 0) + 1; }));
  console.log('distinct gene tokens', Object.keys(g).length);
  console.log(Object.entries(g).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' | '));
  console.log('other cols sample', JSON.stringify(data.slice(0, 400).map(r => [r[col('Traits')], r[col('Desc')], r[col('Weight')], r[col('Proven_Breeder')]]).filter(a => a.some(Boolean)).slice(0, 8)));
  console.log(JSON.stringify(items.slice(-3)));
} else {
  const today = new Date().toISOString().slice(0, 10);
  const body = items.map(i => '  ' + JSON.stringify(i)).join(',\n');
  fs.writeFileSync(out,
`// Aura 現貨清單（由 Google 試算表「Availability Lists」轉出，不要手改）。
// 更新方式：重新匯出試算表 CSV → node scripts/convert-aura-list.cjs <csv> auraListData.ts

export interface AuraListItem {
  id: string;          // Aura 的個體編號
  genes: string[];     // 基因，英文原名；表現型與 het 混在一起，顯示時再分
  sex: string;         // Male / Female / Unknown
  maturity: string;    // Adult / Subadult / Juvenile / Baby
  price: number;       // 美元
  dob?: string;        // YYYY-MM-DD
  clutch?: string;     // 窩號（開頭四碼是出生年）
  proven?: true;       // 已有繁殖紀錄
  truncated?: true;    // 原始清單的基因欄被截斷（結尾是 ...）
}

export const AURA_LIST_UPDATED = '${today}';

export const AURA_LIST: AuraListItem[] = [
${body},
];
`);
  console.log('wrote', items.length, 'items to', out);
}
