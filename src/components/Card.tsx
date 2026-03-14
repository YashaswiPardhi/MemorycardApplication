import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled: boolean;
}

export const Card: React.FC<CardProps> = ({ card, onClick, disabled }) => {
  const IconComponent = (Icons as any)[card.iconName];

  return (
    <div 
      className="relative aspect-square cursor-pointer perspective-1000"
      onClick={() => !disabled && !card.isFlipped && !card.isMatched && onClick()}
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        initial={false}
        animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
      >
        {/* Front (Hidden) */}
        <div className="absolute inset-0 backface-hidden bg-zinc-900 border-2 border-zinc-800 rounded-2xl flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 opacity-20" />
        </div>

        {/* Back (Visible) */}
        <div 
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center border-2 shadow-inner ${
            card.isMatched 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
              : 'bg-white border-zinc-200 text-zinc-900'
          }`}
        >
          {IconComponent && <IconComponent size={32} strokeWidth={2.5} />}
        </div>
      </motion.div>
    </div>
  );
};
