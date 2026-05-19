import { motion, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sounds } from '../services/soundService';

export default function SplashScreen() {
  const [progress, setProgress] = useState(5);
  
  useEffect(() => {
    // Detect if running in PWA (Standalone) mode
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;

    // Only play startup sound automatically if in PWA
    if (isPWA) {
      sounds.playStartup();
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Approximately 2 seconds to reach 100% (matching sound duration)
        // 100 / (2000ms / 50ms) = 100 / 40 = 2.5 per step
        const diff = Math.random() * 2 + 1.5;
        return Math.min(prev + diff, 100);
      });
    }, 50);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e0f] relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.05)_0%,rgba(14,14,15,1)_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo Icon */}
        <motion.div
          animate={{ 
            filter: [
              "drop-shadow(0 0 10px rgba(0,240,255,0.4))",
              "drop-shadow(0 0 25px rgba(0,240,255,0.9))",
              "drop-shadow(0 0 10px rgba(0,240,255,0.4))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8"
        >
          <Zap size={100} className="text-primary fill-primary" />
        </motion.div>

        {/* Text Branding */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-primary neon-text-primary">
            Xora.ai
          </h1>
          <p className="text-xs uppercase tracking-[0.4em] text-on-surface-variant opacity-80 mt-2">
            THE FUTURE OF TIC TAC TOE
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent my-10" />

        {/* Progress Bar */}
        <div className="w-64 flex flex-col gap-3 mt-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[0.5px]">
            <motion.div 
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="h-full bg-primary rounded-full relative shadow-[0_0_15px_rgba(0,240,255,0.6)]"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full blur-sm opacity-80" />
            </motion.div>
          </div>
          <div className="flex justify-between items-center w-full px-1">
            <span className="text-[10px] uppercase font-medium tracking-widest text-on-surface-variant/40">Starting Game...</span>
            <span className="text-[10px] font-medium text-primary/80">{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYQofslG1amYWLKooCexoaKM4_0cXruGCYOt4KGI6gPnDML70EazwxoJ3JbMTbGpCTnzTeBx5HC8seL8Z6xB3s64jubr35YntaYiaA0tjmx1r7TdLB27bgfBzA4Qj5AUQyuRuEG93-2nVa3dmD8lwxB0mU0nqCJ5I4wK_QPdRW6UyUMAqk7_w_M7y5vKLLsVFDVY-iQPh2n4vPBOImoNpQ1XSMt6bTtmK_jWpYe6hgGXKxLAnqu3S1uOCgcoVvxyZCemodCl-n5xJc')] opacity-10" />
    </div>
  );
}
