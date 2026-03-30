/**
 * Composable simple para gestionar preset de tema rosa
 * Solo toggle basic entre soft e intense
 */

type ThemePreset = 'soft' | 'intense';

export const useThemePreset = () => {
  const currentPreset = useState<ThemePreset>('theme-preset', () => {
    if (process.client) {
      return (localStorage.getItem('theme-preset') as ThemePreset) || 'soft';
    }
    return 'soft';
  });

  const setPreset = (preset: ThemePreset) => {
    currentPreset.value = preset;
    if (process.client) {
      localStorage.setItem('theme-preset', preset);
    }
  };

  const togglePreset = () => {
    setPreset(currentPreset.value === 'soft' ? 'intense' : 'soft');
  };

  return {
    currentPreset: readonly(currentPreset),
    setPreset,
    togglePreset,
    availablePresets: ['soft', 'intense'] as const
  };
};


