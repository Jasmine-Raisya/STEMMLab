import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  teamData: { teamId: string };
  onNext: () => void;
}

export function DiscriminatorRevealScreen({ teamData, onNext }: Props) {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.label}>{t('onboarding.yourTeamId')}</Text>

        <Animated.View style={[styles.idCard, { transform: [{ scale: pulse }] }]}>
          <Text style={styles.hashIcon}>#</Text>
          <Text style={styles.teamId}>{teamData.teamId || '-'}</Text>
          <Text style={styles.hint}>{t('onboarding.rememberId')}</Text>
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{t('onboarding.letsGo')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingVertical: 48, backgroundColor: '#1a1a2e', justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 32 },
  idCard: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 20, padding: 32, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', width: '100%' },
  hashIcon: { fontSize: 36, color: '#0074D9', marginBottom: 8 },
  teamId: { fontSize: 28, color: '#fff', marginBottom: 8, textAlign: 'center', fontWeight: '800' },
  hint: { fontSize: 15, color: 'rgba(255,255,255,0.65)' },
  btn: { paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
