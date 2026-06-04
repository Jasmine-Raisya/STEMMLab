import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AdMobBanner } from '../components/AdMobBanner';

interface Props { onNavigate: (screen: number) => void; }

export function MainDashboardScreen({ onNavigate }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('common.dashboard')}</Text>
          <Text style={styles.subtitle}>{t('common.choosePath')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate(5)}>
            <Text style={styles.iconText}>Team</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate(6)}>
            <Text style={styles.iconText}>Set</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}
          onPress={() => onNavigate(7)}
          activeOpacity={0.85}
        >
          <View style={[styles.tileIcon, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.tileMarker}>STEM</Text>
          </View>
          <Text style={styles.tileTitle}>{t('common.engineering')}</Text>
          <Text style={styles.tileSubtitle}>{t('common.buildDesign')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tile, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}
          onPress={() => onNavigate(12)}
          activeOpacity={0.85}
        >
          <View style={[styles.tileIcon, { backgroundColor: '#2196F3' }]}>
            <Text style={styles.tileMarker}>MED</Text>
          </View>
          <Text style={styles.tileTitle}>{t('common.health')}</Text>
          <Text style={styles.tileSubtitle}>{t('common.wellnessCare')}</Text>
        </TouchableOpacity>
        <AdMobBanner />
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#2F3E46' },
  subtitle: { fontSize: 16, color: '#7A8A99' },
  headerButtons: { flexDirection: 'row', gap: 6 },
  iconBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: '#f3f4f6' },
  iconText: { fontSize: 12, fontWeight: '800', color: '#2F3E46' },
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
  tileMarker: { color: '#fff', fontSize: 13, fontWeight: '900' },
  tileTitle: { fontSize: 24, fontWeight: '800', color: '#2F3E46', marginBottom: 4, textAlign: 'center' },
  tileSubtitle: { fontSize: 16, color: '#7A8A99', textAlign: 'center' },
});
