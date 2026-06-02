import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useResponsiveMetrics() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const compact = width < 380 || height < 720;
    const tablet = width >= 768;
    return {
      width,
      height,
      compact,
      tablet,
      pagePadding: compact ? 16 : tablet ? 32 : 20,
      gap: compact ? 10 : 14,
      buttonHeight: compact ? 48 : 54,
      chartHeight: compact ? 140 : tablet ? 240 : 180,
    };
  }, [height, width]);
}
