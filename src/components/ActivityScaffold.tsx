import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../ThemeContext';

export const stemmColors = {
  blue: '#343133',
  blueSoft: '#FFEBF3',
  green: '#CFC46B',
  greenSoft: '#F6F1CC',
  orange: '#F5674D',
  text: '#343133',
  muted: '#806E63',
  border: '#D5C8BE',
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

  return (
    <View style={[headerStyles.row, { backgroundColor: colors.elevated, borderBottomColor: colors.border }]}>
      <TouchableOpacity accessibilityRole="button" onPress={onBack} style={[headerStyles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[headerStyles.backIcon, { color: colors.text }]}>{'<'}</Text>
      </TouchableOpacity>
      <View style={headerStyles.copy}>
        <Text style={[headerStyles.title, { color: colors.heading }]}>{title}</Text>
        <Text style={[headerStyles.step, { color: colors.muted }]}>{t('common.step', { step, total })}</Text>
      </View>
      <View style={headerStyles.dots}>
        {Array.from({ length: total }).map((_, index) => (
          <View key={index} style={[headerStyles.dot, { backgroundColor: index + 1 === step ? color : colors.border }]} />
        ))}
      </View>
    </View>
  );
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
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backIcon: { fontSize: 30, fontWeight: '700', lineHeight: 34 },
  copy: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800' },
  step: { fontSize: 16, marginTop: 2 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { borderRadius: 5, height: 10, width: 10 },
});

const listStyles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  bullet: {
    backgroundColor: stemmColors.green,
    borderRadius: 5,
    height: 10,
    marginTop: 7,
    width: 10,
  },
  text: { flex: 1, fontSize: 16, lineHeight: 23 },
});
