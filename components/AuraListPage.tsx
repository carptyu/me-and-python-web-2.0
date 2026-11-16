import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, Search, X } from 'lucide-react';
import { AURA_LIST, AURA_LIST_UPDATED, AuraListItem } from '../auraListData';
import { VENDORS } from '../vendorsData';
import { ContactModal } from './shared';

// Aura 的現貨清單頁（/vendor/aurareptiles/appendix）。
// 資料來自 auraListData.ts；這頁只負責搜尋、篩選與呈現，價格一律顯示美元。

const AURA = VENDORS.find(v => v.id === 'aurareptiles');

const SEX_LABEL: Record<string, string> = { Male: '公', Female: '母' };
const MATURITY_LABEL: Record<string, string> = { Adult: '成體', Subadult: '亞成體', Juvenile: '幼體', Hatchling: '初生' };
const MATURITY_ORDER = ['Adult', 'Subadult', 'Juvenile', 'Hatchling'];
const QUICK_GENES = ['Clown', 'Pied', 'Ultramel', 'Desert Ghost', 'Lavender Albino', 'Lace', 'Zebra', 'Puzzle', 'Rust', 'Axanthic'];

type GeneKind = 'visual' | 'het' | 'poss';
const parseGene = (g: string): { kind: GeneKind; label: string; base: string } => {
    const het = /^(\d+)% Het (.+)$/.exec(g);
    if (het) return { kind: 'het', base: het[2], label: het[1] === '100' ? `het ${het[2]}` : `${het[1]}% het ${het[2]}` };
    const poss = /^Poss (.+)$/.exec(g);
    if (poss) return { kind: 'poss', base: poss[1], label: `poss ${poss[1]}` };
    return { kind: 'visual', base: g, label: g };
};

// 標籤配色照 MorphMarket：顏色代表遺傳類型，不是個別基因。
// 色碼取自 MorphMarket 個體頁的 Traits 標籤（2026-11 實測）：
//   顯性／共顯性 #CFEBFF 底 #015883 字、隱性表現型 #FFDCE2 底 #941745 字、het #FEDED7 底 #971E02 字。
//   50%／66% het（可能帶有）#FFF2B3 底 #3A3420 字。
// 「Poss X」在 MorphMarket 上的顏色沒有實際看到，這裡比照可能帶有用同一個黃色。
// class 要寫完整字串，Tailwind 才掃得到。
const TAG = {
    dominant: 'bg-[#CFEBFF] text-[#015883]',
    recessive: 'bg-[#FFDCE2] text-[#941745]',
    het: 'bg-[#FEDED7] text-[#971E02]',
    possible: 'bg-[#FFF2B3] text-[#3A3420]',
};

// 隱性基因名單直接從清單推出來：只要出現過「Het X」，X 就是隱性。
// 去掉括號裡的品系（VPI／TSK），讓 Axanthic 各線算同一個基因。
const geneKey = (base: string) => base.replace(/\s*\(.*\)$/, '');
const RECESSIVE = new Set(
    AURA_LIST.flatMap(i => i.genes)
        .map(g => /^\d+% Het (.+)$/.exec(g)?.[1])
        .filter((b): b is string => !!b)
        .map(geneKey),
);
const geneClass = (g: { base: string; kind: GeneKind; label: string }) => {
    if (g.kind === 'poss') return TAG.possible;
    if (g.kind === 'het') return /^\d/.test(g.label) ? TAG.possible : TAG.het; // 百分比開頭＝非 100% het
    return RECESSIVE.has(geneKey(g.base)) ? TAG.recessive : TAG.dominant;
};

const usd = (n: number) => `US$${n.toLocaleString('en-US')}`;
const born = (i: AuraListItem) => (i.dob ? i.dob.slice(0, 7) : i.clutch ? i.clutch.slice(0, 4) : '');
const inquiryText = (i: AuraListItem) => `Aura #${i.id}｜${SEX_LABEL[i.sex] ?? i.sex}｜${i.genes.join(', ')}｜${usd(i.price)}`;

