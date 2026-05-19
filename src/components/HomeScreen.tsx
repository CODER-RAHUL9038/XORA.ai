import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Volume2, Settings, Smartphone, Cpu, Users, ChevronRight, ArrowRight, Swords, Trophy, VolumeX, Music } from 'lucide-react';
import { GameSettings, SeriesRecord } from '../App';
import SettingsDrawer from './SettingsDrawer';
import RankingsModal from './RankingsModal';
import { sounds } from '../services/soundService';

interface HomeScreenProps {
  onStartGame: (settings: GameSettings) => void;
  settings: GameSettings;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  history: SeriesRecord[];
}

export default function HomeScreen({ 
  onStartGame, 
  settings, 
  isMuted, 
  setIsMuted,
  history
}: HomeScreenProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMute(nextMuted);
    if (!nextMuted) sounds.playClick();
  };

  const handleStartGame = () => {
    sounds.playClick();
    onStartGame(localSettings);
  };

  const openSettings = () => {
    sounds.playClick();
    setIsSettingsOpen(true);
  };

  const openHistory = () => {
    sounds.playClick();
    setIsHistoryOpen(true);
  };

  return (
    <div className="min-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-mesh z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-10 flex justify-center bg-black/40 backdrop-blur-[20px] border-b border-white/10">
        <div className="w-full max-w-7xl flex justify-between items-center px-6 md:px-12 py-4">
          <div className="flex items-center gap-3">
            <Grid className="text-primary neon-text-primary" size={24} />
            <span className="text-xl font-bold tracking-tighter text-primary neon-text-primary">
              Xora.ai
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={openHistory}
              className="p-2 rounded-full hover:bg-white/5 transition-all text-on-surface-variant"
              title="Battle History"
            >
              <Trophy size={20} />
            </button>
            <button 
              onClick={toggleMute}
              className={`p-2 rounded-full hover:bg-white/5 transition-all ${isMuted ? 'text-red-500/50' : 'text-on-surface-variant'}`}
              title="Toggle Sound Effects"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button 
              onClick={openSettings}
              className="p-2 rounded-full hover:bg-white/5 transition-all text-on-surface-variant"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center w-full pt-16 pb-20 md:py-24 relative z-10 px-6">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-6 md:mb-8 w-full pt-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1] md:leading-[1.1]"
            >
              <span className="block neon-text-primary uppercase">HI, I'M RAHUL SHAW.</span>
            </motion.h1>

            {/* Divider */}
            <div className="flex items-center justify-center mb-4 overflow-hidden">
              <div className="h-[1px] w-full max-w-[320px] bg-gradient-to-r from-transparent via-primary/40 to-transparent relative">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_#00f0ff] z-10" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto px-4"
            >
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed opacity-80 font-normal max-w-lg mx-auto">
                I built <span className="text-primary font-bold">XORA.ai</span> with passion for strategy, clean design, and next-level gameplay againt ai.
              </p>
            </motion.div>
          </section>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Battle AI Card */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="glass-card rounded-2xl p-6 md:p-8 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-primary mb-2 block font-bold">Single Player</span>
                  <h2 className="text-2xl font-bold text-on-surface">Battle AI</h2>
                </div>
                <Cpu className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                Test your logic against our adaptive neural grid. Choose your challenge level.
              </p>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                {(['easy', 'med', 'hard'] as const).map(diff => (
                  <button 
                    key={diff}
                    onClick={() => {
                      sounds.playClick();
                      setLocalSettings(prev => ({ ...prev, difficulty: diff, mode: 'ai', player2Name: 'AI' }));
                    }}
                    className={`py-2 text-[10px] rounded-lg font-bold uppercase transition-all border ${
                      localSettings.difficulty === diff && localSettings.mode === 'ai'
                      ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'border-white/5 bg-white/5 text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  sounds.playClick();
                  onStartGame({ ...localSettings, mode: 'ai', player2Name: 'AI' });
                }}
                className="mt-auto py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,240,255,0.2)]"
              >
                PLAY AGAINST AI
                <ArrowRight size={18} />
              </button>
            </motion.div>

            {/* Local PVP Card */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="glass-card rounded-2xl p-6 md:p-8 flex flex-col group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-secondary-container mb-2 block font-bold">Multiplayer</span>
                  <h2 className="text-2xl font-bold text-on-surface">Play with Friends</h2>
                </div>
                <Users className="text-secondary-container opacity-50 group-hover:opacity-100 transition-opacity" size={32} />
              </div>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                The ultimate test of friendship. Challenge a friend on the same device in a classic showdown.
              </p>
              <div className="mb-8 flex justify-center opacity-60 group-hover:opacity-100 transition-all">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-primary text-xs font-bold">✕</div>
                  <div className="h-10 w-10 rounded-full bg-secondary-container/10 border border-secondary-container flex items-center justify-center text-secondary-container text-xs font-bold">○</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  sounds.playClick();
                  onStartGame({ ...localSettings, mode: 'pvp', player2Name: 'Player 2' });
                }}
                className="mt-auto py-4 bg-secondary-container text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,36,228,0.2)]"
              >
                PLAY WITH FRIENDS
                <Swords size={18} />
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Mobile Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-black/60 backdrop-blur-[20px] border-t border-white/10 md:hidden">
        <button className="flex flex-col items-center text-primary relative">
          <Smartphone size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Play</span>
          <div className="absolute -bottom-1 w-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#00f0ff]" />
        </button>
        <button 
          onClick={openHistory}
          className="flex flex-col items-center text-on-surface-variant/40 hover:text-primary transition-colors"
        >
          <Trophy size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">History</span>
        </button>
        <button 
          onClick={openSettings}
          className="flex flex-col items-center text-on-surface-variant/40 hover:text-primary transition-colors"
        >
          <Settings size={20} />
          <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Settings</span>
        </button>
      </nav>

      {/* Render Modals */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsDrawer 
            onClose={() => setIsSettingsOpen(false)} 
            settings={localSettings}
            onUpdateSettings={setLocalSettings}
            onStartGame={(s) => {
              sounds.playClick();
              setIsSettingsOpen(false);
              onStartGame(s);
            }}
          />
        )}
        {isHistoryOpen && (
          <RankingsModal 
            onClose={() => setIsHistoryOpen(false)} 
            history={history}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
