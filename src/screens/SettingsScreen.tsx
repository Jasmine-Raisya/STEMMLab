import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '../components/LanguageToggle';
import { stemmColors } from '../components/ActivityScaffold';
import { useTheme } from '../ThemeContext';
import { useTeam } from '../services/teamContext';

interface Props {
  onBack: () => void;
  onLoggedOut: () => void;
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.toggle, { backgroundColor: on ? stemmColors.green : '#d1d5db' }]}
    >
      <View style={[styles.knob, { left: on ? 22 : 2 }]} />
    </TouchableOpacity>
  );
}

export function SettingsScreen({ onBack, onLoggedOut }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { logOutTeam, team } = useTeam();
  const isDark = theme === 'dark';

  const [gps, setGps] = useState(false);
  const [sound, setSound] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const bg = isDark ? '#1a1a1a' : '#fff';
  const cardBg = isDark ? '#242424' : '#fff';
  const border = isDark ? '#374151' : stemmColors.border;
  const text = isDark ? '#E0E0E0' : stemmColors.blue;
  const sub = isDark ? '#B7C0C6' : stemmColors.muted;

  const rows = [
    {
      icon: isDark ? 'Moon' : 'Sun',
      label: t('common.appearance'),
      sub: t('common.changeAppearance'),
      on: isDark,
      onPress: toggleTheme,
    },
    { icon: 'GPS', label: t('common.gpsTagging'), sub: t('common.locationFeatures'), on: gps, onPress: () => setGps(!gps) },
    { icon: 'TTS', label: t('common.sound'), sub: t('common.audioFeedback'), on: sound, onPress: () => setSound(!sound) },
    { icon: 'Bell', label: t('common.notifications'), sub: t('common.pushNotifications'), on: notifs, onPress: () => setNotifs(!notifs) },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logOutTeam();
      onLoggedOut();
    } catch (error) {
      console.warn('Unable to log out team.', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { borderColor: border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: text }]}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: text }]}>{t('common.settings')}</Text>
          <Text style={[styles.subtitle, { color: sub }]}>{t('common.manageSettings')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
          <Text style={[styles.rowLabel, { color: text, marginBottom: 12 }]}>{t('common.language')}</Text>
          <LanguageToggle />
        </View>

        {team && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <Text style={[styles.rowLabel, { color: text }]}>{team.teamName}</Text>
            <Text style={[styles.rowSub, { color: sub }]}>{t('common.teamId')}: {team.authUid ?? team.id}</Text>
            <Text style={[styles.rowSub, { color: sub }]}>{team.representativeEmail}</Text>
          </View>
        )}

        {rows.map((row) => (
          <View key={row.label} style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(11,93,76,0.24)' : stemmColors.greenSoft }]}>
                <Text style={styles.rowIcon}>{row.icon}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowLabel, { color: text }]}>{row.label}</Text>
                <Text style={[styles.rowSub, { color: sub }]}>{row.sub}</Text>
              </View>
              <Toggle on={row.on} onPress={row.onPress} />
            </View>
          </View>
        ))}

        <TouchableOpacity accessibilityRole="button" activeOpacity={0.85} onPress={handleLogout} style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}>
          <Text style={styles.logoutText}>{isLoggingOut ? t('common.signingOut') : t('common.logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backBtn: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  backIcon: { fontSize: 30, fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 16, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconCircle: { alignItems: 'center', borderRadius: 14, height: 48, justifyContent: 'center', width: 56 },
  rowIcon: { color: stemmColors.green, fontSize: 13, fontWeight: '800' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  rowSub: { fontSize: 14 },
  toggle: { borderRadius: 14, height: 28, position: 'relative', width: 48 },
  knob: { backgroundColor: '#fff', borderRadius: 12, elevation: 2, height: 24, position: 'absolute', top: 2, width: 24 },
  logoutButton: { alignItems: 'center', backgroundColor: '#d4183d', borderRadius: 14, marginBottom: 28, marginTop: 4, paddingVertical: 15 },
  logoutButtonDisabled: { opacity: 0.55 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
