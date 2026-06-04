import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { stemmColors } from '../components/ActivityScaffold';
import { useThemeColors } from '../ThemeContext';

interface Props {
  onBack: () => void;
  onSelectActivity: (screen: number) => void;
}

const activities = [
  { id: 13, titleKey: 'humanPerformance.title', subtitleKey: 'menus.humanPerformanceSubtitle', marker: 'Move', color: stemmColors.green },
  { id: 14, titleKey: 'reaction.title', subtitleKey: 'menus.reactionBoardSubtitle', marker: 'Tap', color: '#9C27B0' },
  { id: 15, titleKey: 'breathing.title', subtitleKey: 'menus.breathingSubtitle', marker: 'Air', color: stemmColors.orange },
];

export function HealthMenuScreen({ onBack, onSelectActivity }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.elevated, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.backIcon, { color: colors.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: colors.heading }]}>{t('common.health')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('common.selectActivity')}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {activities.map((activity) => (
          <TouchableOpacity key={activity.id} style={[styles.card, { backgroundColor: colors.elevated, borderColor: colors.border }]} onPress={() => onSelectActivity(activity.id)} activeOpacity={0.85}>
            <View style={[styles.icon, { backgroundColor: activity.color }]}>
              <Text style={styles.iconText}>{activity.marker}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t(activity.titleKey)}</Text>
              <Text style={[styles.cardSub, { color: colors.muted }]}>{t(activity.subtitleKey)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingVertical: 20 },
  backBtn: { alignItems: 'center', borderRadius: 14, borderWidth: 1, height: 44, justifyContent: 'center', width: 44 },
  backIcon: { fontSize: 30, fontWeight: '800', lineHeight: 34 },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 15, marginTop: 2 },
  content: { gap: 12, padding: 24 },
  card: { alignItems: 'center', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 14, padding: 16 },
  icon: { alignItems: 'center', borderRadius: 8, height: 58, justifyContent: 'center', width: 58 },
  iconText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  copy: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  cardSub: { fontSize: 14, marginTop: 2 },
});
