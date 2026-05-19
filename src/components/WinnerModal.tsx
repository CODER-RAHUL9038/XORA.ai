import { motion } from 'motion/react';
import { X as XIcon, Circle } from 'lucide-react';

import { sounds } from '../services/soundService';

interface WinnerModalProps {
  winner: 'X' | 'O' | 'Draw';
  winnerName?: string;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function WinnerModal({ winner, winnerName, onPlayAgain, onBackToMenu }: WinnerModalProps) {
  const isDraw = winner === 'Draw';
  
  const handlePlayAgain = () => {
    sounds.playClick();
    onPlayAgain();
  };

  const handleBackToMenu = () => {
    sounds.playClick();
    onBackToMenu();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-background/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card border-primary/40 rounded-2xl w-full max-w-md p-10 pb-14 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
      >
        {/* Background Decorative particles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-4 left-10 w-2 h-2 bg-primary rounded-full blur-[1px]" />
          <div className="absolute bottom-10 right-12 w-3 h-3 bg-primary rounded-full blur-[2px]" />
          <div className="absolute top-20 right-8 w-1 h-1 bg-primary rounded-full" />
        </div>

        {/* Close Button as a Cross Icon */}
        <button 
          onClick={handlePlayAgain}
          className="absolute top-4 right-4 p-2 text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer z-20"
        >
          <XIcon size={24} />
        </button>

        {/* Status Icon */}
        <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full glass-card border-primary/40 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          {isDraw ? (
            <div className="flex gap-1">
              <XIcon size={32} className="text-primary opacity-50" />
              <Circle size={28} className="text-[#ff24e4] opacity-50" />
            </div>
          ) : winner === 'X' ? (
            <XIcon size={64} className="text-primary neon-text-primary stroke-[1px]" />
          ) : (
            <Circle size={56} className="text-secondary-container drop-shadow-[0_0_10px_#ff24e4] stroke-[1px]" />
          )}
        </div>

        {/* Winner/Draw Text */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-primary neon-text-primary mb-2 uppercase">
          {isDraw ? "SERIES DRAW!" : `${winnerName} IS THE CHAMPION!`}
        </h2>
        <p className="text-sm text-on-surface-variant mb-10 opacity-70 tracking-wide font-medium">
          {isDraw ? "The series ended in a tie." : "YOU WON THE SERIES!"}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-4">
          <button 
            onClick={handlePlayAgain}
            className="w-full py-4 px-6 rounded-xl bg-primary/20 border border-primary text-primary font-bold text-lg tracking-tight hover:bg-primary/30 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            PLAY AGAIN
          </button>
          <button 
            onClick={handleBackToMenu}
            className="w-full py-4 px-6 rounded-xl glass-card border border-white/10 text-on-surface font-bold text-lg tracking-tight hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            BACK TO MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
