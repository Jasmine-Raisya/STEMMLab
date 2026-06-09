import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AdMobBanner } from '../components/AdMobBanner';
import { useButtonPress } from '../hooks/useButtonPress';
import { useFadeSlideIn } from '../hooks/useFadeSlideIn';
import { useThemeColors } from '../ThemeContext';
import { brandColors, radius, typography } from '../tokens';

interface Props { onNavigate: (screen: number) => void; }

function ScaleButton({ accessibilityLabel, children, fill, onPress, pressedScale = 0.95, style }: { accessibilityLabel: string; children: React.ReactNode; fill?: boolean; onPress: () => void; pressedScale?: number; style: object | object[] }) {
  const press = useButtonPress(pressedScale);
  return (
    <Animated.View style={[fill && styles.scaleFill, { transform: [{ scale: press.scale }] }]}>
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={press.handlePressIn}
        onPressOut={press.handlePressOut}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function MainDashboardScreen({ onNavigate }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { height } = useWindowDimensions();
  const headerAnim = useFadeSlideIn(0);
  const stemAnim = useFadeSlideIn(100);
  const healthAnim = useFadeSlideIn(220);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }, headerAnim]}>
        <View>
          <Text style={[styles.title, { color: colors.heading }]}>{t('common.dashboard')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('common.choosePath')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <ScaleButton accessibilityLabel="Open team profile" onPress={() => onNavigate(5)} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.iconText}>👥</Text>
          </ScaleButton>
          <ScaleButton accessibilityLabel="Open settings" onPress={() => onNavigate(6)} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.iconText}>⚙</Text>
          </ScaleButton>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.tileWrap, { height: height * 0.32 }, stemAnim]}>
          <ScaleButton accessibilityLabel={t('common.engineering')} fill onPress={() => onNavigate(7)} pressedScale={0.97} style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.accent }]}>
            <View style={[styles.tileIcon, { backgroundColor: colors.accent }]}>
              <Text style={styles.tileMarker}>STEM</Text>
            </View>
            <Text style={[styles.tileTitle, { color: colors.heading }]}>{t('common.engineering')}</Text>
            <Text style={[styles.tileSubtitle, { color: colors.muted }]}>{t('common.buildDesign')}</Text>
          </ScaleButton>
        </Animated.View>

        <Animated.View style={[styles.tileWrap, { height: height * 0.32 }, healthAnim]}>
          <ScaleButton accessibilityLabel={t('common.health')} fill onPress={() => onNavigate(12)} pressedScale={0.97} style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.cta }]}>
            <View style={[styles.tileIcon, { backgroundColor: colors.cta }]}>
              <Text style={styles.tileMarkerLight}>MED</Text>
            </View>
            <Text style={[styles.tileTitle, { color: colors.heading }]}>{t('common.health')}</Text>
            <Text style={[styles.tileSubtitle, { color: colors.muted }]}>{t('common.wellnessCare')}</Text>
          </ScaleButton>
        </Animated.View>
        <AdMobBanner />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: { ...typography.heading2 },
  subtitle: { ...typography.caption },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: { alignItems: 'center', borderRadius: radius.radiusMd, borderWidth: 1, height: 48, justifyContent: 'center', width: 48 },
  iconText: { fontSize: 22 },
  content: { gap: 16, paddingHorizontal: 24, paddingVertical: 24 },
  scaleFill: { flex: 1 },
  tileWrap: { flexShrink: 0 },
  tile: {
    alignItems: 'center',
    borderRadius: radius.radiusLg,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 28,
  },
  tileIcon: {
    alignItems: 'center',
    borderRadius: radius.radiusMd,
    height: 78,
    justifyContent: 'center',
    marginBottom: 16,
    width: 78,
  },
  tileMarker: { color: brandColors.charcoal, fontSize: 13, fontWeight: '900' },
  tileMarkerLight: { color: brandColors.white, fontSize: 13, fontWeight: '900' },
  tileTitle: { ...typography.heading3, marginBottom: 4, textAlign: 'center' },
  tileSubtitle: { ...typography.body, textAlign: 'center' },
});
