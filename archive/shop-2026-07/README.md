# 站內上架功能封存（2026-07）

蛇隻上架改由 **ScaleSwap** 統一處理：<https://www.scaleswap.co/sellers/me_and_python>

官網不再自己列出待售蛇隻，所有「看蛇 / 選購」的入口都改為外連到 ScaleSwap。

## 移除了什麼

| 項目 | 原位置 |
|---|---|
| `/shop` 路由與 `ShopPage`（列表、排序、顯示已售出開關） | `App.tsx` |
| `/snake/:id` 路由與 `SnakeDetailPage`（圖片輪播、規格、議價出價表單） | `App.tsx` |
| Contentful 蛇隻資料抓取（`fetchSnakesFromContentful`）與相關 state | `App.tsx` |
| 「已複製詢問訊息」提示彈窗（只有詳情頁會觸發） | `App.tsx` |
| `/shop` 的 sitemap 項目 | `public/sitemap.xml` |
| `SnakeCard` 元件（只有商店列表在用） | `components/SnakeCard.tsx` |

原始程式碼原樣保存在 `App.shop-sections.tsx.txt` 和 `SnakeCard.tsx.txt`
（副檔名為 `.txt`，不會被 TypeScript 編譯，也不會進 bundle）。

`services/contentfulService.ts` 的 `fetchSnakesFromContentful()` 沒有動，仍然留著隨時可用，
只是現在沒有人呼叫它。

## 改成外連的入口

| 位置 | 原本 | 現在 |
|---|---|---|
| 首頁 Hero「邂逅夥伴」 | `/shop` | ScaleSwap，新分頁 |
| 首頁卡片「最新孵化」 | `/shop` | ScaleSwap，新分頁 |
| Footer「全部夥伴」 | `/shop` | ScaleSwap，新分頁 |
| 導覽列「線上選購」 | `/shop` | ScaleSwap，新分頁 |

網址集中定義在 `constants.ts` 的 `SCALESWAP_SHOP_URL`，之後要換連結只需改那一行。

## 要復原的話

1. 把 `App.shop-sections.tsx.txt` 的六段貼回 `App.tsx` 對應位置，
   並把 `SnakeCard.tsx.txt` 放回 `components/SnakeCard.tsx`。
2. 補回 import：`SnakeCard`、`Snake`/`Availability` type、`FEATURED_SNAKES`、
   `fetchSnakesFromContentful`，以及被清掉的 lucide icon（`ChevronLeft`、`MapPin`）。
3. 在 `<Routes>` 加回 `/shop` 與 `/snake/:id` 兩條路由。
4. 四個入口改回 `navigate('/shop')`。
5. `public/sitemap.xml` 加回 `/shop`。

也可以直接從 git 歷史取封存前的版本。
