import React from 'react';
import { Snake, Availability } from '../types';

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
        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 ${
          snake.availability === Availability.Available ? 'bg-white/90 text-urban-green shadow-sm' :
          snake.availability === Availability.OnHold ? 'bg-white/90 text-orange-500 shadow-sm' :
          'bg-concrete-800/90 text-white shadow-sm'
        }`}>
          {snake.availability === 'Available' ? '現貨' : 
           snake.availability === 'On Hold' ? '預訂中' : '已售出'}
        </span>
      </div>

      {/* Image Area */}
      <div className="w-full aspect-square overflow-hidden bg-concrete-100 relative">
        <img 
          src={snake.imageUrl} 
          alt={snake.morph} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 saturate-[0.9] group-hover:saturate-100"
        />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-white">
        <div>
           <div className="text-concrete-400 text-xs font-medium mb-1 uppercase tracking-wide">New Arrival</div>
           <h3 className="text-lg font-bold text-concrete-900 mb-2 leading-snug group-hover:text-urban-green transition-colors">
            {snake.morph}
          </h3>
          <p className="text-concrete-500 text-sm line-clamp-2 mb-4 font-light">
             {snake.gender === 'Male' ? '公' : '母'} • {snake.weight}g
          </p>
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