import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SCALESWAP_SHOP_URL } from '../constants';
import { CONTACTS, LineIcon } from './shared';

// 只列實際有內容的頁面；維修中的項目（飼養指南、品牌理念…）上線後再加回來
const Footer: React.FC = () => (
    <footer className="bg-white border-t border-concrete-200 pt-14 pb-10">
        <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr] gap-8 mb-12">
                <div className="col-span-2 md:col-span-1">
                    <Link to="/" className="inline-flex items-center gap-3">
                        <img src="/logo.svg" alt="" className="h-10 w-auto" />
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-bold tracking-widest text-concrete-900">迷蟒</span>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-urban-green">ME&PYTHON</span>
                        </div>
                    </Link>
                    <p className="text-sm text-zinc-600 mt-4">共同發掘 球蟒的無限可能</p>
                </div>
                <div>
                    <h4 className="font-bold text-concrete-900 mb-4">服務</h4>
                    <ul className="space-y-3 text-sm text-zinc-600">
                        <li><Link to="/import-service" className="hover:text-concrete-900 transition-colors">進口代購</Link></li>
                        <li><Link to="/genetic-test" className="hover:text-concrete-900 transition-colors">基因檢測</Link></li>
                        <li><Link to="/import-terms" className="hover:text-concrete-900 transition-colors">代購交易細則</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-concrete-900 mb-4">選購</h4>
                    <ul className="space-y-3 text-sm text-zinc-600">
                        <li>
                            <a href={SCALESWAP_SHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:text-concrete-900 transition-colors">
                                ScaleSwap 賣場 <ArrowUpRight size={14} />
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-concrete-900 mb-4">關注我們</h4>
                    <div className="flex gap-4 text-concrete-400">
                        {CONTACTS.map(c => (
                            <a
                                key={c.key}
                                href={c.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={c.label}
                                className="hover:text-urban-green transition-colors"
                            >
                                {c.key === 'line' ? <LineIcon size={24} withText /> : <c.icon size={24} />}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="pt-8 border-t border-concrete-200 text-sm text-concrete-400">
                © {new Date().getFullYear()} 迷蟒 Me&Python
            </div>
        </div>
    </footer>
);

export default Footer;
