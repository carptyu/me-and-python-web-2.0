import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Dna, Plane, Store, LucideIcon } from 'lucide-react';
import { SCALESWAP_SHOP_URL, IMPORT_STATUS } from '../constants';
import { OPENING_PROMO } from '../geneticTestData';
import { ContactButtons } from './shared';
import SnakeCanvas from './SnakeCanvas';

/** Hero 底色：跟頁尾上方的聯絡區塊同色（concrete-900），首尾兩塊深色對稱 */
const HERO_BG = '#18181b';

/**
 * Hero 底部融進下方淺色區塊（concrete-50）的漸層。用緩動的透明度節點而不是直線兩色，
 * 深轉淺中間才不會出現一條髒灰帶。
 */
const PAGE_BG = '250,250,250';
const FADE_STOPS: [number, number][] = [
    [0, 0], [8.1, 0.013], [15.5, 0.049], [22.5, 0.104], [29, 0.175], [35.3, 0.259], [41.2, 0.352], [47.1, 0.45],
    [52.9, 0.55], [58.8, 0.648], [64.7, 0.741], [71, 0.825], [77.5, 0.896], [84.5, 0.951], [91.9, 0.987], [100, 1],
];
const BOTTOM_FADE = `linear-gradient(to bottom, ${FADE_STOPS.map(([p, a]) => `rgba(${PAGE_BG},${a}) ${p}%`).join(', ')})`;

type Service = {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    body: string;
    status: { label: string; tone: string };
    cta: string;
    to?: string; // 站內頁
    href?: string; // 外部連結
};

const SERVICES: Service[] = [
    {
        icon: Store,
        eyebrow: 'Shop',
        title: '線上選購',
        body: '在售個體統一在 ScaleSwap 上架，照片、基因與價格一次看清楚。',
        status: { label: 'ScaleSwap 賣場', tone: 'bg-concrete-100 text-concrete-900' },
        cta: '前往賣場',
        href: SCALESWAP_SHOP_URL,
    },
    {
        icon: Plane,
        eyebrow: 'Import',
        title: '進口代購',
        body: '從美國合作廠家挑選球蟒，CITES 文件、運輸與抵台檢疫由我們處理。',
        status: IMPORT_STATUS.open
            ? { label: '接單中', tone: 'bg-urban-green/10 text-urban-green' }
            : { label: IMPORT_STATUS.headline, tone: 'bg-concrete-100 text-zinc-600' },
        cta: '代購說明與廠家',
        to: '/import-service',
    },
    {
        icon: Dna,
        eyebrow: 'Genetic test',
        title: '基因檢測',
        body: '一片蛇蛻送美國 RGI 檢測，確認 het 帶基因、分辨外觀相似的基因。',
        status: OPENING_PROMO.active
            ? { label: `${OPENING_PROMO.name}・每項折 NT$${OPENING_PROMO.perItem}`, tone: 'bg-amber-50 text-amber-900' }
            : { label: '代送美國 RGI', tone: 'bg-concrete-100 text-zinc-600' },
        cta: '方案與價格',
        to: '/genetic-test',
    },
];

