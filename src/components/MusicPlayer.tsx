import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
}

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyberpunk City',
    artist: 'Neural Systems',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a16744.mp3',
    duration: '03:42'
  },
  {
    id: '2',
    title: 'Neon Pulse',
    artist: 'Synthwave Gen-AI',
    url: 'https://cdn.pixabay.com/audio/2021/11/24/audio_349d4432a6.mp3',
    duration: '02:15'
  },
  {
    id: '3',
    title: 'Deep Space Synth',
    artist: 'Orbital Echo',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_24e3a4798b.mp3',
    duration: '04:05'
  }
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio playback blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  const handleNext = () => {
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="flex flex-col gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
      />

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-gradient-to-br from-fuchsia-600 to-cyan-600 rounded-xl flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(217,70,239,0.2)]">
          <Music className="w-8 h-8 text-white/80 z-10" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          {isPlaying && (
            <div className="absolute bottom-1 left-1 right-1 flex items-end justify-center gap-0.5 h-6">
              {[0, 1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1 bg-white/50"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white truncate leading-tight">{currentTrack.title}</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest mt-1">{currentTrack.artist}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={handlePrev} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center bg-cyan-400 text-slate-950 rounded-full hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-white/20">
          <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2 mb-2">
            <ListMusic className="w-3 h-3 text-white/40" />
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Queue</span>
        </div>
        {TRACKS.map((track, idx) => (
          <button
            key={track.id}
            onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
            }}
            className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between group transition-colors ${
              currentTrackIndex === idx ? 'bg-fuchsia-500/10 text-fuchsia-400' : 'hover:bg-white/5 text-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="opacity-40 font-mono w-4">0{idx + 1}</span>
              <span className="font-bold truncate">{track.title}</span>
            </div>
            <span className="opacity-0 group-hover:opacity-40 transition-opacity font-mono">{track.duration}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
