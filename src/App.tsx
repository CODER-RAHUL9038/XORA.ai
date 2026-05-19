/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';

import { sounds } from './services/soundService';

export type Screen = 'splash' | 'home' | 'game';

export interface GameSettings {
  mode: 'ai' | 'pvp';
  difficulty: 'easy' | 'med' | 'hard';
  player1Name: string;
  player2Name: string;
}

export interface SeriesRecord {
  id: string;
  p1Name: string;
  p2Name: string;
  p1Score: number;
  p2Score: number;
  winner: string;
  mode: 'ai' | 'pvp';
  timestamp: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('xora-settings');
    return saved ? JSON.parse(saved) : {
      mode: 'ai',
      difficulty: 'med',
      player1Name: 'Player 1',
      player2Name: 'AI',
    };
  });
  const [history, setHistory] = useState<SeriesRecord[]>(() => {
    const saved = localStorage.getItem('xora-series-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    localStorage.setItem('xora-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('xora-series-history', JSON.stringify(history));
  }, [history]);

  const addSeriesToHistory = (record: Omit<SeriesRecord, 'id' | 'timestamp'>) => {
    const newRecord: SeriesRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newRecord, ...prev].slice(0, 50)); // Keep last 50
  };

  useEffect(() => {
    sounds.setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('home');
      }, 2500); // 2.5 second splash to match 2s sound + exit animation
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  return (
    <div className="min-h-[100dvh] w-full bg-background relative flex flex-col overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex-1 relative z-0"
          >
            <SplashScreen />
          </motion.div>
        )}

        {currentScreen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex-1 relative z-0"
          >
            <HomeScreen 
              onStartGame={(newSettings) => {
                setSettings(newSettings);
                setCurrentScreen('game');
              }}
              settings={settings}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              history={history}
            />
          </motion.div>
        )}

        {currentScreen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full flex-1 relative z-0"
          >
            <GameScreen 
              settings={settings} 
              onBackToMenu={() => setCurrentScreen('home')}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onAddSeriesHistory={addSeriesToHistory}
              onUpdateSettings={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Developer Credit - Only shown during splash/loading */}
      {currentScreen === 'splash' && (
        <footer className="fixed bottom-24 left-0 w-full flex justify-center pointer-events-none z-50 px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-[9px] uppercase tracking-[0.5em] text-white/30 mb-2 font-medium">DEVELOPED BY</span>
            <div className="flex items-center gap-3">
              {/* Left Decoration */}
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-primary relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />
              </div>
              
              {/* Name */}
              <span className="text-base md:text-xl font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary-container drop-shadow-[0_0_12px_rgba(0,240,255,0.3)] px-3 whitespace-nowrap">
                RAHUL SHAW
              </span>
              
              {/* Right Decoration */}
              <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-secondary-container relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-secondary-container shadow-[0_0_10px_rgba(255,36,228,1)]" />
              </div>
            </div>
          </motion.div>
        </footer>
      )}
    </div>
  );
}
