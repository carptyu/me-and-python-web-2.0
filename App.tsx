import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SnakeCard from './components/SnakeCard';

import { FEATURED_SNAKES } from './constants';
import { Snake, Availability } from './types';
import { ChevronRight, ChevronLeft, Instagram, Facebook, MapPin, Construction, ArrowLeft, ZoomIn, Loader2 } from 'lucide-react';
import { fetchSnakesFromContentful } from './services/contentfulService';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
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

const AppContent: React.FC = () => {
    const navigate = useNavigate();

    // Data State - Revised for Contentful
    const [snakes, setSnakes] = useState<Snake[]>([]);
    const [isLoadingSnakes, setIsLoadingSnakes] = useState(true);
    const [sortBy, setSortBy] = useState<'default' | 'priceDesc' | 'priceAsc' | 'listingTime' | 'birthDateYoung' | 'birthDateOld'>('default');
    const [showSoldOut, setShowSoldOut] = useState(false);


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

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxOriginalImages, setLightboxOriginalImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Inquiry Alert State
    const [showInquiryAlert, setShowInquiryAlert] = useState(false);

    // --- Lightbox Logic ---
    const openLightbox = (images: string[], originalImages: string[] = [], index: number = 0) => {
        setLightboxImages(images);
        setLightboxOriginalImages(originalImages);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setLightboxImages([]);
        setLightboxOriginalImages([]);
    };

    const handleConstruction = () => navigate('/maintenance');
    const handleViewDetails = (snake: Snake) => navigate(`/snake/${snake.id}`);


    // --- Sub-Components ---

    const LineIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M22.28 12.33C22.28 6.78 17.29 2.26 11.14 2.26C4.99 2.26 0 6.78 0 12.33C0 16.68 2.89 20.44 7.04 21.84C7.31 21.96 7.48 22.13 7.54 22.42C7.6 22.75 7.56 23.16 7.53 23.47C7.53 23.47 7.42 24.1 7.4 24.17C7.36 24.36 7.28 24.64 7.55 24.68C7.82 24.72 8.11 24.58 8.35 24.4C8.6 24.22 12.28 21.65 13.8 20.57C18.8 20.3 22.28 16.66 22.28 12.33Z" fill="currentColor" />
            <text x="11.14" y="15" fontSize="6.5" fontWeight="900" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif" letterSpacing="0.5px">LINE</text>
        </svg>
    );



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
                        onClick={() => navigate(-1)}
                        className="w-full bg-concrete-900 text-white font-bold py-3 flex items-center justify-center gap-2 hover:bg-concrete-800 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        返回上一頁
                    </button>
                    <button
                        onClick={() => navigate('/')}
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
                    <span className="block">城市綠洲</span>
                    <span className="text-concrete-400 block mt-2">迷蟒陪伴</span>
                </h1>
                <p className="text-lg md:text-2xl text-concrete-500 font-light max-w-2xl mx-auto mb-10">
                    在水泥叢林中，尋找屬於你的寧靜角落。Me&Python，來自頂尖基因庫的藝術品。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-6 sm:px-0">
                    <button
                        onClick={() => navigate('/shop')}
                        className="bg-concrete-900 text-white rounded-lg px-8 py-4 text-sm font-medium hover:bg-concrete-800 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                        探索現貨
                    </button>
                    <button
                        onClick={() => navigate('/about')}
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
                    <div className="lg:col-span-2 bg-urban-green/10 border border-urban-green/20 rounded-2xl overflow-hidden relative flex items-center justify-between p-8 md:p-10 group cursor-pointer hover:bg-urban-green/15 transition-colors" onClick={() => navigate('/shop')}>
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
                        <p className="text-lg text-concrete-500">在安靜的都市角落，他是最完美的藝術品。</p>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 order-2 md:order-1">
                            <label className="group flex items-center gap-2 cursor-pointer select-none">
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${showSoldOut ? 'bg-concrete-900' : 'bg-concrete-200'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${showSoldOut ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={showSoldOut}
                                    onChange={(e) => setShowSoldOut(e.target.checked)}
                                />
                                <span className={`text-sm font-medium transition-colors ${showSoldOut ? 'text-concrete-900' : 'text-concrete-500 group-hover:text-concrete-700'}`}>
                                    顯示已售出
                                </span>
                            </label>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 order-1 md:order-2 justify-end">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-2 rounded-lg text-sm border border-concrete-200 bg-white text-concrete-900 focus:outline-none focus:border-urban-green/50 transition-colors shadow-sm"
                            >
                                <option value="default">預設排序</option>
                                <option value="listingTime">最新上架</option>
                                <option value="priceDesc">價格: 高 → 低</option>
                                <option value="priceAsc">價格: 低 → 高</option>
                                <option value="birthDateYoung">小朋友優先</option>
                                <option value="birthDateOld">大人優先</option>
                            </select>
                        </div>
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
                            [...snakes]
                                .filter(snake => showSoldOut || snake.availability !== Availability.Sold)
                                .sort((a, b) => {
                                    if (sortBy === 'default') return 0;
                                    if (sortBy === 'priceDesc') return b.price - a.price;
                                    if (sortBy === 'priceAsc') return a.price - b.price;
                                    if (sortBy === 'listingTime') {
                                        // Sort by createdAt if available, otherwise fallback to id or keep order
                                        if (a.createdAt && b.createdAt) {
                                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                        }
                                        return 0;
                                    }
                                    if (sortBy === 'birthDateYoung') {
                                        // Sort by hatchDate (youngest first = latest date first)
                                        if (a.hatchDate === 'Unknown') return 1;
                                        if (b.hatchDate === 'Unknown') return -1;
                                        return new Date(b.hatchDate).getTime() - new Date(a.hatchDate).getTime();
                                    }
                                    if (sortBy === 'birthDateOld') {
                                        // Sort by hatchDate (oldest first = earliest date first)
                                        if (a.hatchDate === 'Unknown') return 1;
                                        if (b.hatchDate === 'Unknown') return -1;
                                        return new Date(a.hatchDate).getTime() - new Date(b.hatchDate).getTime();
                                    }
                                    return 0;
                                })
                                .map(snake => (
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



    const SnakeDetailPage = () => {
        const { id } = useParams<{ id: string }>();
        const snake = snakes.find(s => s.id === id);
        const [activeImageIndex, setActiveImageIndex] = useState(0);

        useEffect(() => {
            setActiveImageIndex(0);
            window.scrollTo(0, 0);
        }, [id]);

        if (!snake) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-concrete-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-concrete-900 mb-4">找不到此商品</h1>
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-concrete-900 text-white px-6 py-3 rounded-lg hover:bg-concrete-800 transition-colors"
                        >
                            返回商店
                        </button>
                    </div>
                </div>
            );
        }

        const images = snake.images || [];
        const displayImage = images[activeImageIndex] || snake.imageUrl;

        const handlePrevImage = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (images.length > 1) {
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        };

        const handleNextImage = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (images.length > 1) {
                setActiveImageIndex((prev) => (prev + 1) % images.length);
            }
        };

        return (
            <div className="bg-white min-h-screen pt-24 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-concrete-500 hover:text-concrete-900 transition-colors mb-6 group">
                        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} /> 返回列表
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-4">
                            <div
                                className="aspect-square bg-concrete-100 rounded-2xl overflow-hidden cursor-zoom-in relative group"
                                onClick={() => openLightbox(snake.images || [], snake.originalImages || [], activeImageIndex)}
                            >
                                <img src={displayImage} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                {/* <Watermark size="lg" /> */}

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-concrete-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-concrete-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg z-10"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <ZoomIn className="text-white drop-shadow-md" size={48} />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square bg-concrete-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeImageIndex === i ? 'border-urban-green ring-2 ring-urban-green/20' : 'border-transparent hover:border-urban-green/50'}`}
                                        onMouseEnter={() => setActiveImageIndex(i)}
                                        onClick={() => setActiveImageIndex(i)}
                                    >
                                        <img src={img} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="flex items-center gap-4 mb-4">
                                <h1 className="text-2xl font-bold text-concrete-900 flex-1 leading-tight flex items-center gap-3">
                                    <span className={`text-lg font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${snake.gender === 'Male'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-pink-50 text-pink-600'
                                        }`}>
                                        {snake.gender === 'Male' ? '男生' : '女生'}
                                    </span>
                                    {snake.morph}
                                </h1>
                                <span className={`flex-shrink-0 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${snake.availability === Availability.Available ? 'bg-green-100 text-green-700' :
                                    snake.availability === Availability.OnHold ? 'bg-yellow-100 text-yellow-700' :
                                        snake.availability === Availability.Sold ? 'bg-red-100 text-red-700' :
                                            'bg-blue-50 text-blue-600'
                                    }`}>
                                    {snake.availability === Availability.Available ? '現貨' :
                                        snake.availability === Availability.OnHold ? '保留中' :
                                            snake.availability === Availability.Sold ? '已售出' :
                                                '開放預購'}
                                </span>
                            </div>
                            <p className="text-3xl font-mono text-concrete-600 mb-6">${snake.price.toLocaleString()}</p>
                            <p className="text-concrete-500 leading-relaxed mb-6 text-lg">
                                {snake.description}
                            </p>

                            <div className="py-4 border-b border-concrete-100 bg-concrete-50/50 rounded-xl px-5 mt-4">
                                <h4 className="text-concrete-900 font-bold text-sm uppercase tracking-wide mb-3">詳細數據</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <span className="block text-xs text-concrete-400 mb-1">編號</span>
                                        <span className="text-sm text-concrete-900 font-mono block truncate" title={snake.id}>{snake.id}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-concrete-400 mb-1">出生日期</span>
                                        <span className="text-sm text-concrete-900 block">{snake.hatchDate}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-concrete-400 mb-1">體重</span>
                                        <span className="text-sm text-concrete-900 block">{snake.weight}g</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-4">
                                <div className="bg-concrete-50 border border-concrete-200 rounded-xl p-5 text-center w-full">
                                    <div className="flex items-center justify-center gap-2 text-concrete-500 text-xs mb-3">
                                        <MapPin size={14} />
                                        <span>提供全台安全寄送服務</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const genderText = snake.gender === 'Male' ? '公' : '母';
                                            const inquiryText = `你好 我想詢問 ${genderText}${snake.morph} (${snake.id})`;
                                            navigator.clipboard.writeText(inquiryText).then(() => {
                                                setShowInquiryAlert(true);
                                            }).catch(() => {
                                                alert('複製失敗，請手動複製：\n' + inquiryText);
                                            });
                                        }}
                                        className="w-full bg-concrete-900 text-white font-bold py-3 rounded-lg hover:bg-concrete-800 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        立即詢問
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };





    const Footer = () => (
        <footer className="bg-concrete-50 border-t border-concrete-200 pt-20 pb-10">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">線上商店</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><button onClick={() => navigate('/shop')} className="hover:text-concrete-900 transition-colors">全部商品</button></li>
                            <li><span className="text-concrete-300 cursor-not-allowed">周邊商品 (維修中)</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">客戶服務</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><span className="text-concrete-300 cursor-not-allowed">飼養指南 (維修中)</span></li>
                            <li><span className="text-concrete-300 cursor-not-allowed">運送政策 (維修中)</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">品牌價值</h4>
                        <ul className="space-y-3 text-concrete-500">
                            <li><span className="text-concrete-300 cursor-not-allowed">品牌理念 (維修中)</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-concrete-900 mb-4 uppercase tracking-wider">關注我們</h4>
                        <div className="flex gap-4 text-concrete-400">
                            <a
                                href="https://www.instagram.com/meandpython?igsh=MTRmemlhaTA0ZWoxYg%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-urban-green cursor-pointer transition-colors"
                            >
                                <Instagram size={24} />
                            </a>
                            <a
                                href="https://www.facebook.com/profile.php?id=61558807599321"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-urban-green cursor-pointer transition-colors"
                            >
                                <Facebook size={24} />
                            </a>
                            <a
                                href="https://line.me/ti/g2/tagALcVDnwwtTiTojJGCnJf0bpmdzlv0stFjTg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-urban-green cursor-pointer transition-colors"
                            >
                                <LineIcon size={24} />
                            </a>
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
        <div className="min-h-screen bg-concrete-50 text-concrete-900 font-sans selection:bg-urban-green/20">
            <Navbar />

            <Routes>
                <Route path="/" element={
                    <>
                        <Hero />
                        <BentoGrid />
                    </>
                } />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/blog" element={<MaintenanceView />} />
                <Route path="/about" element={<MaintenanceView />} />
                <Route path="/snake/:id" element={<SnakeDetailPage />} />
                <Route path="/blog/:slug" element={<MaintenanceView />} />
                <Route path="/admin" element={<MaintenanceView />} />
                <Route path="/maintenance" element={<MaintenanceView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Footer />

            {lightboxOpen && (
                <Lightbox
                    isOpen={lightboxOpen}
                    images={lightboxImages}
                    originalImages={lightboxOriginalImages}
                    initialIndex={lightboxIndex}
                    onClose={closeLightbox}
                />
            )}

            {showInquiryAlert && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setShowInquiryAlert(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center mb-6">
                            <div className="bg-green-100 p-4 rounded-full">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-concrete-900 mb-4 text-center">已複製詢問訊息！</h3>
                        <p className="text-concrete-600 text-center mb-6 leading-relaxed">
                            請私訊我們的 <a href="https://www.instagram.com/meandpython?igsh=MTRmemlhaTA0ZWoxYg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">Instagram</a> 或 <a href="https://www.facebook.com/profile.php?id=61558807599321" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">Facebook 專頁</a>，我們會盡快回覆您！
                            <br /><br />
                            想得知最新消息，歡迎加入我們的 <a href="https://line.me/ti/g2/tagALcVDnwwtTiTojJGCnJf0bpmdzlv0stFjTg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:underline">Line 群組</a>！
                        </p>
                        <button
                            onClick={() => setShowInquiryAlert(false)}
                            className="w-full bg-concrete-900 text-white font-bold py-3 rounded-lg hover:bg-concrete-800 transition-colors"
                        >
                            知道了
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <AppContent />
            </ErrorBoundary>
            <SpeedInsights />
            <Analytics />
        </BrowserRouter>
    );
};

export default App;
