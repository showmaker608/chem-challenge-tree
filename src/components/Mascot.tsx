type Mood = 'idle' | 'happy' | 'sad' | 'fire' | 'wow';

interface MascotProps {
  mood: Mood;
  size?: 'sm' | 'md';
}

const SRC: Record<Mood, string> = {
  idle: '/avatars/flask-idle.svg',
  happy: '/avatars/flask-happy.svg',
  sad: '/avatars/flask-sad.svg',
  fire: '/avatars/flask-fire.svg',
  wow: '/avatars/flask-wow.svg',
};

const moodAnim: Record<Mood, string> = {
  idle: 'animate-float',
  happy: 'animate-bounce-in',
  sad: 'animate-shake',
  fire: 'animate-pulse-glow',
  wow: 'animate-wow',
};

const sizeClass: Record<NonNullable<MascotProps['size']>, string> = {
  sm: 'h-12 w-12',
  md: 'h-20 w-20',
};

export function Mascot({ mood, size = 'md' }: MascotProps) {
  return (
    <div className="relative flex items-end justify-center">
      <span className="absolute bottom-0 h-3 w-10 rounded-full bg-sky-900/15 blur-[1px]" />
      <img
        key={mood}
        src={SRC[mood]}
        alt=""
        className={`relative z-10 ${sizeClass[size]} object-contain transition-all duration-300 drop-shadow-md ${moodAnim[mood]}`}
      />
      {/* 答对时的小星星 */}
      {(mood === 'happy' || mood === 'wow') && (
        <>
          <span className="absolute -top-1 -right-1 text-amber-400 animate-ping text-xs">✨</span>
          <span className="absolute -top-2 left-0 text-amber-300 animate-ping text-xs" style={{ animationDelay: '0.2s' }}>⭐</span>
        </>
      )}
      {mood === 'fire' && (
        <span className="absolute -top-2 -right-1 text-orange-400 animate-bounce text-sm">🔥</span>
      )}
    </div>
  );
}
