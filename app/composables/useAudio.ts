/**
 * Composable para reproducir sonidos en la aplicación
 * Usa Web Audio API para generar tonos sin necesidad de archivos
 */

export const useAudio = () => {
  const playSound = (soundName: 'success' | 'error' | 'notification') => {
    if (!process.client) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (soundName === 'success') {
        // Sonido exitoso: dos notas ascendentes
        playTone(audioContext, 523.25, 0.1); // Do (C5)
        setTimeout(() => playTone(audioContext, 659.25, 0.1), 150); // Mi (E5)
      } else if (soundName === 'error') {
        // Sonido de error: nota baja
        playTone(audioContext, 220, 0.2); // La (A3)
      } else if (soundName === 'notification') {
        // Sonido de notificación: tono medio
        playTone(audioContext, 440, 0.15); // La (A4)
      }
    } catch (error) {
      console.warn('Error al reproducir sonido:', error);
    }
  };

  const playTone = (audioContext: AudioContext, frequency: number, duration: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  return {
    playSound
  };
};
