# Phenome 驗皮方案封存（2026-09）

基因檢測代送頁（`/genetic-test`）原本同時支援美國兩家實驗室：RGI 與 Phenome（原 shedtesting.com，該網址會 301 轉址到 phenome.com）。

**2026-09-04 決定只做 RGI**，Phenome 相關資料與介面全部移除。

## 移除了什麼

| 項目 | 原位置 |
|---|---|
| Phenome 階梯計價（1–10 項 US$35–85、11–17 項 US$95、18 項以上 US$125）、45 個可測項目、17 項隱性清單、美元換算 | `geneticTestData.ts` |
| RGI／Phenome 實驗室切換、Phenome 自選試算面板（含「再加 N 項不用加錢」提示） | `components/GeneticTestCalculator.tsx` |
| 頁面上提到 Phenome 的文字與「美金計價」注意事項 | `components/GeneticTestPage.tsx` |

資料原樣保存在 `phenome-data.ts.txt`（副檔名為 `.txt`，不會被 TypeScript 編譯，也不會進 bundle）。
階梯價已於 2026-09-04 核對過 phenome.com/price-list，與封存資料一致。
