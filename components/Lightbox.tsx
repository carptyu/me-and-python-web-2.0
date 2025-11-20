import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
    images: string[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragMovedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
            setScale(1);
            setPosition({ x: 0, y: 0 });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, scale]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
            resetZoom();
        } else {
            // Optional: Loop back to start
            setCurrentIndex(0);
            resetZoom();
        }
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            resetZoom();
        } else {
            // Optional: Loop to end
            setCurrentIndex(images.length - 1);
            resetZoom();
        }
    };

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        e.stopPropagation();

        if (dragMovedRef.current) {
            dragMovedRef.current = false;
            return;
        }

        if (scale > 1) {
            // Zoom out
            resetZoom();
        } else {
            // Zoom in to cursor
            if (!imageRef.current) return;

            const rect = imageRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate percentage position
            const xPercent = x / rect.width;
            const yPercent = y / rect.height;

            // Target scale
            const targetScale = 2.5;

            // Offset from center of image
            const offsetX = (0.5 - xPercent) * rect.width * targetScale;
            const offsetY = (0.5 - yPercent) * rect.height * targetScale;

            setScale(targetScale);
            setPosition({ x: offsetX, y: offsetY });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault();
            setIsDragging(true);
            setStartPan({ x: e.clientX - position.x, y: e.clientY - position.y });
            dragMovedRef.current = false;
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            const newX = e.clientX - startPan.x;
            const newY = e.clientY - startPan.y;

            // Only mark as moved if there's significant movement to avoid jitter being counted as drag
            if (Math.abs(newX - position.x) > 2 || Math.abs(newY - position.y) > 2) {
                dragMovedRef.current = true;
            }

            setPosition({ x: newX, y: newY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
            onClick={onClose}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Close Button */}
            <button
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2 z-20"
                onClick={onClose}
            >
                <X size={32} />
            </button>

            {/* Navigation - Prev */}
            {images.length > 1 && (
                <button
                    onClick={prevImage}
                    className="absolute left-2 md:left-8 text-white/50 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full z-20"
                >
                    <ChevronLeft size={40} />
                </button>
            )}

            {/* Navigation - Next */}
            {images.length > 1 && (
                <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-8 text-white/50 hover:text-white transition-all p-4 hover:bg-white/10 rounded-full z-20"
                >
                    <ChevronRight size={40} />
                </button>
            )}

            {/* Image Container */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                ref={containerRef}
            >
                <img
                    ref={imageRef}
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className={`max-w-full max-h-[85vh] object-contain transition-transform duration-300 ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'}`}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                    onClick={handleImageClick}
                    onMouseDown={handleMouseDown}
                />
            </div>

            {/* Controls / Info */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none">
                {images.length > 1 && (
                    <div className="text-white/50 text-sm font-mono tracking-widest bg-black/50 px-4 py-1 rounded-full">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lightbox;
