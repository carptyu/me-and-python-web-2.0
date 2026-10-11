import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock, Calculator, ChevronRight, FileText, MessageCircle, Search, Users, Wallet, LucideIcon } from 'lucide-react';
import { IMPORT_STATUS, IMPORT_PRICING, LINE_URL } from '../constants';
import { VENDORS } from '../vendorsData';
import { TERMS_HIGHLIGHTS } from '../importTermsData';
import { Card, ContactButtons, SectionHeader } from './shared';

const hasAppendix = (v: (typeof VENDORS)[number]) => (v.appendixFiles?.length ?? 0) > 0 || !!v.appendixLabel;
const anyAppendix = VENDORS.some(hasAppendix);
const SORTED_VENDORS = [...VENDORS].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

const FLOW: { icon: LucideIcon; title: string; body: React.ReactNode }[] = [
    {
        icon: Users,
        title: '加入 LINE 群組',
        body: (
            <>
                開團、結單與到貨都會在{' '}
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-urban-green hover:underline">
                    LINE 群組
                </a>{' '}
                公告。
            </>
        ),
    },
    { icon: Search, title: '挑選個體', body: '從下方合作廠家的 MorphMarket 頁面挑選，不用自己聯絡廠家。' },
    { icon: MessageCircle, title: '私訊連結給我們', body: '把個體連結傳到 IG 或 FB，我們確認價格與細節後回覆。' },
    { icon: Wallet, title: '付款完成下訂', body: '確認後 24 小時內付清全款，我們才會向廠家下訂。' },
];

const ANCHORS = [
    { href: '#flow', label: '下單流程' },
    { href: '#vendors', label: '合作廠家' },
    { href: '#contact', label: '聯絡我們' },
];

