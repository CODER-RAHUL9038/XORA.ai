import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Volume2, VolumeX, RefreshCcw, Home, X as XIcon, Circle, Zap, Edit2, Check } from 'lucide-react';
import { GameSettings } from '../App';
import WinnerModal from './WinnerModal';
import { sounds } from '../services/soundService';
import { AIService } from '../services/aiService';

interface GameScreenProps {
  settings: GameSettings;
  onBackToMenu: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  onAddSeriesHistory: (record: any) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

type Player = 'X' | 'O' | null;

export default function GameScreen({ 
  settings, 
  onBackToMenu,
  isMuted,
  setIsMuted,
  onAddSeriesHistory,
  onUpdateSettings
}: GameScreenProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [matchCount, setMatchCount] = useState(1);
  const [editingP1, setEditingP1] = useState(false);
  const [editingP2, setEditingP2] = useState(false);
  const [tempP1Name, setTempP1Name] = useState(settings.player1Name);
  const [tempP2Name, setTempP2Name] = useState(settings.player2Name);

  useEffect(() => {
    sounds.playMatchStart();
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMute(nextMuted);
    if (!nextMuted) sounds.playClick();
  };

  const checkWinner = useCallback((squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    if (squares.every(s => s !== null)) {
      return { winner: 'Draw' as const, line: null };
    }
    return null;
  }, []);

  const makeMove = useCallback((index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    
    if (isXNext) sounds.playMoveX();
    else sounds.playMoveO();
    
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      
      // Update scores
      let newScores = { ...scores };
      let matchWinnerName = '';
      let matchWinnerSymbol: 'X' | 'O' | null = null;

      if (result.winner === 'X') {
        newScores.p1 += 1;
      } else if (result.winner === 'O') {
        newScores.p2 += 1;
      } else {
        newScores.draws += 1;
        sounds.playDraw();
      }
      setScores(newScores);

      const hasSeriesWinner = newScores.p1 >= 6 || newScores.p2 >= 6;

      if (hasSeriesWinner) {
        onAddSeriesHistory({
          p1Name: settings.player1Name,
          p2Name: settings.player2Name,
          p1Score: newScores.p1,
          p2Score: newScores.p2,
          winner: newScores.p1 >= 6 ? settings.player1Name : settings.player2Name,
          mode: settings.mode
        });
      }

      if (result.line) {
        sounds.playWin(); // Play only dog sound for every match win

        setTimeout(() => {
          if (hasSeriesWinner) {
            setShowWinnerModal(true);
          } else {
            // Auto reset for next match in series after the 2s delay
            setBoard(Array(9).fill(null));
            setWinner(null);
            setWinningLine(null);
            setIsXNext(true);
            setMatchCount(prev => prev + 1);
          }
        }, 2000); // 2 second delay as requested
      } else if (result.winner === 'Draw') {
        setTimeout(() => {
          // Draws don't end the series usually, just move to next match
          setBoard(Array(9).fill(null));
          setWinner(null);
          setWinningLine(null);
          setIsXNext(true);
          setMatchCount(prev => prev + 1);
        }, 1000);
      }
    } else {
      setIsXNext(!isXNext);
    }
  }, [board, isXNext, winner, checkWinner]);

  // AI Logic
  useEffect(() => {
    if (!isXNext && settings.mode === 'ai' && !winner) {
      const timer = setTimeout(() => {
        const aiMove = AIService.getBestMove(board, settings.difficulty, 'O');
        if (aiMove !== -1) {
          makeMove(aiMove);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, winner, settings.mode, settings.difficulty, makeMove]);

  const resetSeries = () => {
    sounds.playMatchStart();
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setShowWinnerModal(false);
    setScores({ p1: 0, p2: 0, draws: 0 });
    setMatchCount(1);
  };

  const handleBackToMenu = () => {
    sounds.playClick();
    onBackToMenu();
  };

  const getStatusColorClasses = () => {
    if (winner === 'X') return "border-primary/50 bg-primary/5 text-primary";
    if (winner === 'O') return "border-[#ff24e4]/50 bg-[#ff24e4]/5 text-[#ff24e4]";
    if (winner === 'Draw') return "border-white/20 bg-white/5 text-white";
    return isXNext 
      ? "border-primary/50 bg-primary/5 text-primary" 
      : "border-[#ff24e4]/50 bg-[#ff24e4]/5 text-[#ff24e4]";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-mesh z-0 pointer-events-none opacity-40" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary-container/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Grid className="text-primary" size={20} />
          <h1 className="text-lg font-bold tracking-tighter text-primary">Xora.ai</h1>
        </div>
        <button 
          onClick={toggleMute}
          className={`p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer ${isMuted ? 'text-red-500/50' : 'text-primary'}`}
        >
          {isMuted ? <VolumeX className="text-red-500/50" size={20} /> : <Volume2 className="text-primary" size={20} />}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-20 pb-20 px-4 relative z-10 w-full">
        {/* Turn Indicator */}
        <div className="mb-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-6 py-2 rounded-full border transition-all duration-300 ${getStatusColorClasses()}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Match {matchCount} • {winner ? (winner === 'Draw' ? 'GAME DRAWN' : `${winner === 'X' ? settings.player1Name : settings.player2Name} WINS!`) : (isXNext ? `${settings.player1Name}'S TURN` : `${settings.player2Name}'S TURN`)}
            </p>
          </motion.div>
          <motion.div 
            animate={{ 
              x: winner ? 0 : (isXNext ? -20 : 20),
              opacity: winner ? 0 : 1,
              boxShadow: isXNext ? "0 0 15px #00f0ff" : "0 0 15px #ff24e4",
              backgroundColor: isXNext ? "#00f0ff" : "#ff24e4"
            }}
            className="h-1 w-8 rounded-full mt-4 transition-all duration-500" 
          />
        </div>

        {/* Board */}
        <div className="relative w-full max-w-[360px] aspect-square overflow-hidden rounded-lg bg-black/20 p-2 border border-white/5 shadow-2xl">
           {/* Grid Lines */}
           <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              <div className="absolute left-2/3 top-0 bottom-0 w-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              <div className="absolute top-1/3 left-0 right-0 h-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
              <div className="absolute top-2/3 left-0 right-0 h-[2px] bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
           </div>

           {/* Winning Strike Strike */}
           <div className="absolute inset-0 z-20 pointer-events-none">
             {winningLine && (
                <WinningStrike line={winningLine} winner={winner as Player} />
             )}
           </div>

           {/* Cells */}
           <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 z-10">
              {board.map((cell, i) => {
                const isWinningCell = winningLine?.includes(i);
                return (
                  <div 
                    key={i} 
                    onClick={() => makeMove(i)}
                    className="flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors relative group"
                  >
                    <AnimatePresence>
                      {cell === 'X' && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0, rotate: -40 }}
                          animate={{ 
                            scale: isWinningCell ? [1, 1.15, 1] : 1, 
                            opacity: 1, 
                            rotate: 0,
                            filter: isWinningCell ? "drop-shadow(0 0 15px #00f0ff)" : "none"
                          }}
                          transition={isWinningCell ? { 
                            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            default: { duration: 0.3 }
                          } : { duration: 0.3 }}
                          className="text-primary neon-text-primary"
                        >
                          <XIcon size={64} className="stroke-[1.5px]" />
                        </motion.div>
                      )}
                      {cell === 'O' && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ 
                            scale: isWinningCell ? [1, 1.15, 1] : 1, 
                            opacity: 1,
                            filter: isWinningCell ? "drop-shadow(0 0 20px #ff24e4)" : "drop-shadow(0 0 10px #ff24e466)"
                          }}
                          transition={isWinningCell ? { 
                            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                            default: { duration: 0.3 }
                          } : { duration: 0.3 }}
                          className="text-white"
                        >
                          <Circle size={56} className="stroke-[1.5px] text-[#ff24e4]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Scoreboard */}
        <section className="mt-12 w-full max-w-[360px]">
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex justify-between items-center backdrop-blur-sm shadow-xl">
            <div className="flex flex-col items-center gap-1 flex-1">
              {editingP1 ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempP1Name}
                    onChange={(e) => setTempP1Name(e.target.value)}
                    onBlur={() => {
                      onUpdateSettings({ player1Name: tempP1Name });
                      setEditingP1(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateSettings({ player1Name: tempP1Name });
                        setEditingP1(false);
                      }
                    }}
                    autoFocus
                    className="bg-white/10 border-b border-primary text-[10px] font-bold text-primary uppercase tracking-widest w-20 text-center focus:outline-none"
                  />
                  <Check size={10} className="text-primary cursor-pointer" onClick={() => {
                    onUpdateSettings({ player1Name: tempP1Name });
                    setEditingP1(false);
                  }} />
                </div>
              ) : (
                <div 
                  className="flex items-center gap-1 cursor-pointer group"
                  onClick={() => setEditingP1(true)}
                >
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">{settings.player1Name} (X)</p>
                  <Edit2 size={8} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                </div>
              )}
              <p className="text-2xl font-bold text-primary neon-text-primary">{scores.p1}</p>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Draws</p>
              <p className="text-2xl font-bold text-white">{scores.draws}</p>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex flex-col items-center gap-1 flex-1">
              {settings.mode === 'pvp' ? (
                editingP2 ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={tempP2Name}
                      onChange={(e) => setTempP2Name(e.target.value)}
                      onBlur={() => {
                        onUpdateSettings({ player2Name: tempP2Name });
                        setEditingP2(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateSettings({ player2Name: tempP2Name });
                          setEditingP2(false);
                        }
                      }}
                      autoFocus
                      className="bg-white/10 border-b border-[#ff24e4] text-[10px] font-bold text-[#ff24e4] uppercase tracking-widest w-20 text-center focus:outline-none"
                    />
                    <Check size={10} className="text-[#ff24e4] cursor-pointer" onClick={() => {
                      onUpdateSettings({ player2Name: tempP2Name });
                      setEditingP2(false);
                    }} />
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-1 cursor-pointer group"
                    onClick={() => setEditingP2(true)}
                  >
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest group-hover:text-[#ff24e4] transition-colors">{settings.player2Name} (O)</p>
                    <Edit2 size={8} className="text-on-surface-variant/40 group-hover:text-[#ff24e4] transition-colors" />
                  </div>
                )
              ) : (
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{settings.player2Name} (O)</p>
              )}
              <p className="text-2xl font-bold text-secondary-container drop-shadow-[0_0_10px_#ff24e4]">{scores.p2}</p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex gap-4 w-full max-w-[360px]">
          <button 
            onClick={resetSeries}
            className="flex-1 bg-primary/10 border border-primary/30 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/20 transition-all active:scale-[0.98]"
          >
            <RefreshCcw size={16} className="text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Reset Series</span>
          </button>
          <button 
            onClick={handleBackToMenu}
            className="flex-1 bg-white/5 border border-white/10 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <Home size={16} className="text-on-surface" />
            <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Menu</span>
          </button>
        </div>
      </main>

      {/* Winner Modal Overlay */}
      <AnimatePresence>
        {showWinnerModal && winner && (
          <WinnerModal 
            winner={winner} 
            winnerName={winner === 'X' ? settings.player1Name : settings.player2Name}
            onPlayAgain={resetSeries}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WinningStrike({ line, winner }: { line: number[], winner: Player }) {
  const isX = winner === 'X';
  const color = isX ? "#00f0ff" : "#ff24e4";
  
  // Normalized coordinates (0-100) for grid centers
  const coords = [16.66, 50, 83.33];
  
  const sortedLine = [...line].sort((a, b) => a - b);
  const p1 = { x: coords[sortedLine[0] % 3], y: coords[Math.floor(sortedLine[0] / 3)] };
  const p2 = { x: coords[sortedLine[2] % 3], y: coords[Math.floor(sortedLine[2] / 3)] };

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-50"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Outer Glow */}
      <motion.line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.4 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ filter: `blur(8px)` }}
      />
      {/* Core Laser */}
      <motion.line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
      {/* Sparkles at centers */}
      {line.map((idx) => {
        const cx = coords[idx % 3];
        const cy = coords[Math.floor(idx / 3)];
        return (
          <motion.circle
            key={idx}
            cx={cx}
            cy={cy}
            r="1.5"
            fill="white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
            transition={{ delay: 0.3 + (line.indexOf(idx) * 0.1), duration: 0.5 }}
          />
        );
      })}
    </svg>
  );
}
