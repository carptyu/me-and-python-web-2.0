import React from 'react';
import {
    Dna,
    ShieldCheck,
    Search,
    ClipboardList,
    Scissors,
    Package,
    FlaskConical,
    FileCheck,
    Timer,
    Sun,
    Tag,
    Send,
    Clock,
    AlertTriangle,
    Check,
    X,
    Instagram,
    Facebook,
    BadgePercent,
    LucideIcon,
} from 'lucide-react';
import GeneticTestCalculator from './GeneticTestCalculator';
import { OPENING_PROMO } from '../geneticTestData';

const IG_URL = 'https://www.instagram.com/meandpython?igsh=MTRmemlhaTA0ZWoxYg%3D%3D&utm_source=qr';
const FB_URL = 'https://www.facebook.com/profile.php?id=61558807599321';
const LINE_URL = 'https://line.me/ti/g2/tagALcVDnwwtTiTojJGCnJf0bpmdzlv0stFjTg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default';

const LineIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22.28 12.33C22.28 6.78 17.29 2.26 11.14 2.26C4.99 2.26 0 6.78 0 12.33C0 16.68 2.89 20.44 7.04 21.84C7.31 21.96 7.48 22.13 7.54 22.42C7.6 22.75 7.56 23.16 7.53 23.47C7.53 23.47 7.42 24.1 7.4 24.17C7.36 24.36 7.28 24.64 7.55 24.68C7.82 24.72 8.11 24.58 8.35 24.4C8.6 24.22 12.28 21.65 13.8 20.57C18.8 20.3 22.28 16.66 22.28 12.33Z" fill="currentColor" />
    </svg>
);

type IconType = LucideIcon;

/* ------------------------------------------------------------------ */
/* 內容                                                                */
/* ------------------------------------------------------------------ */

const BENEFITS: { icon: IconType; title: string; body: string }[] = [
    { icon: Dna, title: '確認 het 帶基因', body: '不用靠試配碰運氣，直接驗出隱性基因帶不帶。' },
    { icon: ShieldCheck, title: '買賣有依據', body: '交易前後都拿得出檢測報告，減少血統認定的爭議。' },
    { icon: Search, title: '分辨相似基因', body: 'Yellow Belly、Asphalt、Gravel 這類外觀接近的等位基因，肉眼難分，檢測一次確認。' },
    { icon: ClipboardList, title: '繁殖規劃更準', body: '先確定手上蛇隻的基因組成，配對計畫才不會做白工。' },
];

const FLOW: { icon: IconType; title: string; body: string }[] = [
    { icon: Scissors, title: '準備蛇蛻', body: '依下方教學收集、晾乾、裝袋並標註。' },
    { icon: Package, title: '寄到本舍', body: '私訊索取寄件地址，把蛇蛻寄給我們。' },
    { icon: FlaskConical, title: '統一送檢美國', body: '收齊後統一寄往美國 RGI 實驗室。' },
    { icon: FileCheck, title: '結果轉交', body: '報告一回來，第一時間轉交給你。' },
];

const SHED_STEPS: { icon: IconType; title: string; body: string; tip?: string }[] = [
    {
        icon: Timer,
        title: '蛻皮後立刻收起來',
        body: '蛇一蛻完就把皮拿出來。泡過水盆、沾到尿酸或糞便的部分整段捨棄，不要拿來送驗。',
    },
    {
        icon: Sun,
        title: '攤開陰乾 1 至 2 天',
        body: '把蛇蛻攤開放在通風處陰乾至少 24 小時，摸起來完全酥脆才算乾。',
        tip: '沒乾透就密封會發霉，DNA 直接報銷。這是最常見的失敗原因，寧可多晾兩天。',
    },
    {
        icon: Scissors,
        title: '撕下乾淨的一片',
        body: '最少一枚十元硬幣大小，能給到掌心大小更保險。挑乾淨、完整、沒沾到墊材的部位。',
    },
    {
        icon: Package,
        title: '一隻蛇一個袋',
        body: '每隻蛇的蛇蛻分開裝進夾鏈袋。不同蛇的蛻絕對不能混在同一袋。',
    },
    {
        icon: Tag,
        title: '袋外寫清楚標籤',
        body: '每個夾鏈袋外面寫上三件事：蛇隻編號、已知基因、想檢驗的基因。',
    },
    {
        icon: Send,
        title: '寄到本舍',
        body: '私訊索取寄件地址。我們收齊後統一送件，並回報你送出的時間。',
        tip: '外袋要寫上你聯絡我們用的平台與帳號名稱（IG、FB 或 LINE 的顯示名稱都可以，不必本名），我們才對得上是誰寄的。',
    },
];

