import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useButtonPress } from '../hooks/useButtonPress';
import { useFadeSlideIn } from '../hooks/useFadeSlideIn';
import { useThemeColors } from '../ThemeContext';
import { brandColors, radius, shadow, typography } from '../tokens';

interface Props {
  teamData: { teamId: string };
  onNext: () => void;
}

export function DiscriminatorRevealScreen({ teamData, onNext }: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const labelAnim = useFadeSlideIn(0);
  const cardAnim = useFadeSlideIn(200);
  const buttonPress = useButtonPress();
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.2, duration: 1000, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [glow, pulse]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Animated.Text style={[styles.label, { color: colors.muted }, labelAnim]}>{t('onboarding.yourTeamId')}</Animated.Text>

        <Animated.View style={[styles.glowRing, { borderColor: colors.accent, opacity: glow }, cardAnim]} />
        <Animated.View style={[styles.idCard, { backgroundColor: colors.elevated, borderColor: colors.accent, transform: [...cardAnim.transform, { scale: pulse }] }]}>
          <Text style={[styles.hashIcon, { color: colors.accent }]}>#</Text>
          <Text style={[styles.teamId, { color: colors.heading }]}>{teamData.teamId || '-'}</Text>
          <Text style={[styles.hint, { color: colors.muted }]}>{t('onboarding.rememberId')}</Text>
        </Animated.View>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonPress.scale }] }}>
        <TouchableOpacity
          accessibilityLabel={t('onboarding.letsGo')}
          accessibilityRole="button"
          onPress={onNext}
          onPressIn={buttonPress.handlePressIn}
          onPressOut={buttonPress.handlePressOut}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{t('onboarding.letsGo')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingVertical: 48, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.caption, marginBottom: 32 },
  glowRing: { borderRadius: radius.radiusLg + 8, borderWidth: 2, height: 230, position: 'absolute', width: '106%' },
  idCard: { alignItems: 'center', borderRadius: radius.radiusLg, borderWidth: 2, padding: 32, width: '100%', ...shadow },
  hashIcon: { ...typography.heading1, marginBottom: 8 },
  teamId: { ...typography.heading2, fontFamily: 'Fira Code', marginBottom: 8, textAlign: 'center' },
  hint: { ...typography.body, textAlign: 'center' },
  btn: { alignItems: 'center', backgroundColor: brandColors.coral, borderRadius: radius.radiusMd, minHeight: 56, justifyContent: 'center' },
  btnText: { color: brandColors.white, fontSize: 17, fontWeight: '900' },
});
