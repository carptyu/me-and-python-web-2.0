import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search, ChevronLeft } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
  canGoBack: boolean;
  onGoBack: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, canGoBack, onGoBack }) => {
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
    { name: '線上選購', id: 'shop' },
    { name: '飼養日誌', id: 'blog' },
    { name: '品牌理念', id: 'about' },
  ];

  const handleNav = (pageId: string) => {
    setPage(pageId);
    setIsOpen(false);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${
          scrolled 
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
                   onClick={onGoBack}
                   className="w-8 h-8 flex items-center justify-center rounded-full bg-concrete-100 hover:bg-concrete-200 text-concrete-900 transition-colors"
                   aria-label="Go Back"
                 >
                   <ChevronLeft size={20} />
                 </button>
              </div>

              {/* Logo / Home */}
              <div className="flex-shrink-0 cursor-pointer group" onClick={() => handleNav('home')}>
                <div className="flex flex-col leading-none">
                  <span className={`text-xl md:text-2xl font-bold tracking-widest transition-colors ${scrolled || isOpen ? 'text-concrete-900' : 'text-concrete-900 md:text-concrete-800'}`}>
                    迷蟒
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-urban-green group-hover:tracking-[0.25em] transition-all duration-500">
                    ME&PYTHON
                  </span>
                </div>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNav(link.id)}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentPage === link.id
                      ? 'text-urban-green'
                      : 'text-concrete-500 hover:text-concrete-900'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Search/Cart Placeholder or CTA */}
            <div className="hidden md:flex items-center gap-5">
               <button onClick={() => handleNav('maintenance')} className="text-concrete-400 hover:text-concrete-900 transition-colors">
                 <Search size={18} />
               </button>
               <button onClick={() => handleNav('maintenance')} className="text-concrete-900 hover:text-urban-green transition-colors relative">
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
        className={`fixed inset-0 bg-white z-30 transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden flex flex-col justify-center px-8`}
      >
          <div className="flex flex-col space-y-8">
            <button 
              onClick={() => handleNav('home')}
              className="text-4xl font-bold text-concrete-900 text-left hover:text-urban-green transition-colors"
            >
              首頁
            </button>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNav(link.id)}
                className="text-4xl font-bold text-concrete-400 text-left hover:text-concrete-900 transition-colors"
              >
                {link.name}
              </button>
            ))}
            <button 
              onClick={() => handleNav('maintenance')}
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