import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useButtonPress } from '../hooks/useButtonPress';
import { useFadeSlideIn } from '../hooks/useFadeSlideIn';
import { useTheme } from '../ThemeContext';
import { brandColors, radius, shadow, typography } from '../tokens';

interface Props {
  onNext: () => void;
}

export function SplashScreen({ onNext }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const logoAnim = useFadeSlideIn(0);
  const titleAnim = useFadeSlideIn(150);
  const subtitleAnim = useFadeSlideIn(250);
  const buttonAnim = useFadeSlideIn(400);
  const buttonPress = useButtonPress();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[logoAnim, { transform: [...logoAnim.transform, { scale: pulse }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>STEMM{'\n'}GAMES</Text>
        </View>
      </Animated.View>
      <Animated.Text style={[styles.title, { color: colors.heading }, titleAnim]}>{t('onboarding.appTitle')}</Animated.Text>
      <Animated.Text style={[styles.subtitle, { color: colors.muted }, subtitleAnim]}>{t('onboarding.subtitle')}</Animated.Text>
      <Animated.View style={[buttonAnim, { alignSelf: 'stretch', transform: [...buttonAnim.transform, { scale: buttonPress.scale }] }]}>
        <TouchableOpacity
          accessibilityLabel={t('onboarding.getStarted')}
          accessibilityRole="button"
          onPress={onNext}
          onPressIn={buttonPress.handlePressIn}
          onPressOut={buttonPress.handlePressOut}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoBox: { alignItems: 'center', backgroundColor: brandColors.oliveGold, borderRadius: radius.radiusXl, height: 128, justifyContent: 'center', marginBottom: 40, width: 184, ...shadow },
  logoText: { ...typography.heading1, color: brandColors.charcoal, lineHeight: 36, textAlign: 'center' },
  title: { ...typography.heading2, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...typography.mono, marginBottom: 54, textAlign: 'center' },
  button: { alignItems: 'center', backgroundColor: brandColors.coral, borderRadius: radius.radiusMd, minHeight: 56, justifyContent: 'center', width: '100%' },
  buttonText: { color: brandColors.white, fontSize: 17, fontWeight: '900' },
});
