import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 這是單頁網站（SPA），所有網址回傳的都是同一份 index.html。
// 沒有各頁自己的標題與 canonical，Google 會把內容相似的頁面判成「重複網頁」。
// 這裡依網址設定：頁面標題、描述、canonical 標準網址；施工中頁面加 noindex 不收錄。

const SITE = 'https://www.meandpython.com';
const BRAND = '迷蟒 Me&Python';
const DEFAULT_DESC = '迷蟒 Me&Python｜台灣球蟒在售個體、海外進口代購、基因檢測服務。城市綠洲，迷蟒陪伴。';

type PageSeo = { title: string; description?: string; noindex?: boolean };

const PAGES: Record<string, PageSeo> = {
    '/': { title: `${BRAND} | 城市中的靜謐陪伴` },
    '/import-service': {
        title: `進口代購服務 | ${BRAND}`,
        description: '迷蟒球蟒海外進口代購：美國、歐洲繁殖者個體代購，CITES 文件與運輸全程處理，公開進口時程。',
    },
    '/genetic-test': {
        title: `基因檢測服務 | ${BRAND}`,
        description: '球蟒基因檢測代送服務：一片蛇蛻，不抽血、不麻醉，檢測隱性基因與性別。',
    },
    '/import-terms': {
        title: `海外進口代購交易細則 | ${BRAND}`,
        description: '迷蟒海外進口代購的訂金、付款、運輸與售後交易細則。',
    },
};

// 尚未完成、內容只有「建構中」的頁面：不讓 Google 收錄
const NOINDEX_PREFIXES = ['/blog', '/about', '/admin', '/maintenance'];

function setMeta(attr: 'name' | 'property', key: string, content: string) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href: string) {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

const SeoManager = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // 去掉結尾斜線，/genetic-test/ 與 /genetic-test 視為同一頁
        const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
        const known = PAGES[path];
        const vendorAppendix = path.startsWith('/vendor/');
        const noindex = NOINDEX_PREFIXES.some(p => path === p || path.startsWith(`${p}/`));

        const title = known?.title ?? (vendorAppendix ? `廠商附件 | ${BRAND}` : `${BRAND} | 城市中的靜謐陪伴`);
        const description = known?.description ?? DEFAULT_DESC;
        const url = SITE + (path === '/' ? '/' : path); // 查詢參數（?utm_、?igsh 等）一律不放進 canonical

        document.title = title;
        setMeta('name', 'description', description);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', url);
        setCanonical(url);
        setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    }, [pathname]);

    return null;
};

export default SeoManager;
