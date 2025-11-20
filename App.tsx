import React, { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import SnakeCard from './components/SnakeCard';

import { FEATURED_SNAKES, ARTICLES } from './constants';
import { Snake, Article } from './types';
import { ArrowRight, ChevronRight, Instagram, Twitter, Mail, MapPin, Construction, ArrowLeft, ZoomIn, ExternalLink, Loader2 } from 'lucide-react';
import { fetchSnakesFromContentful } from './services/contentfulService';
import Lightbox from './components/Lightbox';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-concrete-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-concrete-600 mb-4">我們無法正確顯示此頁面。這可能是因為資料格式錯誤。</p>
                        <div className="bg-concrete-100 p-4 rounded-lg overflow-auto text-xs font-mono text-concrete-700 mb-6 max-h-40">
                            {this.state.error?.toString()}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-concrete-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
                        >
                            重新整理頁面
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const App: React.FC = () => {
    // Navigation State
    const [history, setHistory] = useState<string[]>(['home']);
    const [currentPage, setCurrentPage] = useState('home');

    // Data State - Revised for Contentful
    const [snakes, setSnakes] = useState<Snake[]>([]);
    const [isLoadingSnakes, setIsLoadingSnakes] = useState(true);

    // Fetch Data from Contentful on Mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingSnakes(true);
            const cmsSnakes = await fetchSnakesFromContentful();

            if (cmsSnakes.length > 0) {
                setSnakes(cmsSnakes);
            } else {
                // Fallback to dummy data only if CMS is empty or failed (and not in production ideally)
                console.log("Using local fallback data");
                setSnakes(FEATURED_SNAKES);
            }
            setIsLoadingSnakes(false);
        };

        loadData();
    }, []);

    const [selectedSnake, setSelectedSnake] = useState<Snake | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Scroll Restoration Cache
    const scrollCache = useRef<{ [key: string]: number }>({});

    // Enhanced Navigation Handler
    const navigateTo = (page: string, data?: { snake?: Snake, article?: Article }) => {
        if (page === currentPage) return;

        scrollCache.current[currentPage] = window.scrollY;

        if (['snake-detail', 'article-detail', 'admin'].includes(page)) {
            scrollCache.current[page] = 0;
        }

        setHistory(prev => [...prev, page]);
        setCurrentPage(page);

        if (data?.snake) setSelectedSnake(data.snake);
        if (data?.article) setSelectedArticle(data.article);

        if (!['snake-detail', 'article-detail'].includes(page)) {
            setSelectedSnake(null);
            setSelectedArticle(null);
        }

        setTimeout(() => {
            if (scrollCache.current[page] !== undefined) {
                window.scrollTo({ top: scrollCache.current[page], behavior: 'auto' });
            } else {
                window.scrollTo({ top: 0, behavior: 'auto' });
            }
        }, 0);
    };

    const goBack = () => {
        if (history.length > 1) {
            scrollCache.current[currentPage] = window.scrollY;

            const newHistory = [...history];
            newHistory.pop();
            const previousPage = newHistory[newHistory.length - 1];

            setHistory(newHistory);
            setCurrentPage(previousPage);

            if (currentPage === 'snake-detail') setSelectedSnake(null);
            if (currentPage === 'article-detail') setSelectedArticle(null);

            setTimeout(() => {
                const savedScrollY = scrollCache.current[previousPage];
                if (savedScrollY !== undefined) {
                    window.scrollTo({ top: savedScrollY, behavior: 'auto' });
                } else {
                    window.scrollTo(0, 0);
                }
            }, 0);
        } else {
            setCurrentPage('home');
        }
    };

    // --- Lightbox Logic ---
    const openLightbox = (images: string[], index: number = 0) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setLightboxImages([]);
    };


    // --- Admin Actions ---


    const handleConstruction = () => navigateTo('maintenance');
    const handleViewDetails = (snake: Snake) => navigateTo('snake-detail', { snake });
    const handleViewArticle = (article: Article) => navigateTo('article-detail', { article });

    // --- Sub-Components ---

    // Admin Dashboard Component (Read-Only)
    const AdminDashboard = () => {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-concrete-900">後台管理系統</h1>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl border border-concrete-200 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-urban-green/10 p-4 rounded-full">
                            <ExternalLink size={48} className="text-urban-green" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-concrete-900 mb-4">
                        請前往 Contentful 官方網站進行管理
                    </h2>
                    <p className="text-concrete-500 mb-8 max-w-lg mx-auto">
                        為了確保資料的安全性與完整性，目前我們已將所有新增、編輯與刪除功能移至 Contentful 官方後台。
                    </p>

                    <a
                        href="https://app.contentful.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-concrete-900 text-white px-8 py-4 rounded-lg font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl"
                    >
                        前往 Contentful 登入 <ExternalLink size={18} />
                    </a>

                    <div className="mt-12 border-t border-concrete-100 pt-8">
                        <h3 className="text-lg font-bold text-concrete-900 mb-4">目前已上架商品預覽</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-concrete-50 text-xs uppercase text-concrete-500 font-bold">
                                    <tr>
                                        <th className="p-4">圖片</th>
                                        <th className="p-4">ID / 品系</th>
                                        <th className="p-4">價格</th>
                                        <th className="p-4">狀態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-concrete-100">
                                    {snakes.map(snake => (
                                        <tr key={snake.id} className="hover:bg-concrete-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-concrete-100">
                                                    <img src={snake.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-concrete-900">{snake.morph}</div>
                                                <div className="text-xs text-concrete-400 font-mono">{snake.id}</div>
                                            </td>
                                            <td className="p-4 font-mono text-concrete-600">
                                                ${snake.price.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${snake.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {snake.availability}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const MaintenanceView = () => (
        <div className="min-h-screen bg-concrete-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)'
                }}>
            </div>
            <div className="max-w-md w-full bg-white border-2 border-concrete-900 p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] relative z-10 animate-slide-up">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-concrete-900 px-4 py-1 font-bold text-xs tracking-widest uppercase border-2 border-concrete-900">
                    Under Construction
                </div>
                <div className="flex justify-center mb-6 text-concrete-800">
                    <Construction size={64} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-center text-concrete-900 mb-4">
                    棲息地建構中
                </h2>
                <p className="text-concrete-500 text-center mb-8 leading-relaxed">
                    我們的工程團隊正在為這個區域鋪設加溫墊與調整濕度。
                </p>
                <div className="space-y-3">
                    <button
                        onClick={goBack}
                        className="w-full bg-concrete-900 text-white font-bold py-3 flex items-center justify-center gap-2 hover:bg-concrete-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        撤退 (返回上一頁)
                    </button>
                    <button
                        onClick={() => navigateTo('home')}
                        className="w-full bg-white text-concrete-900 border-2 border-concrete-200 font-bold py-3 hover:bg-concrete-50 transition-colors"
                    >
                        回到首頁大廳
                    </button>
                </div>
            </div>
        </div>
    );

    const Hero = () => (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden bg-concrete-100">
            <div className="text-center px-6 max-w-4xl mx-auto z-10 animate-slide-up opacity-0 flex flex-col items-center" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-urban-green font-bold text-xs md:text-sm mb-4 tracking-[0.2em] uppercase bg-urban-green/10 px-3 py-1 rounded-full">Urban Jungle Collection</h2>
                <h1 className="text-4xl md:text-7xl lg:text-8xl font-bold text-concrete-900 mb-6 tracking-tight leading-[1.1]">
                    城市綠洲。<br className="hidden md:block" />
                    <span className="text-concrete-400">迷蟒陪伴。</span>
                </h1>
                <p className="text-lg md:text-2xl text-concrete-500 font-light max-w-2xl mx-auto mb-10">
                    在水泥叢林中，尋找屬於你的寧靜角落。Me&Python，來自頂尖基因庫的藝術品。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-6 sm:px-0">
                    <button
                        onClick={() => navigateTo('shop')}
                        className="bg-concrete-900 text-white rounded-lg px-8 py-4 text-sm font-medium hover:bg-concrete-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                        探索現貨
                    </button>
                    <button
                        onClick={() => navigateTo('about')}
                        className="bg-white text-concrete-900 border border-concrete-200 rounded-lg px-8 py-4 text-sm font-medium hover:bg-concrete-50 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        了解更多 <ChevronRight size={14} />
                    </button>
                </div>
            </div>
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]"></div>
            </div>
        </div>
    );

    const BentoGrid = () => (
        <div className="bg-white py-24 md:py-32 border-t border-concrete-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-concrete-900 mb-4">不只是爬蟲。</h2>
                    <p className="text-concrete-500 text-lg">更是現代居家美學的一部分。</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="md:col-span-2 lg:col-span-2 bg-concrete-100 rounded-2xl overflow-hidden h-[300px] md:h-[500px] relative group" onClick={handleConstruction}>
                        <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-end bg-gradient-to-t from-concrete-900/80 to-transparent cursor-pointer">
                            <p className="text-white/80 uppercase text-xs font-bold tracking-widest mb-2">GENETICS</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">極致的基因美學。</h3>
                        </div>
                        <img src="https://picsum.photos/seed/genetics1/1200/800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 grayscale-[30%]" />
                    </div>
                    <div className="bg-concrete-800 rounded-2xl overflow-hidden h-[300px] md:h-[500px] relative group">
                        <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-start items-center text-center">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-2">專業支援</h3>
                            <p className="text-concrete-300">24/7 全天候 AI 顧問。</p>
                        </div>
                        <img src="https://picsum.photos/seed/support/600/800" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-40 mix-blend-overlay" />
                    </div>
                    <div className="bg-concrete-50 border border-concrete-200 rounded-2xl p-8 flex flex-col justify-between group cursor-pointer hover:border-urban-green/50 transition-colors" onClick={handleConstruction}>
                        <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Instagram size={24} className="text-concrete-900" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-concrete-900">社群</h4>
                            <p className="text-concrete-500 mt-1 text-sm">加入 50k+ 都市飼養者行列。</p>
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-urban-green/10 border border-urban-green/20 rounded-2xl overflow-hidden relative flex items-center justify-between p-8 md:p-10 group cursor-pointer hover:bg-urban-green/15 transition-colors" onClick={() => navigateTo('shop')}>
                        <div className="z-10 max-w-md">
                            <h4 className="text-2xl md:text-3xl font-bold text-urban-green mb-2">本週新進</h4>
                            <p className="text-concrete-600">探索最新孵化的球蟒，尋找您的夢幻品系。</p>
                            <span className="inline-block mt-4 text-concrete-900 font-bold text-sm border-b border-concrete-900 pb-0.5">立即選購</span>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-1/2">
                            <img src="https://picsum.photos/seed/newarrivals/600/400" className="h-full w-full object-cover opacity-100 mask-image-gradient-left" style={{ maskImage: 'linear-gradient(to left, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 100%)' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ShopPage = () => (
        <div className="pt-24 pb-20 bg-concrete-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-concrete-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-concrete-900 mb-3">選購您的夥伴。</h1>
                        <p className="text-lg text-concrete-500">在安靜的都市角落，它是最完美的藝術品。</p>
                    </div>
                    <div className="mt-6 md:mt-0 flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2">
                        <button className="px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all border bg-concrete-900 text-white border-concrete-900">
                            全部顯示
                        </button>
                        {['隱性基因', '共顯性', '投資等級'].map((filter, i) => (
                            <button
                                key={i}
                                onClick={handleConstruction}
                                className="px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all border bg-white text-concrete-600 border-concrete-200 hover:border-concrete-400 hover:text-concrete-900"
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoadingSnakes ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 size={48} className="text-urban-green animate-spin" />
                            <p className="text-concrete-500 text-sm animate-pulse">正在從基因庫讀取資料...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {snakes.length > 0 ? (
                            snakes.map(snake => (
                                <SnakeCard key={snake.id} snake={snake} onViewDetails={handleViewDetails} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-concrete-400">目前沒有上架的球蟒，或無法連接至資料庫。</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const BlogPage = () => (
        <div className="pt-24 pb-20 bg-concrete-50 min-h-screen px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-concrete-900 mb-4">飼養日誌。</h1>
                <p className="text-lg text-concrete-500">關於飼養技巧、基因知識與爬蟲生活方式。</p>
            </div>
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {ARTICLES.map((article, index) => (
                    <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-concrete-200 hover:shadow-md transition-all group cursor-pointer" onClick={() => handleViewArticle(article)}>
                        <div className="h-64 overflow-hidden">
                            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-2 text-xs font-bold text-urban-green uppercase tracking-wider mb-3">
                                <span>{article.category}</span>
                                <span className="text-concrete-300">•</span>
                                <span className="text-concrete-400">{article.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-concrete-900 mb-3 group-hover:text-urban-green transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-concrete-500 line-clamp-2 leading-relaxed text-sm md:text-base">{article.excerpt}</p>
                            <div className="mt-4 flex items-center text-concrete-900 font-medium text-sm group-hover:translate-x-2 transition-transform">
                                閱讀全文 <ArrowRight size={14} className="ml-2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ArticleDetail = () => {
        if (!selectedArticle) return null;
        return (
            <div className="bg-white min-h-screen pt-24 pb-20 px-4 animate-fade-in">
                <div className="max-w-3xl mx-auto">
                    <button onClick={goBack} className="flex items-center gap-2 text-concrete-500 hover:text-concrete-900 transition-colors mb-8 group">
                        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} /> 返回列表
                    </button>
                    <h1 className="text-3xl md:text-5xl font-bold text-concrete-900 mb-6 leading-tight">{selectedArticle.title}</h1>
                    <div className="flex items-center gap-4 border-b border-concrete-200 pb-8 mb-10">
                        <div className="w-10 h-10 rounded-full bg-concrete-100 overflow-hidden">
                            <img src="https://picsum.photos/seed/author/100/100" alt="Author" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-concrete-900">Me&Python Team</p>
                            <p className="text-xs text-concrete-500">{selectedArticle.date} • {selectedArticle.readTime}</p>
                        </div>
                    </div>
                    <div className="prose prose-lg prose-concrete max-w-none">
                        <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full rounded-2xl mb-10" />
                        <p className="lead text-xl text-concrete-600 mb-8">{selectedArticle.excerpt}</p>
                        <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                    </div>
                </div>
            </div>
        );
    };

    const AboutPage = () => (
        <div className="bg-white min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-3xl mx-auto text-center mb-20">
                <h1 className="text-4xl md:text-6xl font-bold text-concrete-900 mb-6">生於都市。<br />源於自然。</h1>
                <p className="text-xl text-concrete-500 leading-relaxed font-light">
                    我們不只是繁殖者。我們致力於推廣一種將自然美學融入現代生活的風格。
                </p>
            </div>
            <div className="max-w-5xl mx-auto space-y-24 md:space-y-32">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <div className="flex-1 order-2 md:order-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-concrete-900 mb-4">嚴格的環境控管。</h3>
                        <p className="text-base md:text-lg text-concrete-500 leading-relaxed">
                            從產卵的那一刻起，每一個變數都在監控之中。溫度、濕度、墊材品質。我們相信，優質的基因值得在最完美的環境中成長。就像你在都市中追求的生活品質一樣。
                        </p>
                    </div>
                    <div className="flex-1 order-1 md:order-2 w-full">
                        <img src="https://picsum.photos/seed/about1/800/600" className="rounded-2xl shadow-lg w-full" />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                    <div className="flex-1 order-2 md:order-1">
                        <h3 className="text-2xl md:text-3xl font-bold text-concrete-900 mb-4">基因純度保證。</h3>
                        <p className="text-base md:text-lg text-concrete-500 leading-relaxed">
                            沒有猜測。我們使用最新的基因測試和系譜追蹤，確保當您購買「Het Clown」時，它是 100% 保證的。這是一份科學的承諾，也是對生命的尊重。
                        </p>
                    </div>
                    <div className="flex-1 order-1 md:order-2 w-full">
                        <img src="https://picsum.photos/seed/about2/800/600" className="rounded-2xl shadow-lg w-full" />
                    </div>
                </div>
            </div>
        </div>
    );

    const Footer = () => (
        <footer className="bg-concrete-50 border-t border-concrete-200 pt-20 pb-10">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">線上商店</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><button onClick={() => navigateTo('shop')} className="hover:text-concrete-900 transition-colors">全部商品</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">公蛇 (Males)</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">母蛇 (Females)</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">周邊商品</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">客戶服務</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">飼養指南</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">運送政策</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">活體抵達保證</button></li>
                            <li><button onClick={() => navigateTo('admin')} className="hover:text-urban-green transition-colors">管理員登入 (模擬)</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">品牌價值</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><button onClick={() => navigateTo('about')} className="hover:text-concrete-900 transition-colors">品牌理念</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">永續發展</button></li>
                            <li><button onClick={handleConstruction} className="hover:text-concrete-900 transition-colors">隱私權條款</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">關注我們</h4>
                        <div className="flex gap-4 text-concrete-400">
                            <Instagram size={20} onClick={handleConstruction} className="hover:text-urban-green cursor-pointer transition-colors" />
                            <Twitter size={20} onClick={handleConstruction} className="hover:text-urban-green cursor-pointer transition-colors" />
                            <Mail size={20} onClick={handleConstruction} className="hover:text-urban-green cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-concrete-200 flex flex-col md:flex-row justify-between text-concrete-400 items-center gap-4 md:gap-0">
                    <p>Copyright © 2024 Me&Python Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <button onClick={handleConstruction} className="hover:text-concrete-600 transition-colors">隱私權政策</button>
                        <button onClick={handleConstruction} className="hover:text-concrete-600 transition-colors">使用條款</button>
                    </div>
                </div>
            </div>
        </footer>
    );

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-concrete-50 text-concrete-900 font-sans selection:bg-urban-green/20">
                <Navbar
                    currentPage={currentPage}
                    setPage={(page) => navigateTo(page)}
                    canGoBack={history.length > 1}
                    onGoBack={goBack}
                />

                {currentPage === 'home' && (
                    <>
                        <Hero />
                        <BentoGrid />
                    </>
                )}

                {currentPage === 'shop' && <ShopPage />}
                {currentPage === 'blog' && <BlogPage />}
                {currentPage === 'about' && <AboutPage />}
                {currentPage === 'maintenance' && <MaintenanceView />}
                {currentPage === 'snake-detail' && selectedSnake && (
                    <div className="bg-white min-h-screen pt-24 pb-20 px-4 animate-fade-in">
                        <div className="max-w-7xl mx-auto">
                            <button onClick={goBack} className="flex items-center gap-2 text-concrete-500 hover:text-concrete-900 transition-colors mb-8 group">
                                <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} /> 返回列表
                            </button>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <div
                                        className="aspect-square bg-concrete-100 rounded-2xl overflow-hidden cursor-zoom-in relative group"
                                        onClick={() => openLightbox(selectedSnake.images || [])}
                                    >
                                        <img src={selectedSnake.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <ZoomIn className="text-white drop-shadow-md" size={48} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {(selectedSnake.images || []).map((img, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square bg-concrete-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-urban-green transition-all"
                                                onClick={() => openLightbox(selectedSnake.images || [], i)}
                                            >
                                                <img src={img} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h1 className="text-4xl font-bold text-concrete-900">{selectedSnake.morph}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedSnake.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {selectedSnake.availability}
                                        </span>
                                    </div>
                                    <p className="text-3xl font-mono text-concrete-600 mb-8">${selectedSnake.price.toLocaleString()}</p>
                                    <p className="text-concrete-500 leading-relaxed mb-8 text-lg">
                                        {selectedSnake.description}
                                    </p>

                                    <div className="py-6 border-b border-concrete-100 space-y-4 bg-concrete-50/50 rounded-xl px-6 mt-6">
                                        <h4 className="text-concrete-900 font-bold text-sm uppercase tracking-wide mb-4">詳細數據</h4>
                                        <div className="flex justify-between text-sm border-b border-concrete-200/50 pb-2">
                                            <span className="text-concrete-400">編號</span>
                                            <span className="text-concrete-900 font-mono">{selectedSnake.id}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b border-concrete-200/50 pb-2">
                                            <span className="text-concrete-400">基因</span>
                                            <span className="text-concrete-900 font-medium text-right">{selectedSnake.genetics.join(' + ') || '未標註'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b border-concrete-200/50 pb-2">
                                            <span className="text-concrete-400">孵化日期</span>
                                            <span className="text-concrete-900">{selectedSnake.hatchDate}</span>
                                        </div>
                                        <div className="flex justify-between text-sm border-b border-concrete-200/50 pb-2">
                                            <span className="text-concrete-400">體重</span>
                                            <span className="text-concrete-900">{selectedSnake.weight}g</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2">
                                            <span className="text-concrete-400">目前食譜</span>
                                            <span className="text-concrete-900">{selectedSnake.diet}</span>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <div className="bg-concrete-50 border border-concrete-200 rounded-xl p-6 text-center w-full">
                                            <div className="flex items-center justify-center gap-2 text-concrete-500 text-xs mb-4">
                                                <MapPin size={14} />
                                                <span>提供全台安全寄送服務</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleConstruction}
                                                    className="flex-1 bg-concrete-900 text-white font-bold py-4 rounded-lg hover:bg-concrete-800 transition-all shadow-lg hover:shadow-xl"
                                                >
                                                    加入購物車 - NT$ {selectedSnake.price.toLocaleString()}
                                                </button>
                                                <button
                                                    onClick={handleConstruction}
                                                    className="px-6 border border-concrete-200 rounded-lg hover:bg-concrete-50 transition-colors"
                                                >
                                                    詢問細節
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentPage === 'article-detail' && <ArticleDetail />}
                {currentPage === 'admin' && <AdminDashboard />}

                {/* Lightbox Overlay */}
                <Lightbox
                    images={lightboxImages}
                    initialIndex={lightboxIndex}
                    isOpen={lightboxOpen}
                    onClose={closeLightbox}
                />

                {/* Hide footer on maintenance or detail pages for cleaner look */}
                {!['maintenance', 'snake-detail', 'article-detail', 'admin'].includes(currentPage) && <Footer />}
            </div>
        </ErrorBoundary>
    );
};

export default App;
