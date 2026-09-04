import React, { useMemo, useState } from 'react';
import { BadgePercent, Check, Copy, RotateCcw } from 'lucide-react';
import {
    ALL_GENE_GROUPS,
    MULTI_PANEL_COVERAGE,
    RECESSIVE_PANEL_COVERAGE,
    MINI_PANEL_GROUPS,
    GENETIC_TEST_PRICING as P,
    OPENING_PROMO,
    promoDiscount,
    singleTestPrice,
    GeneGroup,
} from '../geneticTestData';

type PlanId = 'single' | 'multi' | 'recessive' | 'mini';

const twd = (n: number) => `NT$${Math.round(n).toLocaleString('en-US')}`;

const MULTI = new Set(MULTI_PANEL_COVERAGE);
const RECESSIVE = new Set(RECESSIVE_PANEL_COVERAGE);
const MINI_BY_GROUP = new Map(MINI_PANEL_GROUPS.map(m => [m.groupId, new Set(m.genes)]));
const MINI_GROUP_OF = new Map<string, string>();
MINI_PANEL_GROUPS.forEach(m => m.genes.forEach(g => MINI_GROUP_OF.set(g, m.groupId)));
const GROUP_NAME = new Map(ALL_GENE_GROUPS.map(g => [g.id, g.name]));
const TOTAL_GENES = ALL_GENE_GROUPS.reduce((sum, g) => sum + g.genes.length, 0);

const PLAN_NAME: Record<PlanId, string> = {
    single: '自選基因',
    multi: '全驗',
    recessive: '隱性全套',
    mini: '迷你套組',
};

/* ---------- 價格（原價／優惠價） ---------- */

/** 自選 n 個基因：原價與優惠後 */
const singleQuote = (n: number) => {
    const original = singleTestPrice(n);
    return { original, discount: promoDiscount(n), total: original - promoDiscount(n) };
};
/** 固定價套組（一組算一個計費單位） */
const panelQuote = (price: number) => ({ original: price, discount: promoDiscount(1), total: price - promoDiscount(1) });
/** 迷你套組 k 群 */
const miniQuote = (k: number) => {
    const original = P.miniPanelPerGroup * k;
    return { original, discount: promoDiscount(k), total: original - promoDiscount(k) };
};

const NET_FIRST = P.singleFirst - promoDiscount(1);
const NET_ADDITIONAL = P.singleAdditional - promoDiscount(1);

const PLANS: { id: PlanId; english: string; original: number; net: number; unit?: string; blurb: string; featured?: boolean }[] = [
    {
        id: 'single',
        english: 'Single Morph Test',
        original: P.singleFirst,
        net: NET_FIRST,
        unit: '起',
        blurb: OPENING_PROMO.active
            ? `第 2 個起每個 +${twd(NET_ADDITIONAL)}（原 +${twd(P.singleAdditional)}）`
            : `第 2 個起每個 +${twd(P.singleAdditional)}`,
    },
    {
        id: 'multi',
        english: 'Multi-Morph Panel',
        original: P.multiPanel,
        net: panelQuote(P.multiPanel).total,
        blurb: `固定 ${MULTI.size} 個基因`,
        featured: true,
    },
    {
        id: 'recessive',
        english: 'All Recessive Panel',
        original: P.recessivePanel,
        net: panelQuote(P.recessivePanel).total,
        blurb: `固定 ${RECESSIVE.size} 個隱性基因`,
    },
    {
        id: 'mini',
        english: 'Mini-Morph Panel',
        original: P.miniPanelPerGroup,
        net: miniQuote(1).total,
        blurb: `每群計費・${MINI_PANEL_GROUPS.length} 個等位基因群可選`,
    },
];

type Suggestion = { plan: Exclude<PlanId, 'single'>; price: number; groups: string[] };

/** 找出能完整涵蓋這些基因、而且最便宜的套組（用優惠後價格比較）；沒有任何套組涵蓋就回 null */
function cheapestPanelFor(genes: string[]): Suggestion | null {
    if (genes.length === 0) return null;
    const options: Suggestion[] = [];
    if (genes.every(g => RECESSIVE.has(g))) options.push({ plan: 'recessive', price: panelQuote(P.recessivePanel).total, groups: [] });
    if (genes.every(g => MULTI.has(g))) options.push({ plan: 'multi', price: panelQuote(P.multiPanel).total, groups: [] });
    const miniGroups = genes.map(g => MINI_GROUP_OF.get(g));
    if (miniGroups.every((g): g is string => !!g)) {
        const groups = Array.from(new Set(miniGroups));
        options.push({ plan: 'mini', price: miniQuote(groups.length).total, groups });
    }
    if (options.length === 0) return null;
    return options.reduce((best, o) => (o.price < best.price ? o : best));
}