const ServiceCard = ({ s }: { s: Service }) => {
    const inner = (
        <>
            <div className="flex items-start justify-between mb-6">
                <span className="w-11 h-11 rounded-xl bg-urban-green/10 text-urban-green flex items-center justify-center">
                    <s.icon size={22} />
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.status.tone}`}>{s.status.label}</span>
            </div>
            <p className="text-urban-green font-bold text-[11px] tracking-[0.25em] uppercase mb-1">{s.eyebrow}</p>
            <h3 className="text-xl font-bold text-concrete-900 mb-2">{s.title}</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">{s.body}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-concrete-900 group-hover:text-urban-green transition-colors">
                {s.cta}
                {s.href ? <ArrowUpRight size={16} /> : <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </span>
        </>
    );
    const cls = 'group flex flex-col bg-white rounded-2xl border border-concrete-200 p-6 md:p-7 hover:border-urban-green/40 hover:shadow-sm transition-all';
    return s.href ? (
        <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    ) : (
        <Link to={s.to!} className={cls}>{inner}</Link>
    );
};

const Hero: React.FC = () => {
    const contentRef = useRef<HTMLDivElement>(null);
    const ghost =
        'inline-flex items-center justify-center bg-concrete-900/80 text-white border border-white/15 rounded-xl px-7 py-3.5 text-sm font-bold backdrop-blur-md hover:bg-concrete-800/90 hover:border-white/35 transition-colors';

    return (
        <header className="relative isolate overflow-hidden h-[100svh] min-h-[600px] max-h-[960px] cursor-none" style={{ background: HERO_BG }}>
            <SnakeCanvas background={HERO_BG} avoidRef={contentRef} className="absolute inset-0 w-full h-full" />

            {/* 標題底下一圈柔和的暗影、頂端一道漸層：蛇從字或導覽列底下爬過時字還是清楚 */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden md:block"
                style={{
                    background: `radial-gradient(ellipse 46% 40% at 50% 54%, ${HERO_BG}f0 0%, ${HERO_BG}b3 45%, ${HERO_BG}00 78%), linear-gradient(to bottom, ${HERO_BG}e6 0, ${HERO_BG}00 128px)`,
                }}
            />
            {/* 手機版：標題佔滿整個寬度，暗影要拉寬 */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 md:hidden"
                style={{
                    background: `radial-gradient(ellipse 85% 34% at 50% 54%, ${HERO_BG}f2 0%, ${HERO_BG}c0 50%, ${HERO_BG}00 85%), linear-gradient(to bottom, ${HERO_BG}e6 0, ${HERO_BG}00 104px)`,
                }}
            />

            <div className="pointer-events-none relative z-10 h-full flex items-center justify-center px-6 pt-16">
                <div ref={contentRef} className="flex flex-col items-center text-center w-full max-w-3xl animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-5">
                        <span className="block">城市綠洲</span>
                        <span className="block text-white/40 mt-1">迷蟒陪伴</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 mb-10">共同發掘 球蟒的無限可能</p>
                    <div data-snake-ignore className="pointer-events-auto cursor-auto grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
                        <a
                            href={SCALESWAP_SHOP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="col-span-2 inline-flex items-center justify-center gap-1.5 bg-white text-concrete-900 rounded-xl px-7 py-3.5 text-sm font-bold hover:bg-concrete-100 transition-colors shadow-lg shadow-black/30"
                        >
                            選購在售個體 <ArrowUpRight size={16} />
                        </a>
                        <Link to="/import-service" className={ghost}>
                            進口代購
                        </Link>
                        <Link to="/genetic-test" className={ghost}>
                            基因檢測
                        </Link>
                    </div>
                </div>
            </div>

            {/* 底部漸層：深色 Hero 慢慢融進下方的淺色內容 */}
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 inset-x-0 h-32 md:h-44" style={{ background: BOTTOM_FADE }} />
        </header>
    );
};

const HomePage: React.FC = () => (
    <div className="bg-concrete-50">
        <Hero />

        <div className="max-w-5xl mx-auto px-6 pt-8 pb-16 md:pt-12 md:pb-24 space-y-16 md:space-y-24">
            {/* ===== Services ===== */}
            <section>
                <div className="mb-8 md:mb-10">
                    <p className="text-urban-green font-bold text-[11px] tracking-[0.25em] uppercase mb-2">Services</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-concrete-900 tracking-tight">我們能幫你做什麼</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    {SERVICES.map(s => <ServiceCard key={s.title} s={s} />)}
                </div>
            </section>

            {/* ===== Contact ===== */}
            <section id="contact" className="scroll-mt-24 bg-concrete-900 text-white rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8 items-center">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 mb-2">Contact</p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">有問題直接問我們</h2>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                        加入 LINE 群組可以收到開團與到貨公告；個別詢問、報價或下單，請用 Instagram 或 Facebook 私訊。
                    </p>
                </div>
                <ContactButtons showHint />
            </section>
        </div>
    </div>
);

export default HomePage;
