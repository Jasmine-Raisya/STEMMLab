import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export const stemmColors = {
  blue: '#0B2742',
  blueSoft: '#E8F2FA',
  green: '#0B5D4C',
  greenSoft: '#E6F4EF',
  orange: '#F08A24',
  text: '#12313F',
  muted: '#586A73',
  border: '#C9D7DE',
  surface: '#F7FAFC',
  white: '#FFFFFF',
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

  return (
    <View style={headerStyles.row}>
      <TouchableOpacity accessibilityRole="button" onPress={onBack} style={headerStyles.backButton}>
        <Text style={headerStyles.backIcon}>‹</Text>
      </TouchableOpacity>
      <View style={headerStyles.copy}>
        <Text style={headerStyles.title}>{title}</Text>
        <Text style={headerStyles.step}>{t('common.step', { step, total })}</Text>
      </View>
      <View style={headerStyles.dots}>
        {Array.from({ length: total }).map((_, index) => (
          <View key={index} style={[headerStyles.dot, { backgroundColor: index + 1 === step ? color : '#D8E1E6' }]} />
        ))}
      </View>
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={listStyles.wrap}>
      {items.map((item) => (
        <View key={item} style={listStyles.row}>
          <View style={listStyles.bullet} />
          <Text style={listStyles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: stemmColors.white,
    borderBottomColor: stemmColors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    borderColor: stemmColors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backIcon: { color: stemmColors.blue, fontSize: 30, fontWeight: '700', lineHeight: 34 },
  copy: { flex: 1 },
  title: { color: stemmColors.blue, fontSize: 20, fontWeight: '800' },
  step: { color: stemmColors.muted, fontSize: 16, marginTop: 2 },
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
  text: { color: stemmColors.text, flex: 1, fontSize: 16, lineHeight: 23 },
});