const CHECKLIST = [
    '蛇蛻完全乾燥，摸起來酥脆',
    '沒有沾到水、尿酸、糞便、墊材',
    '每隻蛇分開裝一個夾鏈袋',
    '袋外寫了蛇隻編號、已知基因、想檢驗的基因',
    '外袋寫了聯絡平台與帳號名稱',
    '已私訊確認方案與寄件地址',
];

const FAILS = [
    '沒乾透就密封，整袋發霉',
    '拿泡過水盆的蛇蛻來送驗',
    '多隻蛇的蛻混在同一袋',
];

const RESULT_TYPES: { label: string; zh: string; body: string; alleles: [boolean, boolean]; tone: string }[] = [
    {
        label: 'Negative',
        zh: '陰性',
        body: '沒有帶這個基因。',
        alleles: [false, false],
        tone: 'border-concrete-200 bg-concrete-50 text-concrete-400',
    },
    {
        label: 'Heterozygous',
        zh: '帶基因（het）',
        body: '帶一份。隱性基因外觀看不出來，但會遺傳給後代；顯性與共顯性基因則會直接表現。',
        alleles: [true, false],
        tone: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
        label: 'Homozygous',
        zh: '純合',
        body: '帶兩份。隱性基因會直接表現在外觀上；共顯性基因則是 super 型。',
        alleles: [true, true],
        tone: 'border-urban-green/30 bg-urban-green/10 text-urban-green',
    },
];

const ANCHORS = [
    { href: '#flow', label: '服務流程' },
    { href: '#shed', label: '蛇蛻準備' },
    { href: '#pricing', label: '方案與價格' },
    { href: '#results', label: '結果怎麼看' },
];

/* ------------------------------------------------------------------ */
/* 小元件                                                              */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ index, title, lead }: { index: string; title: string; lead?: string }) => (
    <div className="mb-8 md:mb-10">
        <p className="text-urban-green font-bold text-[11px] tracking-[0.25em] uppercase mb-2">{index}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-concrete-900 tracking-tight">{title}</h2>
        {lead && <p className="text-zinc-600 mt-3 max-w-2xl leading-relaxed">{lead}</p>}
    </div>
);

const Card = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={`scroll-mt-24 bg-white rounded-2xl border border-concrete-200 p-6 md:p-10 ${className}`}>
        {children}
    </section>
);

const AlleleDots = ({ alleles }: { alleles: [boolean, boolean] }) => (
    <div className="flex items-center gap-1.5" aria-hidden>
        {alleles.map((filled, i) => (
            <span
                key={i}
                className={`w-5 h-5 rounded-full border-2 border-current ${filled ? 'bg-current' : 'bg-transparent'}`}
            />
        ))}
    </div>
);

/* ------------------------------------------------------------------ */
/* 頁面                                                                */
/* ------------------------------------------------------------------ */