const ImportServicePage: React.FC = () => (
    <div className="bg-concrete-50 pb-20">
        {/* ===== Hero ===== */}
        <header className="bg-white border-b border-concrete-200 pt-28 md:pt-36 pb-12 md:pb-16">
            <div className="max-w-5xl mx-auto px-6">
                <span className="inline-block text-urban-green font-bold text-xs tracking-[0.2em] uppercase bg-urban-green/10 px-3 py-1 rounded-full mb-5">
                    Import service · 美國代購
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-concrete-900 tracking-tight leading-[1.15] mb-5">進口代購服務</h1>
                <p className="text-xl md:text-2xl text-concrete-900 font-light leading-relaxed max-w-2xl">
                    從美國合作廠家挑選球蟒，<br className="hidden md:block" />
                    CITES 文件、運輸與抵台檢疫由我們處理。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
                    <div className={`rounded-xl border p-5 ${IMPORT_STATUS.open ? 'bg-urban-green/10 border-urban-green/30' : 'bg-concrete-50 border-concrete-200'}`}>
                        <div className="flex items-center gap-2 text-zinc-600 text-sm mb-2">
                            <CalendarClock size={16} /> 進口時程
                        </div>
                        <p className="text-lg font-bold text-concrete-900">{IMPORT_STATUS.headline}</p>
                        <p className="text-sm text-zinc-600 leading-relaxed mt-1">{IMPORT_STATUS.detail}</p>
                    </div>
                    <div className="rounded-xl border border-concrete-200 bg-concrete-50 p-5">
                        <div className="flex items-center gap-2 text-zinc-600 text-sm mb-2">
                            <Calculator size={16} /> 計價方式
                        </div>
                        <p className="text-lg font-bold text-concrete-900">{IMPORT_PRICING.formula}</p>
                        <p className="text-sm text-zinc-600 leading-relaxed mt-1">{IMPORT_PRICING.note}</p>
                    </div>
                </div>

                <nav className="flex flex-wrap gap-2 mt-6" aria-label="頁內導覽">
                    {ANCHORS.map(a => (
                        <a
                            key={a.href}
                            href={a.href}
                            className="text-sm px-4 py-2 rounded-full border border-concrete-200 bg-white text-concrete-900 hover:border-urban-green hover:text-urban-green transition-colors"
                        >
                            {a.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 space-y-6 md:space-y-8 mt-8 md:mt-10">
            {/* ===== 下單前必讀 ===== */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
                <h2 className="text-lg font-bold text-amber-900 mb-1">⚠️ 下單前必讀</h2>
                <p className="text-amber-900/80 text-sm mb-4">
                    付款下單即視為同意
                    <Link to="/import-terms" className="font-bold text-urban-green hover:underline">《迷蟒海外進口代購交易細則》</Link>
                </p>
                <ul className="space-y-2 mb-5">
                    {TERMS_HIGHLIGHTS.map(h => (
                        <li key={h.anchor} className="flex gap-2 text-concrete-900 leading-relaxed">
                            <span className="flex-shrink-0 mt-[11px] w-1 h-1 rounded-full bg-amber-700" aria-hidden />
                            <Link to={`/import-terms#${h.anchor}`} className="hover:text-urban-green transition-colors">
                                {h.text}
                            </Link>
                        </li>
                    ))}
                </ul>
                <Link
                    to="/import-terms"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-concrete-900 text-white text-sm font-medium rounded-lg hover:bg-concrete-800 transition-colors"
                >
                    閱讀完整交易細則 <ChevronRight size={16} />
                </Link>
            </section>

            {/* ===== 01 下單流程 ===== */}
            <Card id="flow">
                <SectionHeader index="01 · How it works" title="下單流程" lead="四個步驟，挑好個體後其餘交給我們。" />
                <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                    {FLOW.map((f, i) => (
                        <li key={f.title} className="relative">
                            {i < FLOW.length - 1 && (
                                <span className="hidden md:block absolute top-6 left-12 right-[-1.5rem] h-px bg-concrete-200" aria-hidden />
                            )}
                            <div className="relative z-10 w-12 h-12 rounded-full bg-concrete-900 text-white flex items-center justify-center mb-4">
                                <f.icon size={20} />
                            </div>
                            <p className="text-[11px] font-bold tracking-wider text-concrete-400 mb-1">STEP {i + 1}</p>
                            <p className="font-bold text-concrete-900 mb-1">{f.title}</p>
                            <p className="text-sm text-zinc-600 leading-relaxed">{f.body}</p>
                        </li>
                    ))}
                </ol>
            </Card>

            {/* ===== 02 合作廠家 ===== */}
            <Card id="vendors">
                <SectionHeader
                    index="02 · Vendors"
                    title={`合作廠家（${VENDORS.length} 家）`}
                    lead="點廠家名稱會開啟該廠家在 MorphMarket 上的在售球蟒，挑好後把個體連結私訊給我們。"
                />
                {anyAppendix && (
                    <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                        標有「附錄」的廠家以清單形式販售，請點附錄查看清單。
                    </p>
                )}
                {/* 純文字清單、照字母由上往下排（CSS columns），比一格一格的方框好掃讀 */}
                <ul className="columns-1 sm:columns-2 lg:columns-3 gap-x-10 border-t border-concrete-200 sm:border-t-0">
                    {SORTED_VENDORS.map(v => (
                        <li key={v.id} className="break-inside-avoid flex items-center gap-3 border-b border-concrete-100">
                            <a
                                href={v.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex-1 min-w-0 flex items-center justify-between gap-3 py-3"
                            >
                                <span className="text-[15px] font-medium text-concrete-900 group-hover:text-urban-green transition-colors">{v.name}</span>
                                <ArrowUpRight size={15} className="flex-shrink-0 text-concrete-300 group-hover:text-urban-green transition-colors" />
                            </a>
                            {hasAppendix(v) && (
                                <Link
                                    to={`/vendor/${v.id}/appendix`}
                                    className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-urban-green/10 text-xs font-medium text-urban-green hover:bg-urban-green/20"
                                >
                                    <FileText size={13} /> 附錄
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>

            {/* ===== CTA ===== */}
            <section id="contact" className="scroll-mt-24 bg-concrete-900 text-white rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8 items-center">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 mb-2">Contact</p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">挑好了？把連結傳給我們</h2>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                        私訊個體的 MorphMarket 連結，我們確認台幣價格與細節後回覆你。
                    </p>
                    <p className="text-white/50 text-xs mt-4">
                        付款下單即視為同意
                        <Link to="/import-terms" className="underline hover:text-white">《迷蟒海外進口代購交易細則》</Link>
                    </p>
                </div>
                <ContactButtons showHint />
            </section>
        </div>
    </div>
);

export default ImportServicePage;
