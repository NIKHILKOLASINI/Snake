/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Gamepad2, Volume2, Trophy } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('snake-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setHighScore(prev => {
      if (finalScore > prev) {
        localStorage.setItem('snake-high-score', finalScore.toString());
        return finalScore;
      }
      return prev;
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-cyan-50 font-mono selection:bg-fuchsia-500/30 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start h-screen max-h-[900px]">
        {/* Left Column: Game Area */}
        <div className="flex flex-col gap-6 h-full">
          <header className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-fuchsia-500/20 rounded-lg border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                <Gamepad2 className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase italic">
                Neon <span className="text-fuchsia-500">Wave</span>
              </h1>
            </div>
            
            <div className="flex gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Score</span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums shadow-cyan-400/20 drop-shadow-md">
                  {score.toString().padStart(4, '0')}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40">High Score</span>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span className="text-xl font-bold text-white tabular-nums">
                    {highScore.toString().padStart(4, '0')}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm p-4 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-cyan-500/5 pointer-events-none" />
            <SnakeGame onScoreChange={setScore} onGameOver={handleGameOver} />
          </div>
        </div>

        {/* Right Column: Music & Info */}
        <div className="flex flex-col gap-6 h-full">
          <section className="bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-white/60">Neural Systems Player</h2>
            </div>
            <MusicPlayer />
          </section>

          <section className="flex-1 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                  Controls
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: '↑↓←→', desc: 'Movement' },
                    { key: 'Space', desc: 'Pause Game' },
                  ].map(({ key, desc }) => (
                    <div key={key} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-cyan-400 text-sm font-bold mb-1">{key}</div>
                      <div className="text-white/40 text-[10px] uppercase tracking-wider">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-white/40 border-b border-white/5 pb-2">
                    <span>GRID_RESOLUTION</span>
                    <span className="text-cyan-400">20x20_PX</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/40 border-b border-white/5 pb-2">
                    <span>AUDIO_ENGINE</span>
                    <span className="text-fuchsia-400">VIRTUAL_SYNTH_H1</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/40 border-b border-white/5 pb-2">
                    <span>LATENCY</span>
                    <span className="text-lime-400">0.42_MS</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
