import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, ChevronLeft } from 'lucide-react';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const navLinks = [
        { name: '線上選購', path: '/shop' },
        { name: '飼養日誌', path: '/blog' },
        { name: '品牌理念', path: '/about' },
    ];

    const handleNav = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    // Determine if we can go back
    const canGoBack = window.history.length > 1;

    // Check if current page matches a path
    const isCurrentPage = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <nav
                className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${scrolled
                        ? 'bg-white/80 backdrop-blur-md border-concrete-200 shadow-sm'
                        : 'bg-white/0 border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Left Section: Back Button + Logo */}
                        <div className="flex items-center gap-2 md:gap-4 z-50">

                            {/* Global Back Button - Only shows if history > 1 */}
                            <div className={`transition-all duration-300 ${canGoBack ? 'opacity-100 translate-x-0 w-8' : 'opacity-0 -translate-x-4 w-0 pointer-events-none'}`}>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-concrete-100 hover:bg-concrete-200 text-concrete-900 transition-colors"
                                    aria-label="Go Back"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            </div>

                            {/* Logo / Home */}
                            <Link to="/" className="flex-shrink-0 cursor-pointer group">
                                <div className="flex flex-col leading-none">
                                    <span className={`text-xl md:text-2xl font-bold tracking-widest transition-colors ${scrolled || isOpen ? 'text-concrete-900' : 'text-concrete-900 md:text-concrete-800'}`}>
                                        迷蟒
                                    </span>
                                    <span className="text-[10px] font-bold tracking-[0.2em] text-urban-green group-hover:tracking-[0.25em] transition-all duration-500">
                                        ME&PYTHON
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors duration-300 ${isCurrentPage(link.path)
                                            ? 'text-urban-green'
                                            : 'text-concrete-500 hover:text-concrete-900'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Search/Cart Placeholder or CTA */}
                        <div className="hidden md:flex items-center gap-5">
                            <button onClick={() => navigate('/maintenance')} className="text-concrete-400 hover:text-concrete-900 transition-colors">
                                <Search size={18} />
                            </button>
                            <button onClick={() => navigate('/maintenance')} className="text-concrete-900 hover:text-urban-green transition-colors relative">
                                <ShoppingBag size={18} />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center z-50">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-concrete-900 p-2 focus:outline-none"
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
                    } md:hidden flex flex-col justify-center px-8`}
            >
                <div className="flex flex-col space-y-8">
                    <button
                        onClick={() => handleNav('/')}
                        className="text-4xl font-bold text-concrete-900 text-left hover:text-urban-green transition-colors"
                    >
                        首頁
                    </button>
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleNav(link.path)}
                            className="text-4xl font-bold text-concrete-400 text-left hover:text-concrete-900 transition-colors"
                        >
                            {link.name}
                        </button>
                    ))}
                    <button
                        onClick={() => handleNav('/maintenance')}
                        className="text-4xl font-bold text-urban-green text-left mt-8 pt-8 border-t border-concrete-200"
                    >
                        購物車 / 結帳
                    </button>
                </div>
            </div>
        </>
    );
};

export default Navbar;
