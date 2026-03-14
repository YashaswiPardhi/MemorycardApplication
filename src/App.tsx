import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Timer, Hash } from 'lucide-react';
import { Card } from './components/Card';
import { CardType, GameStatus } from './types';

const ICONS = [
  'Zap', 'Flame', 'Ghost', 'Heart', 
  'Moon', 'Sun', 'Star', 'Cloud',
  'Anchor', 'Compass', 'Globe', 'Map'
];

export default function App() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [seconds, setSeconds] = useState(0);

  const initializeGame = useCallback(() => {
    const gameIcons = [...ICONS, ...ICONS];
    const shuffled = gameIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        iconName: icon,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'playing') {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (matches === ICONS.length && status === 'playing') {
      setStatus('finished');
    }
  }, [matches, status]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;

    const newCards = cards.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards[firstId];
      const secondCard = newCards[secondId];

      if (firstCard.iconName === secondCard.iconName) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatches(m => m + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl font-bold tracking-tighter uppercase leading-none mb-2">
            Mind<span className="text-zinc-400">Match</span>
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
            A minimalist memory training exercise
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
              <Hash size={10} /> Moves
            </span>
            <span className="text-2xl font-mono font-bold leading-none">{moves}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1">
              <Timer size={10} /> Time
            </span>
            <span className="text-2xl font-mono font-bold leading-none">{formatTime(seconds)}</span>
          </div>
          <button 
            onClick={initializeGame}
            className="ml-4 p-3 bg-zinc-900 text-white rounded-full hover:scale-105 active:scale-95 transition-transform"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="max-w-4xl mx-auto px-6 pb-20">
        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="aspect-video bg-white border-2 border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-6 shadow-sm"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-white">
                <Trophy size={40} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">Ready to start?</h2>
                <p className="text-zinc-500">Match all pairs in the shortest time possible.</p>
              </div>
              <button 
                onClick={initializeGame}
                className="px-8 py-4 bg-zinc-900 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-zinc-800 transition-colors"
              >
                Start Game
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
            >
              {cards.map(card => (
                <Card 
                  key={card.id} 
                  card={card} 
                  onClick={() => handleCardClick(card.id)}
                  disabled={flippedCards.length === 2}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Win Modal */}
      <AnimatePresence>
        {status === 'finished' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-12 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full text-emerald-500">
                <Trophy size={48} />
              </div>

              <h2 className="text-4xl font-bold tracking-tighter mb-2">Excellent!</h2>
              <p className="text-zinc-500 mb-8">You've matched all the pairs.</p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Moves</span>
                  <span className="text-2xl font-mono font-bold">{moves}</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Time</span>
                  <span className="text-2xl font-mono font-bold">{formatTime(seconds)}</span>
                </div>
              </div>

              <button 
                onClick={initializeGame}
                className="w-full py-5 bg-zinc-900 text-white font-bold uppercase tracking-widest text-sm rounded-2xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3"
              >
                <RotateCcw size={18} /> Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md border border-zinc-200 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-400 shadow-sm">
          MindMatch v1.0 • Built with AI Studio
        </div>
      </footer>
    </div>
  );
}
