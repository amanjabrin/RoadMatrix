import { useTheme } from 'next-themes';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';
  return {
    axisStroke: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(55,65,81,0.8)',
    tickFill: isDark ? '#94a3b8' : '#374151',
    gridStroke: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
    tooltipText: isDark ? '#e2e8f0' : '#1e293b',
  };
}
