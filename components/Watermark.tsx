import React from 'react';

interface WatermarkProps {
    text?: string;
    className?: string;
    opacity?: number;
    size?: 'sm' | 'md' | 'lg';
}

const Watermark: React.FC<WatermarkProps> = ({
    text = "Me&Python",
    className = "",
    opacity = 0.6,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5'
    };

    return (
        <div
            className={`absolute bottom-0 right-0 z-20 pointer-events-none select-none ${className}`}
            style={{ opacity }}
        >
            <div className={`
                font-sans font-bold tracking-[0.2em] text-white 
                drop-shadow-md bg-gradient-to-t from-black/40 to-transparent 
                w-full text-right ${sizeClasses[size]}
            `}>
                {text}
            </div>
        </div>
    );
};

export default Watermark;