const GeneticTestPage: React.FC = () => (
    <div className="bg-concrete-50 pb-20">
        {/* ===== Hero ===== */}
        <header className="bg-white border-b border-concrete-200 pt-28 md:pt-36 pb-12 md:pb-16">
            <div className="max-w-5xl mx-auto px-6">
                <span className="inline-block text-urban-green font-bold text-xs tracking-[0.2em] uppercase bg-urban-green/10 px-3 py-1 rounded-full mb-5">
                    Genetic Testing · 代送美國
                </span>
                <h1 className="text-4xl md:text-6xl font-bold text-concrete-900 tracking-tight leading-[1.15] mb-5">
                    基因檢測服務
                </h1>
                <p className="text-xl md:text-2xl text-concrete-900 font-light leading-relaxed max-w-2xl">
                    一片蛇蛻，不抽血、不麻醉，<br className="hidden md:block" />
                    確認你的球蟒到底帶了哪些基因。
                </p>
                <p className="text-zinc-600 leading-relaxed max-w-2xl mt-4">
                    本舍代收台灣蛇友的蛇蛻，統一送往美國{' '}
                    <span className="font-medium text-concrete-900">RGI（Rare Genetics Inc.）</span> 檢測，結果一回來立即轉交。
                </p>

                {OPENING_PROMO.active && (
                    <a
                        href="#pricing"
                        className="inline-flex items-center gap-2 mt-6 rounded-full border border-amber-200 bg-amber-50 text-amber-900 pl-2 pr-4 py-1.5 text-sm hover:bg-amber-100 transition-colors"
                    >
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                            <BadgePercent size={14} />
                        </span>
                        <span className="font-bold">{OPENING_PROMO.name}中</span>
                        <span className="text-amber-900/80">每個檢測項目折 NT${OPENING_PROMO.perItem}</span>
                    </a>
                )}

                <nav className="flex flex-wrap gap-2 mt-5" aria-label="頁內導覽">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
                    {BENEFITS.map(b => (
                        <div key={b.title} className="bg-concrete-50 border border-concrete-200 rounded-xl p-5">
                            <div className="w-9 h-9 rounded-lg bg-urban-green/10 text-urban-green flex items-center justify-center mb-3">
                                <b.icon size={18} />
                            </div>
                            <p className="font-bold text-concrete-900 mb-1">{b.title}</p>
                            <p className="text-sm text-zinc-600 leading-relaxed">{b.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 space-y-6 md:space-y-8 mt-8 md:mt-10">
            {/* ===== 01 流程 ===== */}
            <Card id="flow">
                <SectionHeader index="01 · How it works" title="服務流程" lead="四個步驟，你只要準備蛇蛻，其餘交給我們。" />
                <ol className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
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

            {/* ===== 02 蛇蛻準備 ===== */}
            <Card id="shed">
                <SectionHeader
                    index="02 · Shed prep"
                    title="蛇蛻準備教學"
                    lead="檢測成敗有一半取決於蛇蛻品質。照著六個步驟做，就不會白跑一趟。"
                />
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-12 items-start">
                    <ol className="relative">
                        <span className="absolute left-5 top-3 bottom-3 w-px bg-concrete-200" aria-hidden />
                        {SHED_STEPS.map((s, i) => (
                            <li key={s.title} className="relative flex gap-5 pb-8 last:pb-0">
                                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-urban-green text-urban-green flex items-center justify-center">
                                    <s.icon size={18} />
                                </div>
                                <div className="min-w-0 pt-0.5">
                                    <p className="text-[11px] font-bold tracking-wider text-concrete-400 mb-0.5">STEP {i + 1}</p>
                                    <h3 className="text-lg font-bold text-concrete-900 leading-snug">{s.title}</h3>
                                    <p className="text-sm text-zinc-600 leading-relaxed mt-1.5">{s.body}</p>
                                    {s.tip && (
                                        <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2">
                                            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                                            <span>{s.tip}</span>
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <aside className="lg:sticky lg:top-24 bg-urban-green text-white rounded-2xl p-6">
                        <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/60 mb-1">Checklist</p>
                        <h3 className="text-lg font-bold mb-5">寄出前確認</h3>

                        <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-white/15">
                            <div className="bg-white/10 rounded-xl p-3 flex flex-col items-center text-center">
                                <span className="w-8 h-8 rounded-full border-2 border-dashed border-white/70 mb-2" aria-hidden />
                                <p className="text-[11px] text-white/60">最少</p>
                                <p className="text-sm font-bold leading-tight whitespace-nowrap">十元硬幣大小</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 flex flex-col items-center text-center">
                                <span className="w-12 h-8 rounded-lg border-2 border-white/90 bg-white/10 mb-2" aria-hidden />
                                <p className="text-[11px] text-white/60">建議</p>
                                <p className="text-sm font-bold leading-tight whitespace-nowrap">掌心大小</p>
                            </div>
                        </div>

                        <ul className="space-y-3">
                            {CHECKLIST.map(item => (
                                <li key={item} className="flex gap-2.5 text-sm leading-snug">
                                    <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                        <Check size={11} strokeWidth={3} />
                                    </span>
                                    <span className="text-white/90">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 pt-5 border-t border-white/15">
                            <p className="text-[11px] font-bold tracking-wider uppercase text-red-200 mb-3">常見失敗</p>
                            <ul className="space-y-2.5">
                                {FAILS.map(item => (
                                    <li key={item} className="flex gap-2.5 text-sm leading-snug">
                                        <span className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-red-300/25 text-red-200 flex items-center justify-center">
                                            <X size={11} strokeWidth={3} />
                                        </span>
                                        <span className="text-white/80">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </Card>

            {/* ===== 03 方案與價格 ===== */}
            <Card id="pricing">
                <SectionHeader
                    index="03 · Pricing"
                    title="方案與價格"
                    lead="先選方案，下方基因表會標出這個方案驗哪些、不驗哪些。自選基因勾到跟套組同價、而且都在套組範圍內時，會自動幫你換成套組。"
                />
                <GeneticTestCalculator />
            </Card>

            {/* ===== 04 結果怎麼看 ===== */}
            <Card id="results">
                <SectionHeader index="04 · Reading results" title="檢測結果怎麼看" lead="每個基因的報告都會落在這三種結果之一。" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {RESULT_TYPES.map(r => (
                        <div key={r.label} className={`rounded-xl border p-5 ${r.tone}`}>
                            <div className="flex items-center justify-between mb-5">
                                <AlleleDots alleles={r.alleles} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{r.label}</span>
                            </div>
                            <p className="text-lg font-bold text-concrete-900">{r.zh}</p>
                            <p className="text-sm text-zinc-600 leading-relaxed mt-1.5">{r.body}</p>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-concrete-400 mt-4">
                    圓點代表一對等位基因，實心表示帶有該基因。上面的說明以隱性基因為主。
                </p>
            </Card>

            {/* ===== 時程與注意事項 ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <section className="bg-white rounded-2xl border border-concrete-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-9 h-9 rounded-lg bg-concrete-100 text-concrete-900 flex items-center justify-center">
                            <Clock size={18} />
                        </span>
                        <h3 className="text-lg font-bold text-concrete-900">檢測時程</h3>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                        送件後的檢測時間由<span className="font-medium text-concrete-900">實驗室排程</span>決定，
                        旺季（繁殖季）通常會比較久，實驗室無法保證確切完成日期。結果一回來我們就會通知你。
                    </p>
                </section>
                <section className="bg-amber-50 rounded-2xl border border-amber-200 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                            <AlertTriangle size={18} />
                        </span>
                        <h3 className="text-lg font-bold text-amber-900">注意事項</h3>
                    </div>
                    <ul className="text-sm text-amber-900/90 leading-relaxed space-y-2">
                        {[
                            '本舍僅保證收取蛇蛻後安全寄達指定實驗室。',
                            '蛇蛻品質不佳導致檢測失敗，需重新送件並另計費用。',
                            '檢測結果一律以該實驗室判定為準。',
                        ].map(t => (
                            <li key={t} className="flex gap-2">
                                <span className="flex-shrink-0 mt-[9px] w-1 h-1 rounded-full bg-amber-700" aria-hidden />
                                <span>{t}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* ===== CTA ===== */}
            <section className="bg-concrete-900 text-white rounded-2xl p-8 md:p-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-8 items-center">
                <div>
                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50 mb-2">Contact</p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">想送檢或有問題？</h2>
                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                        私訊告訴我們蛇隻狀況和想檢測的基因，我們會回覆報價與寄件地址。
                        把上面的試算結果複製貼給我們，報價更快。
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <a
                        href={IG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                    >
                        <Instagram size={20} />
                        <span className="font-bold text-sm">Instagram</span>
                    </a>
                    <a
                        href={FB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-blue-600 text-white hover:opacity-90 transition-opacity"
                    >
                        <Facebook size={20} />
                        <span className="font-bold text-sm">Facebook</span>
                    </a>
                    <a
                        href={LINE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-[#06C755] text-white hover:opacity-90 transition-opacity"
                    >
                        <LineIcon size={20} />
                        <span className="font-bold text-sm">Line 群組</span>
                    </a>
                </div>
            </section>
        </div>
    </div>
);

export default GeneticTestPage;
