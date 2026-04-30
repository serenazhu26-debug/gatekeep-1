'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { OutfitItem } from '@/lib/types';

interface Props {
  category: string;
  label: string;
  item: OutfitItem;
  itemIndex: number;
  totalItems: number;
  locked: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  onToggleLock: () => void;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function OutfitLayer({
  category, label, item, itemIndex, totalItems, locked, onSwipe, onToggleLock,
}: Props) {
  const [direction, setDirection] = useState(0);
  const [dragStart, setDragStart] = useState(0);

  const handleSwipe = (dir: 'left' | 'right') => {
    if (locked) return;
    setDirection(dir === 'right' ? 1 : -1);
    onSwipe(dir);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 88 }}>
      {/* Card background + content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${category}-${itemIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center px-4 gap-3"
          style={{ background: item.bgGradient }}
          drag={locked ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={(_, i) => setDragStart((i as any).point?.x ?? 0)}
          onDragEnd={(_, i) => {
            const delta = (i as any).offset?.x ?? 0;
            if (delta < -40) handleSwipe('right');
            else if (delta > 40) handleSwipe('left');
          }}
        >
          {/* Emoji */}
          <span className="text-3xl select-none flex-shrink-0">{item.emoji}</span>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-sm leading-tight truncate ${item.textLight ? 'text-white' : 'text-gray-900'}`}>
              {item.name}
            </p>
            <p className={`text-xs mt-0.5 ${item.textLight ? 'text-white/60' : 'text-gray-500'}`}>
              {item.brand} · {item.sku}
            </p>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span className={`font-black text-lg leading-none ${item.textLight ? 'text-white' : 'text-gray-900'}`}>
              {item.price === 0 ? 'Free' : `$${item.price}`}
            </span>
            <span className={`text-xs mt-0.5 ${item.textLight ? 'text-white/50' : 'text-gray-400'}`}>
              {itemIndex + 1}/{totalItems}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left arrow */}
      {!locked && (
        <button
          onClick={() => handleSwipe('left')}
          className="absolute left-0 inset-y-0 w-10 flex items-center justify-center z-10 opacity-0 hover:opacity-100 transition-opacity bg-black/20"
        >
          <ChevronLeft size={18} className="text-white drop-shadow" />
        </button>
      )}

      {/* Right arrow */}
      {!locked && (
        <button
          onClick={() => handleSwipe('right')}
          className="absolute right-8 inset-y-0 w-10 flex items-center justify-center z-10 opacity-0 hover:opacity-100 transition-opacity bg-black/20"
        >
          <ChevronRight size={18} className="text-white drop-shadow" />
        </button>
      )}

      {/* Lock button */}
      <button
        onClick={onToggleLock}
        className={`absolute right-0 inset-y-0 w-8 flex items-center justify-center z-10 transition-colors ${
          locked ? 'bg-purple-600/80' : 'bg-black/20 hover:bg-black/40'
        }`}
      >
        {locked
          ? <Lock size={14} className="text-white" />
          : <Unlock size={14} className="text-white/60" />
        }
      </button>
    </div>
  );
}