const Segmented = <T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) => (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-concrete-200 bg-concrete-50 p-0.5">
        {options.map(o => (
            <button
                key={o.value}
                onClick={() => onChange(o.value)}
                aria-pressed={value === o.value}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${value === o.value ? 'bg-white text-concrete-900 font-bold shadow-sm' : 'text-zinc-600 hover:text-concrete-900'}`}
            >
                {o.label}
            </button>
        ))}
    </div>
);

const SexMark = ({ sex }: { sex: string }) => (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${sex === 'Male' ? 'text-sky-600' : sex === 'Female' ? 'text-rose-500' : 'text-zinc-600'}`}>
        <span aria-hidden>{sex === 'Male' ? '♂' : sex === 'Female' ? '♀' : '?'}</span>
        {SEX_LABEL[sex] ?? '未知'}
    </span>
);

const Row = ({ item, onAsk }: { item: AuraListItem; onAsk: (i: AuraListItem) => void }) => {
    const genes = item.genes.map(parseGene);
    return (
        <li className="grid grid-cols-[1fr_auto] md:grid-cols-[150px_minmax(0,1fr)_110px_auto] gap-x-4 gap-y-3 items-start md:items-center px-4 md:px-5 py-4 hover:bg-concrete-50 transition-colors">
            {/* 編號・性別・成熟度 */}
            <div className="flex md:block items-center gap-3 flex-wrap">
                <p className="font-mono text-sm font-bold text-concrete-900">#{item.id}</p>
                <p className="flex items-center gap-2 md:mt-1 text-sm text-zinc-600">
                    <SexMark sex={item.sex} />
                    <span>{MATURITY_LABEL[item.maturity] ?? item.maturity}</span>
                    {born(item) && <span className="text-concrete-400">{born(item)}</span>}
                </p>
            </div>

            {/* 價格（手機放右上） */}
            <p className="md:order-3 text-right text-lg font-bold text-concrete-900 tabular-nums">{usd(item.price)}</p>

            {/* 基因 */}
            <div className="col-span-2 md:col-span-1 md:order-2 flex flex-wrap gap-1.5">
                {genes.map(g => (
                    <span key={g.label} className={`px-2.5 py-0.5 rounded-full text-[13px] leading-5 font-medium ${geneClass(g)}`}>
                        {g.label}
                    </span>
                ))}
                {item.proven && <span className="px-2 py-0.5 rounded-md text-[13px] leading-5 bg-amber-100 text-amber-900">已有繁殖紀錄</span>}
            </div>

            <button
                onClick={() => onAsk(item)}
                className="col-span-2 md:col-span-1 md:order-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-concrete-200 bg-white text-sm font-medium text-concrete-900 hover:border-urban-green hover:text-urban-green transition-colors"
            >
                <MessageCircle size={15} /> 詢問這隻
            </button>
        </li>
    );
};

type Sort = 'id' | 'priceAsc' | 'priceDesc';

const AuraListPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [sex, setSex] = useState<'all' | 'Male' | 'Female'>('all');
    const [maturity, setMaturity] = useState<string>('all');
    const [sort, setSort] = useState<Sort>('id');
    const [asked, setAsked] = useState<AuraListItem | null>(null);
    const [copied, setCopied] = useState(false);

    const maturities = useMemo(() => MATURITY_ORDER.filter(m => AURA_LIST.some(i => i.maturity === m)), []);

    const results = useMemo(() => {
        const words = query.toLowerCase().split(/[\s,，]+/).filter(Boolean);
        const list = AURA_LIST.filter(i => {
            if (sex !== 'all' && i.sex !== sex) return false;
            if (maturity !== 'all' && i.maturity !== maturity) return false;
            if (!words.length) return true;
            const hay = `#${i.id} ${i.genes.join(' ')}`.toLowerCase();
            return words.every(w => hay.includes(w));
        });
        if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
        if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
        return list;
    }, [query, sex, maturity, sort]);

    const filtered = query !== '' || sex !== 'all' || maturity !== 'all';
    const reset = () => { setQuery(''); setSex('all'); setMaturity('all'); };

    const ask = async (item: AuraListItem) => {
        let ok = false;
        try {
            await navigator.clipboard.writeText(inquiryText(item));
            ok = true;
        } catch {
            ok = false;
        }
        setCopied(ok);
        setAsked(item);
    };

    const toggleQuick = (g: string) => {
        const has = query.toLowerCase().includes(g.toLowerCase());
        setQuery(has ? query.replace(new RegExp(g, 'i'), '').replace(/\s+/g, ' ').trim() : `${query} ${g}`.trim());
    };

    return (
        <div className="bg-concrete-50 pb-20 min-h-screen">
            <header className="bg-white border-b border-concrete-200 pt-28 md:pt-36 pb-10 md:pb-12">
                <div className="max-w-5xl mx-auto px-6">
                    <Link to="/import-service#vendors" className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-urban-green mb-6">
                        <ArrowLeft size={15} /> 返回合作廠家
                    </Link>
                    <div className="flex items-center gap-4">
                        {AURA?.logo && <img src={AURA.logo} alt="" width={64} height={64} className="w-16 h-16 rounded-xl object-cover bg-concrete-900 ring-1 ring-concrete-200" />}
                        <div>
                            <p className="text-urban-green font-bold text-[11px] tracking-[0.25em] uppercase mb-1">Availability list</p>
                            <h1 className="text-3xl md:text-5xl font-bold text-concrete-900 tracking-tight">Aura 現貨清單</h1>
                        </div>
                    </div>
                    <p className="text-zinc-600 leading-relaxed mt-5 max-w-2xl">
                        Aura 提供的在售球蟒清單，共 {AURA_LIST.length} 隻。看到喜歡的按「詢問這隻」，把編號傳給我們確認是否還在與台幣入手價。
                    </p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-zinc-600">
                        <span>清單更新於 {AURA_LIST_UPDATED}</span>
                        <span>價格為廠家美元售價</span>
                        <Link to="/import-service" className="text-urban-green font-medium hover:underline">計價方式</Link>
                        {AURA && (
                            <a href={AURA.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-urban-green font-medium hover:underline">
                                MorphMarket 頁面 <ArrowUpRight size={14} />
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-3 md:px-6 mt-6 md:mt-8">
                {/* ===== 搜尋與篩選 ===== */}
                <section className="bg-white rounded-2xl border border-concrete-200 p-4 md:p-5" aria-label="搜尋與篩選">
                    <div className="relative">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-concrete-400" aria-hidden />
                        <input
                            type="search"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="搜尋基因或編號，例如 clown pied"
                            aria-label="搜尋基因或編號"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-concrete-200 bg-concrete-50 text-concrete-900 placeholder:text-concrete-400 focus:outline-none focus:border-urban-green focus:bg-white"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {QUICK_GENES.map(g => {
                            const on = query.toLowerCase().includes(g.toLowerCase());
                            return (
                                <button
                                    key={g}
                                    onClick={() => toggleQuick(g)}
                                    aria-pressed={on}
                                    className={`px-2.5 py-1 rounded-full text-[13px] border transition-colors ${on ? 'bg-urban-green border-urban-green text-white' : 'bg-white border-concrete-200 text-zinc-600 hover:border-urban-green hover:text-urban-green'}`}
                                >
                                    {g}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-concrete-200">
                        <Segmented
                            label="性別"
                            value={sex}
                            onChange={setSex}
                            options={[{ value: 'all', label: '公母都看' }, { value: 'Male', label: '公' }, { value: 'Female', label: '母' }]}
                        />
                        <Segmented
                            label="成熟度"
                            value={maturity}
                            onChange={setMaturity}
                            options={[{ value: 'all', label: '全部' }, ...maturities.map(m => ({ value: m, label: MATURITY_LABEL[m] ?? m }))]}
                        />
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value as Sort)}
                            aria-label="排序"
                            className="ml-auto px-3 py-2 rounded-lg border border-concrete-200 bg-white text-sm text-concrete-900 focus:outline-none focus:border-urban-green"
                        >
                            <option value="id">依編號</option>
                            <option value="priceAsc">價格低到高</option>
                            <option value="priceDesc">價格高到低</option>
                        </select>
                    </div>
                </section>

                {/* ===== 結果 ===== */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 mt-5 mb-3">
                    <p className="text-sm text-zinc-600">
                        {filtered ? <>符合 <b className="text-concrete-900">{results.length}</b> 隻</> : <>共 <b className="text-concrete-900">{results.length}</b> 隻</>}
                        {filtered && (
                            <button onClick={reset} className="ml-3 inline-flex items-center gap-0.5 text-urban-green hover:underline">
                                <X size={13} /> 清除條件
                            </button>
                        )}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#CFEBFF] ring-1 ring-[#015883]/30" aria-hidden /> 顯性／共顯性</span>
                        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFDCE2] ring-1 ring-[#941745]/30" aria-hidden /> 隱性表現型</span>
                        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FEDED7] ring-1 ring-[#971E02]/30" aria-hidden /> 帶基因（het）</span>
                        <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFF2B3] ring-1 ring-[#3A3420]/30" aria-hidden /> 可能帶有（50%／66% het、poss）</span>
                    </p>
                </div>

                {results.length ? (
                    <ul className="bg-white rounded-2xl border border-concrete-200 divide-y divide-concrete-200 overflow-hidden">
                        {results.map(i => <Row key={i.id} item={i} onAsk={ask} />)}
                    </ul>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-concrete-200 p-12 text-center">
                        <p className="font-bold text-concrete-900">沒有符合條件的個體</p>
                        <p className="text-sm text-zinc-600 mt-1">換個關鍵字，或直接私訊告訴我們你想找的組合。</p>
                        <button onClick={reset} className="mt-4 px-4 py-2 rounded-lg bg-concrete-900 text-white text-sm font-medium hover:bg-concrete-800">
                            清除條件
                        </button>
                    </div>
                )}

                <p className="text-xs text-zinc-600 leading-relaxed mt-4 px-1">
                    清單為廠家提供當下的資料，個體可能已售出，實際以私訊確認為準。付款下單即視為同意
                    <Link to="/import-terms" className="text-urban-green hover:underline">《迷蟒海外進口代購交易細則》</Link>。
                </p>
            </div>

            <ContactModal
                open={!!asked}
                onClose={() => setAsked(null)}
                title={asked ? `詢問 Aura #${asked.id}` : ''}
                lead={
                    copied
                        ? '已複製這隻的編號與基因，選一個平台貼上傳給我們就可以了。'
                        : `選一個平台私訊我們，並告訴我們編號「Aura #${asked?.id ?? ''}」。`
                }
            />
            {asked && copied && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-concrete-900 text-white text-sm shadow-lg" role="status">
                    <Check size={15} className="text-urban-green" /> 已複製到剪貼簿
                </div>
            )}
        </div>
    );
};

export default AuraListPage;