type ChipState = 'selected' | 'available' | 'excluded';

const CHIP_STYLE: Record<ChipState, string> = {
    selected: 'bg-urban-green text-white border-urban-green',
    available: 'bg-white text-concrete-800 border-concrete-200 hover:border-urban-green/60',
    excluded: 'bg-concrete-100 text-concrete-400 border-concrete-200 line-through decoration-concrete-300',
};

const GeneticTestCalculator: React.FC = () => {
    const [plan, setPlan] = useState<PlanId>('multi');
    const [genes, setGenes] = useState<string[]>([]);
    const [miniGroups, setMiniGroups] = useState<string[]>([]);
    const [autoNote, setAutoNote] = useState<{ count: number; single: number; plan: PlanId; price: number } | null>(null);
    const [autoDismissed, setAutoDismissed] = useState(false);
    const [copied, setCopied] = useState(false);

    const choosePlan = (id: PlanId) => {
        setPlan(id);
        setAutoNote(null);
    };

    const applySuggestion = (s: Suggestion) => {
        setPlan(s.plan);
        if (s.plan === 'mini') setMiniGroups(s.groups);
        setAutoNote(null);
    };

    const toggleGene = (en: string) => {
        const next = genes.includes(en) ? genes.filter(g => g !== en) : [...genes, en];
        setGenes(next);
        if (next.length === 0) {
            setAutoDismissed(false);
            return;
        }
        if (autoDismissed) return;
        const s = cheapestPanelFor(next);
        const single = singleQuote(next.length).total;
        if (s && single >= s.price) {
            setPlan(s.plan);
            if (s.plan === 'mini') setMiniGroups(s.groups);
            setAutoNote({ count: next.length, single, plan: s.plan, price: s.price });
        }
    };

    const clearGenes = () => {
        setGenes([]);
        setAutoDismissed(false);
    };

    const backToSingle = () => {
        setPlan('single');
        setAutoNote(null);
        setAutoDismissed(true);
    };

    const toggleMiniGroup = (id: string) =>
        setMiniGroups(miniGroups.includes(id) ? miniGroups.filter(g => g !== id) : [...miniGroups, id]);

    const suggestion = useMemo(() => cheapestPanelFor(genes), [genes]);
    const singleNet = singleQuote(genes.length).total;
    const passiveHint = plan === 'single' && autoDismissed && suggestion && singleNet >= suggestion.price ? suggestion : null;

    const quote =
        plan === 'single' ? singleQuote(genes.length)
            : plan === 'multi' ? panelQuote(P.multiPanel)
                : plan === 'recessive' ? panelQuote(P.recessivePanel)
                    : miniQuote(miniGroups.length);
    const { original, discount, total } = quote;

    const hint =
        plan === 'single'
            ? genes.length > 0
                ? `${twd(NET_FIRST)} + ${twd(NET_ADDITIONAL)} × ${genes.length - 1}`
                : '尚未選擇基因'
            : plan === 'mini'
                ? miniGroups.length > 0
                    ? `${twd(miniQuote(1).total)} × ${miniGroups.length} 群`
                    : '尚未選擇等位基因群'
                : plan === 'multi'
                    ? `固定價，涵蓋 ${MULTI.size} 個基因`
                    : `固定價，涵蓋 ${RECESSIVE.size} 個隱性基因`;

    const instruction =
        plan === 'single'
            ? '點選想驗的基因，可複選。'
            : plan === 'multi'
                ? `綠色是全驗會驗的 ${MULTI.size} 個基因；灰色劃掉的 ${TOTAL_GENES - MULTI.size} 個不在全驗範圍內，需要的話改用自選加驗。`
                : plan === 'recessive'
                    ? `綠色是隱性全套會驗的 ${RECESSIVE.size} 個基因；其他基因不在此方案內。`
                    : '點基因或群名會選取整群，同群一起驗，可選多群。灰色的群沒有迷你套組。';

    const summary = (() => {
        const head =
            plan === 'single'
                ? `【基因檢測詢問】RGI 自選基因 Single Morph Test\n選擇 ${genes.length} 個基因：${genes.join('、')}`
                : plan === 'multi'
                    ? `【基因檢測詢問】RGI 全驗 Multi-Morph Panel\n涵蓋 ${MULTI.size} 個基因`
                    : plan === 'recessive'
                        ? `【基因檢測詢問】RGI 隱性全套 All Recessive Panel\n涵蓋 ${RECESSIVE.size} 個隱性基因`
                        : `【基因檢測詢問】RGI 迷你套組 Mini-Morph Panel\n選擇 ${miniGroups.length} 群：${miniGroups.map(id => GROUP_NAME.get(id)).join('、')}`;
        const price = discount > 0
            ? `原價：${twd(original)}\n${OPENING_PROMO.name}：-${twd(discount)}\n試算金額：${twd(total)}`
            : `試算金額：${twd(total)}`;
        return `${head}\n${price}`;
    })();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const chipState = (en: string, groupId: string): ChipState => {
        switch (plan) {
            case 'single':
                return genes.includes(en) ? 'selected' : 'available';
            case 'multi':
                return MULTI.has(en) ? 'selected' : 'excluded';
            case 'recessive':
                return RECESSIVE.has(en) ? 'selected' : 'excluded';
            case 'mini': {
                const cov = MINI_BY_GROUP.get(groupId);
                if (!cov || !cov.has(en)) return 'excluded';
                return miniGroups.includes(groupId) ? 'selected' : 'available';
            }
        }
    };

    const groupMeta = (group: GeneGroup): string => {
        const n = group.genes.length;
        if (plan === 'single') {
            const k = group.genes.filter(g => genes.includes(g)).length;
            return k > 0 ? `已選 ${k}／${n}` : `${n} 個`;
        }
        if (plan === 'mini') {
            const cov = MINI_BY_GROUP.get(group.id);
            if (!cov) return '無迷你套組';
            return miniGroups.includes(group.id)
                ? `已選整群・${cov.size} 個`
                : `整群 ${cov.size} 個・${twd(miniQuote(1).total)}`;
        }
        const cov = plan === 'multi' ? MULTI : RECESSIVE;
        const k = group.genes.filter(g => cov.has(g)).length;
        return k === 0 ? '不在方案內' : k === n ? `全部 ${n} 個都驗` : `驗 ${k}／${n} 個`;
    };

    const selectable = plan === 'single' || plan === 'mini';

    return (
        <div>
            {/* 開幕優惠 */}
            {OPENING_PROMO.active && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 md:p-5">
                    <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                        <BadgePercent size={18} />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-700 mb-0.5">Opening sale</p>
                        <p className="font-bold text-amber-900">
                            {OPENING_PROMO.name}：每個檢測項目折 {twd(OPENING_PROMO.perItem)}
                        </p>
                        <p className="text-sm text-amber-900/80 leading-relaxed mt-0.5">
                            自選基因每個基因各折 {twd(OPENING_PROMO.perItem)}，全驗與隱性全套每組折 {twd(OPENING_PROMO.perItem)}，
                            迷你套組每群折 {twd(OPENING_PROMO.perItem)}。下方價格都已是優惠價，原價劃線顯示。
                        </p>
                    </div>
                </div>
            )}

            {/* 方案選擇 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                {PLANS.map(p => {
                    const active = plan === p.id;
                    const discounted = p.net !== p.original;
                    return (
                        <button
                            key={p.id}
                            onClick={() => choosePlan(p.id)}
                            aria-pressed={active}
                            className={`text-left rounded-xl border p-4 transition-colors ${active
                                ? 'border-urban-green bg-urban-green/10 ring-1 ring-urban-green'
                                : 'border-concrete-200 bg-white hover:border-urban-green/50'
                                }`}
                        >
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="font-bold text-concrete-900">{PLAN_NAME[p.id]}</span>
                                {p.featured && (
                                    <span className="text-[10px] font-bold text-urban-green bg-urban-green/15 px-2 py-0.5 rounded-full">
                                        最推薦
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] uppercase tracking-wider text-concrete-400 mb-2">{p.english}</p>
                            {discounted && (
                                <p className="text-xs text-concrete-400 line-through leading-tight">{twd(p.original)}</p>
                            )}
                            <p className="text-lg font-bold text-urban-green leading-tight">
                                {twd(p.net)}
                                {p.unit && <span className="text-[11px] font-normal text-concrete-400 ml-1">{p.unit}</span>}
                            </p>
                            <p className="text-[11px] text-concrete-400 mt-1">{p.blurb}</p>
                        </button>
                    );
                })}
            </div>

            {/* 自動切換提示 */}
            {autoNote && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-urban-green/10 border border-urban-green/20 rounded-xl p-4">
                    <p className="text-sm text-concrete-900 leading-relaxed flex-1">
                        你選的 {autoNote.count} 個基因用自選要 {twd(autoNote.single)}，已達
                        <span className="font-bold"> {PLAN_NAME[autoNote.plan]} </span>
                        的 {twd(autoNote.price)}，而且全部都在範圍內，已自動幫你切換。
                        {autoNote.plan === 'multi' && ` 多驗 ${MULTI.size - autoNote.count} 個基因不加價。`}
                        {autoNote.plan === 'recessive' && ` 多驗 ${RECESSIVE.size - autoNote.count} 個基因不加價。`}
                    </p>
                    <button
                        onClick={backToSingle}
                        className="flex items-center gap-1.5 text-xs text-concrete-900 underline whitespace-nowrap self-start sm:self-auto"
                    >
                        <RotateCcw size={13} />
                        改回自選
                    </button>
                </div>
            )}
            {passiveHint && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-concrete-100 border border-concrete-200 rounded-xl p-4">
                    <p className="text-sm text-concrete-900 flex-1">
                        提示：這 {genes.length} 個基因改用 {PLAN_NAME[passiveHint.plan]} 只要 {twd(passiveHint.price)}。
                    </p>
                    <button
                        onClick={() => applySuggestion(passiveHint)}
                        className="text-xs text-concrete-900 underline whitespace-nowrap self-start sm:self-auto"
                    >
                        切換成{PLAN_NAME[passiveHint.plan]}
                    </button>
                </div>
            )}

            {/* 說明與圖例 */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <p className="text-sm text-concrete-800">{instruction}</p>
                <div className="flex items-center gap-3 text-[11px] text-concrete-400 flex-shrink-0 flex-wrap">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-urban-green" />
                        {selectable ? '已選' : '方案會驗'}
                    </span>
                    {selectable && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-white border border-concrete-300" />
                            可選
                        </span>
                    )}
                    {plan !== 'single' && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-concrete-200" />
                            不在方案內
                        </span>
                    )}
                    {plan === 'single' && genes.length > 0 && (
                        <button onClick={clearGenes} className="underline hover:text-concrete-900">
                            清除（已選 {genes.length}）
                        </button>
                    )}
                </div>
            </div>

            {/* 完整基因表 */}
            <div className="mt-3 rounded-xl border border-concrete-200 bg-concrete-50 p-4 md:p-5 space-y-5">
                {ALL_GENE_GROUPS.map(group => {
                    const miniAvailable = plan === 'mini' && MINI_BY_GROUP.has(group.id);
                    const miniOn = miniGroups.includes(group.id);
                    const title = (
                        <>
                            <span className="text-sm font-bold text-concrete-900">{group.name}</span>
                            <span className="text-xs text-concrete-400 ml-1.5">{group.englishName}</span>
                        </>
                    );
                    return (
                        <div key={group.id}>
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                {miniAvailable ? (
                                    <button
                                        onClick={() => toggleMiniGroup(group.id)}
                                        aria-pressed={miniOn}
                                        className="flex items-center gap-2 text-left"
                                    >
                                        <span
                                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${miniOn
                                                ? 'bg-urban-green border-urban-green text-white'
                                                : 'bg-white border-concrete-300'
                                                }`}
                                        >
                                            {miniOn && <Check size={11} strokeWidth={3} />}
                                        </span>
                                        <span>{title}</span>
                                    </button>
                                ) : (
                                    <p>{title}</p>
                                )}
                                <span className="text-[11px] text-concrete-400">{groupMeta(group)}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {group.genes.map(gene => {
                                    const state = chipState(gene, group.id);
                                    const cls = `text-xs px-2.5 py-1.5 rounded-md border transition-colors ${CHIP_STYLE[state]}`;
                                    if (plan === 'single') {
                                        return (
                                            <button key={gene} onClick={() => toggleGene(gene)} aria-pressed={state === 'selected'} className={cls}>
                                                {gene}
                                            </button>
                                        );
                                    }
                                    if (plan === 'mini' && state !== 'excluded') {
                                        return (
                                            <button key={gene} onClick={() => toggleMiniGroup(group.id)} aria-pressed={state === 'selected'} className={cls}>
                                                {gene}
                                            </button>
                                        );
                                    }
                                    return (
                                        <span key={gene} className={cls}>
                                            {gene}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 金額 */}
            <div className="mt-5 pt-4 border-t border-concrete-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-xs text-concrete-400 mb-0.5">試算金額・{PLAN_NAME[plan]}</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        {discount > 0 && <span className="text-lg text-concrete-400 line-through">{twd(original)}</span>}
                        <span className="text-2xl font-bold text-urban-green">{twd(total)}</span>
                        {discount > 0 && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                {OPENING_PROMO.name} −{twd(discount)}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-concrete-400 mt-1">{hint}</p>
                </div>
                <button
                    onClick={copy}
                    disabled={total === 0}
                    className="flex items-center justify-center gap-2 bg-concrete-900 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-concrete-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? '已複製，可直接私訊貼上' : '複製這份試算'}
                </button>
            </div>

            <p className="text-concrete-400 text-xs mt-3">
                * 試算金額僅供參考，不含國際運費與代收轉付，實際金額以私訊確認為準。
            </p>
        </div>
    );
};

export default GeneticTestCalculator;
