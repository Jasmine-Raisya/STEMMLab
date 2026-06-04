import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AdMobBanner } from '../components/AdMobBanner';
import { useThemeColors } from '../ThemeContext';

interface Props { onNavigate: (screen: number) => void; }

export function MainDashboardScreen({ onNavigate }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.heading }]}>{t('common.dashboard')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('common.choosePath')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => onNavigate(5)}>
            <Text style={[styles.iconText, { color: colors.text }]}>Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => onNavigate(6)}>
            <Text style={[styles.iconText, { color: colors.text }]}>Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.accent }]}
          onPress={() => onNavigate(7)}
          activeOpacity={0.85}
        >
          <View style={[styles.tileIcon, { backgroundColor: colors.accent }]}>
            <Text style={styles.tileMarker}>STEM</Text>
          </View>
          <Text style={[styles.tileTitle, { color: colors.heading }]}>{t('common.engineering')}</Text>
          <Text style={[styles.tileSubtitle, { color: colors.muted }]}>{t('common.buildDesign')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.cta }]}
          onPress={() => onNavigate(12)}
          activeOpacity={0.85}
        >
          <View style={[styles.tileIcon, { backgroundColor: colors.cta }]}>
            <Text style={styles.tileMarker}>MED</Text>
          </View>
          <Text style={[styles.tileTitle, { color: colors.heading }]}>{t('common.health')}</Text>
          <Text style={[styles.tileSubtitle, { color: colors.muted }]}>{t('common.wellnessCare')}</Text>
        </TouchableOpacity>
        <AdMobBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 16 },
  headerButtons: { flexDirection: 'row', gap: 6 },
  iconBtn: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  iconText: { fontSize: 12, fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 24, gap: 16 },
  tile: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 12,
    width: 72,
  },
  tileMarker: { color: '#343133', fontSize: 13, fontWeight: '900' },
  tileTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  tileSubtitle: { fontSize: 16, textAlign: 'center' },
});
