import React from 'react';
import { Snake, Availability } from '../types';
import Watermark from './Watermark';

interface SnakeCardProps {
  snake: Snake;
  onViewDetails: (snake: Snake) => void;
}

const SnakeCard: React.FC<SnakeCardProps> = ({ snake, onViewDetails }) => {
  return (
    <div
      onClick={() => onViewDetails(snake)}
      className="group relative bg-white rounded-none md:rounded-lg overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl border border-transparent hover:border-concrete-200 flex flex-col h-full"
    >
      {/* Status Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 flex items-center justify-center ${snake.availability === Availability.Available ? 'bg-white/90 text-urban-green shadow-sm' :
          snake.availability === Availability.OnHold ? 'bg-yellow-100 text-yellow-700 shadow-sm' :
            snake.availability === Availability.Sold ? 'bg-red-100 text-red-700 shadow-sm' :
              'bg-blue-50 text-blue-600 shadow-sm' // PreOrder
          }`}>
          {snake.availability === Availability.Available ? '現貨' :
            snake.availability === Availability.OnHold ? '保留中' :
              snake.availability === Availability.Sold ? '已售出' :
                '開放預購'}
        </span>
      </div>

      {/* Gender Indicator (Top Right Text Badge) */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`text-[10px] font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-sm flex items-center gap-1 ${snake.gender === 'Male'
          ? 'bg-blue-50/90 text-blue-600'
          : 'bg-pink-50/90 text-pink-600'
          }`}>
          {snake.gender === 'Male' ? '男生' : '女生'}
        </span>
      </div>

      {/* Image Area */}
      <div className="w-full aspect-square overflow-hidden bg-concrete-100 relative">
        <img
          src={snake.imageUrl}
          alt={snake.morph}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 saturate-[0.9] group-hover:saturate-100"
        />
        {/* <Watermark /> */}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
          <div className="text-concrete-400 text-xs font-medium mb-1 uppercase tracking-wide">New Arrival</div>
          <h3 className="text-lg font-bold text-concrete-900 mb-2 leading-snug group-hover:text-urban-green transition-colors">
            {snake.morph}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-concrete-100">
          <span className="text-concrete-900 font-bold font-mono">
            NT$ {snake.price.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-concrete-400 group-hover:text-urban-green transition-colors uppercase tracking-wider">
            查看詳情
          </span>
        </div>
      </div>
    </div>
  );
};

export default SnakeCard;