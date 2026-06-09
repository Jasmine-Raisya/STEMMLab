import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../ThemeContext';
import { useButtonPress } from '../hooks/useButtonPress';
import { brandColors, radius, shadow, typography } from '../tokens';

export const stemmColors = {
  blue: brandColors.charcoal,
  blueSoft: brandColors.blush,
  green: brandColors.oliveGold,
  greenSoft: '#F6F1CC',
  orange: brandColors.coral,
  text: brandColors.charcoal,
  muted: brandColors.muted,
  border: brandColors.lightBorder,
  surface: '#FFF4EE',
  white: '#FFF8F3',
};

interface ActivityHeaderProps {
  title: string;
  step: number;
  total: number;
  color: string;
  onBack: () => void;
}

export function ActivityHeader({ title, step, total, color, onBack }: ActivityHeaderProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const backPress = useButtonPress();

  return (
    <View style={[headerStyles.row, { backgroundColor: colors.elevated, borderBottomColor: colors.border }]}>
      <Animated.View style={{ transform: [{ scale: backPress.scale }] }}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          onPressIn={backPress.handlePressIn}
          onPressOut={backPress.handlePressOut}
          style={[headerStyles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[headerStyles.backIcon, { color: colors.text }]}>{'‹'}</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={headerStyles.copy}>
        <Text style={[headerStyles.title, { color: colors.heading }]}>{title}</Text>
        <Text style={[headerStyles.step, { color: colors.muted }]}>{t('common.step', { step, total })}</Text>
      </View>
      <View style={headerStyles.dots}>
        {Array.from({ length: total }).map((_, index) => (
          <ProgressDot active={index + 1 === step} color={color} inactiveColor={colors.border} key={index} />
        ))}
      </View>
    </View>
  );
}

function ProgressDot({ active, color, inactiveColor }: { active: boolean; color: string; inactiveColor: string }) {
  const width = useRef(new Animated.Value(active ? 24 : 10)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: active ? 24 : 10,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [active, width]);

  return <Animated.View style={[headerStyles.dot, { backgroundColor: active ? color : inactiveColor, width }]} />;
}

export function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();

  return (
    <View style={listStyles.wrap}>
      {items.map((item) => (
        <View key={item} style={listStyles.row}>
          <View style={listStyles.bullet} />
          <Text style={[listStyles.text, { color: colors.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...shadow,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: radius.radiusMd,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backIcon: { fontSize: 34, fontWeight: '700', lineHeight: 38 },
  copy: { flex: 1 },
  title: { ...typography.heading3 },
  step: { ...typography.caption, marginTop: 2 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { borderRadius: 5, height: 10, width: 10 },
});

const listStyles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  bullet: {
    backgroundColor: brandColors.oliveGold,
    borderRadius: 5,
    height: 10,
    marginTop: 7,
    width: 10,
  },
  text: { ...typography.body, flex: 1, lineHeight: 23 },
});
