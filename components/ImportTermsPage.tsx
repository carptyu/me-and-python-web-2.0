import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TERMS_INTRO, TERMS_SECTIONS, TERMS_VERSION, TermsItem } from '../importTermsData';

const ItemList = ({ items }: { items: TermsItem[] }) => (
    <ul className="list-disc pl-5 space-y-2 text-zinc-600 leading-relaxed marker:text-urban-green">
        {items.map((item, i) => (
            <li key={i}>
                {item.lead && (
                    <span className="font-bold text-concrete-900">
                        {item.lead}
                        {item.text ? '：' : ''}
                    </span>
                )}
                {item.text}
            </li>
        ))}
    </ul>
);

// /import-terms#doa 這類錨點跳轉由 ScrollManager 處理
const ImportTermsPage: React.FC = () => {
    return (
        <div className="pt-24 pb-20 bg-concrete-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <Link
                    to="/import-service"
                    className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-concrete-900 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} /> 返回進口代購服務
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-concrete-900 mb-2">海外進口代購交易細則</h1>
                <p className="text-sm text-zinc-600 mb-8">迷蟒 Me&amp;Python ・ 版本日期 {TERMS_VERSION.replace(/-/g, '/')}</p>

                <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-concrete-200 space-y-10">
                    <p className="text-concrete-900 leading-relaxed bg-urban-green/10 border border-urban-green/20 rounded-xl p-4 md:p-5">
                        {TERMS_INTRO}
                    </p>

                    <nav aria-label="細則目錄" className="flex flex-wrap gap-2">
                        {TERMS_SECTIONS.map(s => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="text-sm px-3 py-1 rounded-full border border-concrete-200 text-zinc-600 hover:border-urban-green hover:text-urban-green transition-colors"
                            >
                                {s.no}、{s.title}
                            </a>
                        ))}
                    </nav>

                    {TERMS_SECTIONS.map(s => (
                        <section key={s.id} id={s.id} className="scroll-mt-24">
                            <h2 className="text-xl font-bold text-concrete-900 mb-4">
                                <a href={`#${s.id}`} className="hover:text-urban-green transition-colors">
                                    {s.no}、{s.title}
                                </a>
                            </h2>
                            {s.intro && <p className="text-zinc-600 leading-relaxed mb-3">{s.intro}</p>}
                            <ItemList items={s.items} />
                            {s.subsections?.map(sub => (
                                <div key={sub.title} className="mt-6">
                                    <h3 className="font-bold text-concrete-900 mb-3">{sub.title}</h3>
                                    <ItemList items={sub.items} />
                                </div>
                            ))}
                        </section>
                    ))}

                    <p className="border-t border-concrete-200 pt-6 text-concrete-900 font-bold">
                        付款下單即視為同意本細則全部內容。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImportTermsPage;
