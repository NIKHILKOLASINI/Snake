import { useState, useEffect, useRef, useCallback } from 'react';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 150;

// Web Audio Synth for Neon Vibes
const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.1) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
};

export function SnakeGame({ onScoreChange, onGameOver }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const directionRef = useRef(INITIAL_DIRECTION);
  const nextDirectionRef = useRef(INITIAL_DIRECTION);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const requestRef = useRef<number>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  const generateFood = useCallback((currentSnake: { x: number, y: number }[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameOver(false);
    setIsPaused(true);
    onScoreChange(0);
    playTone(220, 'square', 0.2);
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      // Update direction from queue
      directionRef.current = nextDirectionRef.current;
      
      const head = {
        x: prevSnake[0].x + directionRef.current.x,
        y: prevSnake[0].y + directionRef.current.y,
      };

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsGameOver(true);
        onGameOver(score);
        playTone(110, 'sawtooth', 0.5);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        onGameOver(score);
        playTone(110, 'sawtooth', 0.5);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 10;
        setScore(newScore);
        onScoreChange(newScore);
        setFood(generateFood(newSnake));
        setSpeed(prev => Math.max(prev - 2, 60));
        playTone(440 + score, 'sine', 0.15); // Higher pitch as score grows
        return newSnake;
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, isGameOver, isPaused, score, onScoreChange, onGameOver, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y === 0) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (currentDir.y === 0) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (currentDir.x === 0) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (currentDir.x === 0) nextDirectionRef.current = { x: 1, y: 0 };
          break;
        case ' ':
          if (!isGameOver) setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  const animate = useCallback((time: number) => {
    if (!isPaused && !isGameOver) {
      if (lastUpdateTimeRef.current === 0) lastUpdateTimeRef.current = time;
      const progress = time - lastUpdateTimeRef.current;

      if (progress > speed) {
        moveSnake();
        lastUpdateTimeRef.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isPaused, isGameOver, speed, moveSnake]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid (Cyberpunk style)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE); ctx.stroke();
    }

    // Food
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f472b6';
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.roundRect(food.x * CELL_SIZE + 4, food.y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8, 4);
    ctx.fill();

    // Snake
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowBlur = isHead ? 25 : 10;
      ctx.shadowColor = isHead ? '#22d3ee' : '#0891b2';
      ctx.fillStyle = isHead ? '#22d3ee' : '#0891b2';
      
      const p = 2;
      ctx.beginPath();
      ctx.roundRect(segment.x * CELL_SIZE + p, segment.y * CELL_SIZE + p, CELL_SIZE - p*2, CELL_SIZE - p*2, 4);
      ctx.fill();
    });

  }, [snake, food]);

  return (
    <div className="relative isolate perspective-[1000px] h-full flex items-center justify-center">
      <div 
        className="relative transition-transform duration-700 ease-out preserve-3d"
        style={{ 
          transform: `rotateX(20deg) rotateY(0deg) ${isPaused || isGameOver ? 'translateZ(0px)' : 'translateZ(20px)'}`,
        }}
      >
        {/* Glow behind the board */}
        <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full opacity-50 pointer-events-none" />
        
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5),0_18px_36px_-18px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] bg-black/60 transition-all duration-500 border border-white/10"
          style={{ 
            filter: isPaused || isGameOver ? 'blur(2px) grayscale(0.3)' : 'none',
          }}
        />

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      </div>
      
      {isPaused && !isGameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[3px] rounded-2xl z-20">
          <button
            id="init-system-button"
            onClick={() => {
              setIsPaused(false);
              playTone(330, 'sine', 0.1);
            }}
            className="group relative px-12 py-5 bg-slate-900 text-white font-black rounded-2xl border-b-4 border-fuchsia-700 active:border-b-0 active:translate-y-[4px] transition-all shadow-[0_10px_0_0_rgba(162,28,175,1),0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="absolute inset-0 bg-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <span className="relative uppercase tracking-[0.4em] text-xs flex items-center gap-3">
              <span className="w-2 h-2 bg-fuchsia-500 rounded-full animate-ping" />
              Initialize System
            </span>
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black/60 backdrop-blur-xl rounded-2xl z-20">
          <div className="text-center space-y-2">
            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
              CRITICAL <span className="text-fuchsia-500">FAILURE</span>
            </h2>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
            <p className="text-cyan-400 text-[10px] uppercase tracking-[0.8em] font-bold">Neural Protocol Terminated</p>
          </div>
          <button
            onClick={resetGame}
            className="px-12 py-4 bg-white text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all hover:scale-110 active:scale-95 uppercase tracking-[0.3em] text-xs shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Reboot Link
          </button>
        </div>
      )}
    </div>
  );
}

