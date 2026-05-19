import { motion } from 'motion/react';
import { X, Smartphone, Cpu, Settings as SettingsIcon, ChevronRight, User, Bot, ToggleLeft, ToggleRight } from 'lucide-react';
import { GameSettings } from '../App';
import { sounds } from '../services/soundService';

interface SettingsDrawerProps {
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onStartGame: (settings: GameSettings) => void;
}

export default function SettingsDrawer({ onClose, settings, onUpdateSettings, onStartGame }: SettingsDrawerProps) {
  const updatePartial = (updates: Partial<GameSettings>) => {
    sounds.playClick();
    onUpdateSettings({ ...settings, ...updates });
  };

  const handleStartGame = () => {
    sounds.playClick();
    onStartGame(settings);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-2xl"
      />

      {/* Sheet */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-2xl bg-[#080808] rounded-t-[2.5rem] border-t border-white/10 p-8 flex flex-col gap-8 shadow-2xl overflow-hidden touch-none"
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-white/10 rounded-full self-center mb-2" />

        {/* Header */}
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase">GAME SETTINGS</h2>
          <div className="h-1 w-16 bg-primary rounded-full mt-2 shadow-[0_0_12px_#00f0ff]" />
        </div>

        {/* Settings List */}
        <div className="flex flex-col gap-4 w-full">
          {/* New Game Option */}
          <button 
            onClick={handleStartGame}
            className="w-full p-6 glass-card rounded-xl flex items-center justify-between group transition-all duration-300 border-primary/40 neon-glow-primary"
          >
            <div className="flex items-center gap-4">
              <Smartphone className="text-primary" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">NEW GAME</span>
            </div>
            <ChevronRight className="text-primary/60 group-hover:translate-x-1 transition-transform" size={20} />
          </button>

          {/* Difficulty Option */}
          <div className="p-6 glass-card rounded-xl flex items-center justify-between group border-white/5">
            <div className="flex items-center gap-4">
              <SettingsIcon className="text-secondary-container" size={24} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">DIFFICULTY</span>
                <div className="flex gap-2 mt-1">
                  {(['easy', 'med', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => updatePartial({ difficulty: d })}
                      className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border ${
                        settings.difficulty === d ? 'border-secondary-container text-secondary-container bg-secondary-container/10' : 'border-white/10 text-on-surface-variant'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player Names Option */}
          <div className="p-6 glass-card rounded-xl flex items-center justify-between group border-white/5">
            <div className="flex items-center gap-4">
              <User className="text-white" size={24} />
              <div className="flex flex-col items-start w-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">PLAYER IDENTITY</span>
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <input 
                    className="bg-transparent border-b border-white/10 text-xs py-1 focus:border-primary outline-none text-white w-full"
                    value={settings.player1Name}
                    onChange={(e) => updatePartial({ player1Name: e.target.value })}
                  />
                  {settings.mode === 'pvp' && (
                    <input 
                      className="bg-transparent border-b border-white/10 text-xs py-1 focus:border-secondary-container outline-none text-white w-full"
                      value={settings.player2Name}
                      onChange={(e) => updatePartial({ player2Name: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border border-primary/50 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-primary shadow-[0_0_5px_#00f0ff]">X</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-secondary-container/50 flex items-center justify-center bg-secondary-container/20 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-secondary-container shadow-[0_0_5px_#ff24e4]">O</span>
              </div>
            </div>
          </div>

          {/* AI vs Play with Friends Toggle */}
          <div className="p-6 glass-card rounded-xl flex items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
              <Bot className="text-primary" size={24} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">AI OPPONENT</span>
            </div>
            <button 
              onClick={() => updatePartial({ mode: settings.mode === 'ai' ? 'pvp' : 'ai' })}
              className="text-primary transition-colors"
            >
              {settings.mode === 'ai' ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-white/20" />}
            </button>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <button 
            onClick={handleStartGame}
            className="w-full py-5 bg-primary text-black rounded-xl text-[12px] font-bold uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            START MATCH
          </button>
        </div>
      </motion.div>
    </div>
  );
}
