import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Dna, Plane, Store, LucideIcon } from 'lucide-react';
import { SCALESWAP_SHOP_URL, IMPORT_STATUS } from '../constants';
import { OPENING_PROMO } from '../geneticTestData';
import { ContactButtons } from './shared';

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

const HomePage: React.FC = () => (
    <div className="bg-concrete-50">
        {/* ===== Hero ===== */}
        <header className="bg-concrete-100 border-b border-concrete-200 pt-32 md:pt-44 pb-16 md:pb-24">
            <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center animate-fade-in">
                <span className="text-urban-green font-bold text-xs md:text-sm mb-5 tracking-[0.2em] uppercase bg-urban-green/10 px-3 py-1 rounded-full">
                    Urban Jungle Collection
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-concrete-900 tracking-tight leading-[1.1] mb-5">
                    <span className="block">城市綠洲</span>
                    <span className="block text-concrete-400 mt-1">迷蟒陪伴</span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-600 mb-10">共同發掘 球蟒的無限可能</p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <a
                        href={SCALESWAP_SHOP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-concrete-900 text-white rounded-xl px-7 py-3.5 text-sm font-bold hover:bg-concrete-800 transition-colors shadow-lg"
                    >
                        選購在售個體 <ArrowUpRight size={16} />
                    </a>
                    <Link
                        to="/import-service"
                        className="inline-flex items-center justify-center bg-white text-concrete-900 border border-concrete-200 rounded-xl px-7 py-3.5 text-sm font-bold hover:border-concrete-400 transition-colors"
                    >
                        進口代購
                    </Link>
                    <Link
                        to="/genetic-test"
                        className="inline-flex items-center justify-center bg-white text-concrete-900 border border-concrete-200 rounded-xl px-7 py-3.5 text-sm font-bold hover:border-concrete-400 transition-colors"
                    >
                        基因檢測
                    </Link>
                </div>
            </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-16 md:space-y-24">
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
