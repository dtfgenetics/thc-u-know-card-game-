export type GameSound = 'card' | 'draw' | 'turn' | 'win' | 'error';

let audioContext: AudioContext | undefined;

const soundNotes: Record<GameSound, number[]> = {
  card: [330],
  draw: [220, 277],
  turn: [440, 554],
  win: [523, 659, 784],
  error: [165]
};

export function playGameSound(sound: GameSound, enabled = true): void {
  if (!enabled || typeof window === 'undefined') return;

  audioContext ??= new AudioContext();
  const context = audioContext;
  void context.resume();
  const start = context.currentTime;

  soundNotes[sound].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * 0.08;
    oscillator.type = sound === 'error' ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.14);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.16);
  });
}
