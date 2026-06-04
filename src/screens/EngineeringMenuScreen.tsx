import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack: () => void;
  onSelectActivity: (screen: number) => void;
}

const activities = [
  { id: 8, titleKey: 'parachute.title', subtitleKey: 'menus.parachuteSubtitle', marker: 'Drop', color: '#FF9800', bgColor: '#FFF3E0' },
  { id: 9, titleKey: 'sound.title', subtitleKey: 'menus.soundSubtitle', marker: 'dB', color: '#0074D9', bgColor: '#E3F2FD' },
  { id: 10, titleKey: 'handFan.title', subtitleKey: 'menus.handFanSubtitle', marker: 'Fan', color: '#9C27B0', bgColor: '#F3E5F5' },
  { id: 11, titleKey: 'earthquake.title', subtitleKey: 'menus.earthquakeSubtitle', marker: 'Shake', color: '#F44336', bgColor: '#FFEBEE' },
];

export function EngineeringMenuScreen({ onBack, onSelectActivity }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{t('common.engineering')}</Text>
          <Text style={styles.subtitle}>{t('common.selectActivity')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.cardTitle}>{t(act.titleKey)}</Text>
            <Text style={styles.cardSub}>{t(act.subtitleKey)}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    padding: 12,
    width: '47%',
  },
  iconCircle: { alignItems: 'center', borderRadius: 28, height: 56, justifyContent: 'center', marginBottom: 10, width: 56 },
  marker: { color: '#fff', fontSize: 13, fontWeight: '900' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#2F3E46', textAlign: 'center', marginBottom: 2 },
  cardSub: { fontSize: 13, color: '#7A8A99', textAlign: 'center' },
});
