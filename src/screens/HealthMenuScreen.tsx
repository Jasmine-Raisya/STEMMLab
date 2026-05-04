import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack: () => void;
  onSelectActivity: (screen: number) => void;
}

const activities = [
  { id: 13, titleKey: 'humanPerformance.title', subtitleKey: 'menus.humanPerformanceSubtitle', marker: 'Move', color: '#0074D9', bgColor: '#E3F2FD' },
  { id: 14, titleKey: 'reaction.title', subtitleKey: 'menus.reactionBoardSubtitle', marker: 'Tap', color: '#9C27B0', bgColor: '#F3E5F5' },
  { id: 15, titleKey: 'breathing.title', subtitleKey: 'menus.breathingSubtitle', marker: 'Air', color: '#FF9800', bgColor: '#FFF3E0' },
];

export function HealthMenuScreen({ onBack, onSelectActivity }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{t('common.health')}</Text>
          <Text style={styles.subtitle}>{t('common.selectActivity')}</Text>
        </View>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {activities.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={[styles.card, { backgroundColor: act.bgColor, borderColor: act.color }]}
            onPress={() => onSelectActivity(act.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: act.color }]}>
              <Text style={styles.marker}>{act.marker}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{t(act.titleKey)}</Text>
              <Text style={styles.cardSub}>{t(act.subtitleKey)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  backIcon: { color: '#2F3E46', fontSize: 30, fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 24, fontWeight: '800', color: '#2F3E46' },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  list: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  card: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    padding: 18,
  },
  iconCircle: { alignItems: 'center', borderRadius: 30, height: 60, justifyContent: 'center', width: 60 },
  marker: { color: '#fff', fontSize: 13, fontWeight: '900' },
  info: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#2F3E46', marginBottom: 2 },
  cardSub: { fontSize: 15, color: '#7A8A99' },
});
