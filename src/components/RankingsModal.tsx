import { motion } from 'motion/react';
import { X, Trophy, Crown, Star, History } from 'lucide-react';
import { SeriesRecord } from '../App';

interface RankingsModalProps {
  onClose: () => void;
  history: SeriesRecord[];
}

export default function RankingsModal({ onClose, history }: RankingsModalProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-20 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card w-full max-w-lg rounded-3xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <History className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">Battle Log</h2>
              <p className="text-[10px] text-primary tracking-[0.2em] font-medium uppercase opacity-60">Past Series</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <Star size={48} className="mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">No Battles Yet</p>
              <p className="text-[10px] mt-2">Finish a match series to see log.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-mono text-white/30 truncate">
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 rounded border font-bold tracking-widest uppercase ${
                      record.mode === 'ai' ? 'border-primary/30 text-primary' : 'border-secondary-container/30 text-secondary-container'
                    }`}>
                      {record.mode === 'ai' ? 'Vs System' : 'PvP Match'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${record.winner === record.p1Name ? 'text-primary' : 'text-white/60'}`}>
                          {record.p1Name}
                        </span>
                        {record.winner === record.p1Name && <Crown size={12} className="text-primary" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${record.winner === record.p2Name ? 'text-secondary-container' : 'text-white/60'}`}>
                          {record.p2Name}
                        </span>
                        {record.winner === record.p2Name && <Crown size={12} className="text-secondary-container" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                      <span className="text-lg font-black text-white">{record.p1Score}</span>
                      <span className="text-xs text-white/20">:</span>
                      <span className="text-lg font-black text-white">{record.p2Score}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 border-t border-white/5 text-center">
          <button 
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary hover:text-primary-on-container transition-colors"
          >
            Settle the Score
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
