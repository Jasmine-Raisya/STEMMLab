import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageToggle } from '../components/LanguageToggle';
import { useButtonPress } from '../hooks/useButtonPress';
import { useFadeSlideIn } from '../hooks/useFadeSlideIn';
import { formatTeamDisplayId, useTeam } from '../services/teamContext';
import { useTheme } from '../ThemeContext';
import { brandColors, radius, typography } from '../tokens';

interface Props {
  onBack: () => void;
  onLoggedOut: () => void;
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  const knob = useRef(new Animated.Value(on ? 22 : 2)).current;

  useEffect(() => {
    Animated.timing(knob, { toValue: on ? 22 : 2, duration: 200, useNativeDriver: false }).start();
  }, [knob, on]);

  return (
    <TouchableOpacity accessibilityLabel={on ? 'Turn setting off' : 'Turn setting on'} accessibilityRole="switch" accessibilityState={{ checked: on }} onPress={onPress} style={[styles.toggle, { backgroundColor: on ? brandColors.oliveGold : brandColors.lightBorder }]}>
      <Animated.View style={[styles.knob, { left: knob }]} />
    </TouchableOpacity>
  );
}

function ScaleButton({ accessibilityLabel, children, onPress, style }: { accessibilityLabel: string; children: React.ReactNode; onPress: () => void; style: object | object[] }) {
  const press = useButtonPress();
  return (
    <Animated.View style={{ transform: [{ scale: press.scale }] }}>
      <TouchableOpacity accessibilityLabel={accessibilityLabel} accessibilityRole="button" onPress={onPress} onPressIn={press.handlePressIn} onPressOut={press.handlePressOut} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function SettingRow({ icon, index, label, on, onPress, sub }: { icon: string; index: number; label: string; on: boolean; onPress: () => void; sub: string }) {
  const { colors, theme } = useTheme();
  const anim = useFadeSlideIn(index * 60);
  const isDark = theme === 'dark';
  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, anim]}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(207,196,107,0.24)' : brandColors.oliveGold }]}>
          <Text style={[styles.rowIcon, { color: isDark ? brandColors.oliveGold : brandColors.charcoal }]}>{icon}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.rowSub, { color: colors.muted }]}>{sub}</Text>
        </View>
        <Toggle on={on} onPress={onPress} />
      </View>
    </Animated.View>
  );
}

export function SettingsScreen({ onBack, onLoggedOut }: Props) {
  const { theme, colors, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { logOutTeam, team } = useTeam();
  const isDark = theme === 'dark';
  const displayId = formatTeamDisplayId(team);
  const [gps, setGps] = useState(true);
  const [sound, setSound] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const backPress = useButtonPress();

  const rows = [
    { icon: isDark ? '☾' : '☀', label: t('common.appearance'), sub: t('common.changeAppearance'), on: isDark, onPress: toggleTheme },
    { icon: '⌖', label: t('common.gpsTagging'), sub: t('common.locationFeatures'), on: gps, onPress: () => setGps(!gps) },
    { icon: '♪', label: t('common.sound'), sub: t('common.audioFeedback'), on: sound, onPress: () => setSound(!sound) },
    { icon: '🔔', label: t('common.notifications'), sub: t('common.pushNotifications'), on: notifs, onPress: () => setNotifs(!notifs) },
  ];

  useEffect(() => {
    if (!confirmLogout) return undefined;
    const timer = setTimeout(() => setConfirmLogout(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmLogout]);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logOutTeam();
      onLoggedOut();
    } catch (error) {
      console.warn('Unable to log out team.', error);
    } finally {
      setIsLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: backPress.scale }] }}>
          <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} onPressIn={backPress.handlePressIn} onPressOut={backPress.handlePressOut} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.backIcon, { color: colors.heading }]}>‹</Text>
          </TouchableOpacity>
        </Animated.View>
        <View>
          <Text style={[styles.title, { color: colors.heading }]}>{t('common.settings')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('common.manageSettings')}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 12 }]}>{t('common.language')}</Text>
          <LanguageToggle />
        </View>

        {team && (
          <View style={[styles.teamCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{team.teamName}</Text>
            <Text style={[styles.rowSub, { color: colors.muted }]}>{team.representativeEmail}</Text>
            <Text style={[styles.teamId, { color: colors.muted }]}>{displayId}</Text>
          </View>
        )}

        {rows.map((row, index) => <SettingRow index={index} key={row.label} {...row} />)}

        <ScaleButton accessibilityLabel={t('common.logOut')} onPress={handleLogout} style={[styles.logoutButton, confirmLogout && styles.logoutConfirm, isLoggingOut && styles.logoutButtonDisabled]}>
          <Text style={styles.logoutText}>{isLoggingOut ? t('common.signingOut') : confirmLogout ? 'Tap again to confirm (3s)' : t('common.logOut')}</Text>
        </ScaleButton>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingVertical: 20 },
  backBtn: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  backIcon: { fontSize: 34, fontWeight: '700', lineHeight: 38 },
  title: { ...typography.heading2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  card: { borderRadius: radius.radiusMd, borderWidth: 1, marginBottom: 12, padding: 16 },
  teamCard: { borderLeftWidth: 4, borderRadius: radius.radiusMd, marginBottom: 12, padding: 16 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconCircle: { alignItems: 'center', borderRadius: radius.radiusMd, height: 52, justifyContent: 'center', width: 52 },
  rowIcon: { fontSize: 20, fontWeight: '900' },
  rowInfo: { flex: 1 },
  rowLabel: { ...typography.body, fontWeight: '800', marginBottom: 2 },
  rowSub: { ...typography.caption },
  teamId: { ...typography.mono, marginTop: 6 },
  toggle: { borderRadius: 14, height: 28, position: 'relative', width: 52 },
  knob: { backgroundColor: '#fff', borderRadius: 12, elevation: 2, height: 24, position: 'absolute', top: 2, width: 24 },
  logoutButton: { alignItems: 'center', backgroundColor: brandColors.coral, borderColor: brandColors.coral, borderRadius: radius.radiusMd, borderWidth: 2, justifyContent: 'center', marginBottom: 28, marginTop: 4, minHeight: 56 },
  logoutConfirm: { borderWidth: 4 },
  logoutButtonDisabled: { opacity: 0.55 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
