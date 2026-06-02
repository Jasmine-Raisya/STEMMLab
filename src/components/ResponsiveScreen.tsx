import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

import { useResponsiveMetrics } from '../hooks/useResponsiveMetrics';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function ResponsiveScreen({ children, scroll = true, style }: Props) {
  const metrics = useResponsiveMetrics();
  const contentStyle = [styles.content, { padding: metrics.pagePadding, gap: metrics.gap }, style];

  if (!scroll) {
    return <View style={[styles.root, contentStyle]}>{children}</View>;
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
});
