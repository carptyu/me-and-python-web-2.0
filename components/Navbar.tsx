import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, ChevronLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { SCALESWAP_SHOP_URL } from '../constants';
import { CONTACTS } from './shared';

// 導覽只放實際有內容的頁面；飼養日誌、品牌理念等維修中頁面不放進來
const navLinks: { name: string; path: string; external?: boolean }[] = [
    { name: '進口代購', path: '/import-service' },
    { name: '基因檢測', path: '/genetic-test' },
    // 蛇隻上架已移至 ScaleSwap，站內 /shop 封存於 archive/shop-2026-07/
    { name: '線上選購', path: SCALESWAP_SHOP_URL, external: true },
];

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    const handleNav = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // 首頁不需要返回鍵；其他頁從 IG / LINE 內建瀏覽器點進來時方便回上一頁
    const showBack = location.pathname !== '/' && window.history.length > 1;

    // 首頁頂端疊在深色蛇 Hero 上：還沒捲動、選單沒開時改用白字版
    const onDarkHero = location.pathname === '/' && !scrolled && !isOpen;

    const isCurrentPage = (path: string) => location.pathname.startsWith(path);
    // 代購細則與廠家附錄都算在「進口代購」底下
    const isActive = (path: string) =>
        isCurrentPage(path) ||
        (path === '/import-service' && (isCurrentPage('/import-terms') || isCurrentPage('/vendor/')));

    return (
        <>
            <nav
                data-snake-ignore
                className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${scrolled || isOpen
                    ? 'bg-white/90 backdrop-blur-md border-concrete-200 shadow-sm'
                    : 'bg-white/0 border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Left Section: Back Button + Logo */}
                        <div className="flex items-center gap-2 md:gap-4 z-50">
                            {showBack && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-concrete-100 hover:bg-concrete-200 text-concrete-900 transition-colors"
                                    aria-label="返回上一頁"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <Link to="/" className="flex-shrink-0 cursor-pointer group" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <img
                                        src="/logo.svg"
                                        alt="Me&Python Logo"
                                        className={`h-8 md:h-10 w-auto transition duration-300 group-hover:scale-105 ${onDarkHero ? 'brightness-0 invert' : ''}`}
                                    />
                                    <div className="flex flex-col leading-none">
                                        <span className={`text-xl md:text-2xl font-bold tracking-widest transition-colors ${onDarkHero ? 'text-white' : 'text-concrete-900'}`}>迷蟒</span>
                                        <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${onDarkHero ? 'text-[#a9c2ad]' : 'text-urban-green'}`}>ME&PYTHON</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map(link =>
                                link.external ? (
                                    <a
                                        key={link.name}
                                        href={link.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-0.5 text-sm font-medium transition-colors ${onDarkHero ? 'text-white/70 hover:text-white' : 'text-zinc-600 hover:text-concrete-900'}`}
                                    >
                                        {link.name}
                                        <ArrowUpRight size={14} />
                                    </a>
                                ) : (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'text-urban-green'
                                            : onDarkHero
                                                ? 'text-white/70 hover:text-white'
                                                : 'text-zinc-600 hover:text-concrete-900'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            )}
                        </div>

                        <div className="hidden md:flex items-center">
                            <Link
                                to="/#contact"
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${onDarkHero ? 'bg-white text-concrete-900 hover:bg-concrete-100' : 'bg-concrete-900 text-white hover:bg-concrete-800'}`}
                            >
                                <MessageCircle size={16} />
                                聯絡我們
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center z-50">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`p-2 focus:outline-none transition-colors ${onDarkHero ? 'text-white' : 'text-concrete-900'}`}
                                aria-label={isOpen ? '關閉選單' : '開啟選單'}
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu Overlay (Full Screen) */}
            <div
                className={`fixed inset-0 bg-white z-30 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } md:hidden flex flex-col pt-24 pb-10 px-8 overflow-y-auto`}
            >
                <div className="flex flex-col gap-6">
                    <button
                        onClick={() => handleNav('/')}
                        className={`text-3xl font-bold text-left transition-colors ${location.pathname === '/' ? 'text-urban-green' : 'text-concrete-900'}`}
                    >
                        首頁
                    </button>
                    {navLinks.map(link =>
                        link.external ? (
                            <a
                                key={link.name}
                                href={link.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 text-3xl font-bold text-concrete-900"
                            >
                                {link.name}
                                <ArrowUpRight size={24} className="text-concrete-400" />
                            </a>
                        ) : (
                            <button
                                key={link.name}
                                onClick={() => handleNav(link.path)}
                                className={`text-3xl font-bold text-left transition-colors ${isActive(link.path) ? 'text-urban-green' : 'text-concrete-900'}`}
                            >
                                {link.name}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => handleNav('/import-terms')}
                        className="text-lg font-medium text-left text-zinc-600"
                    >
                        代購交易細則
                    </button>
                </div>

                <div className="mt-auto pt-10">
                    <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-concrete-400 mb-3">聯絡我們</p>
                    <div className="flex gap-3">
                        {CONTACTS.map(c => (
                            <a
                                key={c.key}
                                href={c.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={c.label}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${c.className}`}
                            >
                                <c.icon size={22} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
