import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';

import { stemmColors } from './ActivityScaffold';
import { SensorSample } from '../types/models';
import { useResponsiveMetrics } from '../hooks/useResponsiveMetrics';
import { useThemeColors } from '../ThemeContext';

interface Props {
  samples: SensorSample[];
  label: string;
  color?: string;
}

export function SensorLineChart({ samples, label, color = stemmColors.green }: Props) {
  const metrics = useResponsiveMetrics();
  const colors = useThemeColors();
  const height = metrics.chartHeight;
  const width = Math.max(280, metrics.width - metrics.pagePadding * 2 - 32);
  const values = samples.map((sample) => sample.value);
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - (value / max) * (height - 16) - 8;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.heading }]}>{label}</Text>
        <Text style={styles.value}>{values.at(-1)?.toFixed(2) ?? '0.00'}</Text>
      </View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#DDE8EE" strokeWidth="1" />
        {points.length > 0 && <Polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '800' },
  value: { color: stemmColors.green, fontSize: 18, fontWeight: '900' },
});
