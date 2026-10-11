import React from 'react';
import { Instagram, Facebook } from 'lucide-react';
import { IG_URL, FB_URL, LINE_URL } from '../constants';

// 跨頁共用的小元件。版面語彙以基因檢測頁為準：白卡片 + 綠色英文小標 + 粗標題。

/** withText：在泡泡裡加白色 LINE 字樣；只在淺色背景、泡泡本身有顏色時用（例如頁尾），彩色按鈕上不需要 */
export const LineIcon = ({ size = 24, className = '', withText = false }: { size?: number; className?: string; withText?: boolean }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22.28 12.33C22.28 6.78 17.29 2.26 11.14 2.26C4.99 2.26 0 6.78 0 12.33C0 16.68 2.89 20.44 7.04 21.84C7.31 21.96 7.48 22.13 7.54 22.42C7.6 22.75 7.56 23.16 7.53 23.47C7.53 23.47 7.42 24.1 7.4 24.17C7.36 24.36 7.28 24.64 7.55 24.68C7.82 24.72 8.11 24.58 8.35 24.4C8.6 24.22 12.28 21.65 13.8 20.57C18.8 20.3 22.28 16.66 22.28 12.33Z" fill="currentColor" />
        {withText && (
            <text x="11.14" y="15" fontSize="6.5" fontWeight="900" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="0.5px">LINE</text>
        )}
    </svg>
);

export const SectionHeader = ({ index, title, lead }: { index: string; title: string; lead?: string }) => (
    <div className="mb-8 md:mb-10">
        <p className="text-urban-green font-bold text-[11px] tracking-[0.25em] uppercase mb-2">{index}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-concrete-900 tracking-tight">{title}</h2>
        {lead && <p className="text-zinc-600 mt-3 max-w-2xl leading-relaxed">{lead}</p>}
    </div>
);

export const Card = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={`scroll-mt-24 bg-white rounded-2xl border border-concrete-200 p-6 md:p-10 ${className}`}>
        {children}
    </section>
);

export const CONTACTS = [
    { key: 'line', label: 'LINE 群組', hint: '開團與到貨公告', href: LINE_URL, icon: LineIcon, className: 'bg-[#06C755]' },
    { key: 'ig', label: 'Instagram', hint: '私訊詢問', href: IG_URL, icon: Instagram, className: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { key: 'fb', label: 'Facebook', hint: '粉絲專頁私訊', href: FB_URL, icon: Facebook, className: 'bg-blue-600' },
] as const;

/** 三個聯絡管道按鈕；showHint 時在按鈕上多一行用途說明 */
export const ContactButtons = ({ showHint = false, className = '' }: { showHint?: boolean; className?: string }) => (
    <div className={`flex flex-col gap-3 ${className}`}>
        {CONTACTS.map(c => (
            <a
                key={c.key}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-white hover:opacity-90 transition-opacity ${c.className}`}
            >
                <c.icon size={20} />
                <span className="font-bold text-sm">{c.label}</span>
                {showHint && <span className="ml-auto text-xs text-white/80">{c.hint}</span>}
            </a>
        ))}
    </div>
);
