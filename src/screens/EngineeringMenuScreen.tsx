import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { stemmColors } from '../components/ActivityScaffold';
import { useButtonPress } from '../hooks/useButtonPress';
import { useFadeSlideIn } from '../hooks/useFadeSlideIn';
import { useThemeColors } from '../ThemeContext';
import { brandColors, radius, typography } from '../tokens';

interface Props {
  onBack: () => void;
  onSelectActivity: (screen: number) => void;
}

const activities = [
  { id: 8, titleKey: 'parachute.title', subtitleKey: 'menus.parachuteSubtitle', marker: 'Drop', color: stemmColors.orange },
  { id: 9, titleKey: 'sound.title', subtitleKey: 'menus.soundSubtitle', marker: 'dB', color: brandColors.oliveGold },
  { id: 10, titleKey: 'handFan.title', subtitleKey: 'menus.handFanSubtitle', marker: 'Fan', color: '#9C27B0' },
  { id: 11, titleKey: 'earthquake.title', subtitleKey: 'menus.earthquakeSubtitle', marker: 'Shake', color: stemmColors.green },
];

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

function ActivityCard({ activity, index, onPress }: { activity: (typeof activities)[number]; index: number; onPress: () => void }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const anim = useFadeSlideIn(index * 80);
  return (
    <Animated.View style={anim}>
      <ScaleButton accessibilityLabel={t(activity.titleKey)} onPress={onPress} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: activity.color }]}>
          <Text style={styles.iconText}>{activity.marker}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.cardTitle, { color: colors.heading }]}>{t(activity.titleKey)}</Text>
          <Text style={[styles.cardSub, { color: colors.muted }]}>{t(activity.subtitleKey)}</Text>
        </View>
        <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
      </ScaleButton>
    </Animated.View>
  );
}

export function EngineeringMenuScreen({ onBack, onSelectActivity }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const backPress = useButtonPress();
  const listX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.timing(listX, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  }, [listX]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Animated.View style={{ transform: [{ scale: backPress.scale }] }}>
          <TouchableOpacity accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} onPressIn={backPress.handlePressIn} onPressOut={backPress.handlePressOut} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.backIcon, { color: colors.heading }]}>‹</Text>
          </TouchableOpacity>
        </Animated.View>
        <View>
          <Text style={[styles.title, { color: colors.heading }]}>{t('common.engineering')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('common.selectActivity')}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ transform: [{ translateX: listX }] }}>
          {activities.map((activity, index) => (
            <ActivityCard activity={activity} index={index} key={activity.id} onPress={() => onSelectActivity(activity.id)} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingVertical: 20 },
  backBtn: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  backIcon: { fontSize: 34, fontWeight: '800', lineHeight: 38 },
  title: { ...typography.heading2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  content: { padding: 24 },
  card: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, flexDirection: 'row', gap: 16, marginBottom: 12, minHeight: 96, padding: 18 },
  icon: { alignItems: 'center', borderRadius: radius.radiusMd, height: 64, justifyContent: 'center', width: 64 },
  iconText: { color: brandColors.white, fontSize: 14, fontWeight: '900' },
  copy: { flex: 1 },
  cardTitle: { ...typography.heading3 },
  cardSub: { ...typography.body, marginTop: 2 },
  chevron: { fontSize: 30, fontWeight: '900' },
});
