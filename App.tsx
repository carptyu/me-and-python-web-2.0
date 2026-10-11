import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import GeneticTestPage from './components/GeneticTestPage';
import ImportTermsPage from './components/ImportTermsPage';
import ScrollManager from './components/ScrollManager';
import HomePage from './components/HomePage';
import ImportServicePage from './components/ImportServicePage';
import Footer from './components/Footer';

import { VENDORS as vendors } from './vendorsData';
import { Construction, ArrowLeft, ZoomIn, FileText } from 'lucide-react';
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

    // 站內蛇隻上架已封存，改由 ScaleSwap 處理 —— 見 archive/shop-2026-07/

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxOriginalImages, setLightboxOriginalImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

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

    // --- Sub-Components ---

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

    // Vendor Appendix Detail Page
    const VendorAppendixPage = () => {
        const { id } = useParams<{ id: string }>();
        const vendor = vendors.find(v => v.id === id);

        if (!vendor) {
            return (
                <div className="pt-24 pb-20 bg-concrete-50 min-h-screen">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-2xl font-bold text-concrete-900 mb-4">找不到此廠家</h1>
                        <button
                            onClick={() => navigate('/import-service')}
                            className="bg-concrete-900 text-white px-6 py-3 rounded-lg hover:bg-concrete-800 transition-colors"
                        >
                            返回廠家列表
                        </button>
                    </div>
                </div>
            );
        }

        const hasAppendix = (vendor.appendixFiles && vendor.appendixFiles.length > 0) || vendor.appendixLabel;

        return (
            <div className="pt-24 pb-20 bg-concrete-50 min-h-screen">
                <div className="max-w-4xl mx-auto px-3 md:px-6">
                    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-concrete-200">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-concrete-900">{vendor.name} - 附錄</h1>
                            <a
                                href={vendor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-urban-green hover:text-urban-green/80 font-medium hover:underline transition-colors text-sm"
                            >
                                前往 MorphMarket →
                            </a>
                        </div>

                        {!hasAppendix ? (
                            <div className="p-12 bg-concrete-50 rounded-xl border-2 border-dashed border-concrete-300 flex flex-col items-center justify-center text-concrete-400 gap-4">
                                <FileText size={32} />
                                <p>此廠家尚無附錄資料</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Appendix Label/Description */}
                                {vendor.appendixLabel && (
                                    <div className="bg-concrete-50 rounded-xl p-6 border border-concrete-200">
                                        <h3 className="text-lg font-bold text-concrete-900 mb-3">說明</h3>
                                        <p className="text-concrete-600 whitespace-pre-wrap leading-relaxed">{vendor.appendixLabel}</p>
                                    </div>
                                )}

                                {/* Appendix Files/Images */}
                                {vendor.appendixFiles && vendor.appendixFiles.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-concrete-900 mb-4">附件 ({vendor.appendixFiles.length})</h3>
                                        <div className="space-y-4">
                                            {vendor.appendixFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group cursor-pointer rounded-xl overflow-hidden border border-concrete-200 hover:border-urban-green/50 transition-colors bg-concrete-50"
                                                    onClick={() => openLightbox(vendor.appendixFiles || [], [], index)}
                                                >
                                                    <img
                                                        src={file}
                                                        alt={`${vendor.name} 附錄 ${index + 1}`}
                                                        className="w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                                            <ZoomIn className="text-concrete-900" size={18} />
                                                            <span className="text-concrete-900 text-sm font-medium">點擊放大</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-concrete-50 text-concrete-900 font-sans selection:bg-urban-green/20">
            <Navbar />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<MaintenanceView />} />
                <Route path="/about" element={<MaintenanceView />} />
                <Route path="/blog/:slug" element={<MaintenanceView />} />
                <Route path="/admin" element={<MaintenanceView />} />
                <Route path="/maintenance" element={<MaintenanceView />} />
                <Route path="/import-service" element={<ImportServicePage />} />
                <Route path="/genetic-test" element={<GeneticTestPage />} />
                <Route path="/import-terms" element={<ImportTermsPage />} />
                <Route path="/vendor/:id/appendix" element={<VendorAppendixPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ScrollManager />

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
