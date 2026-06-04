import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  onNext: () => void;
}

export function SplashScreen({ onNext }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>STEMM{'\n'}GAMES</Text>
      </View>
      <Text style={styles.title}>{t('onboarding.appTitle')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
      <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#F2E7DF', flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoBox: { alignItems: 'center', backgroundColor: '#CFC46B', borderRadius: 8, height: 118, justifyContent: 'center', marginBottom: 44, width: 174 },
  logoText: { color: '#FFEBF3', fontSize: 34, fontWeight: '900', lineHeight: 36, textAlign: 'center' },
  title: { color: '#343133', fontSize: 34, fontWeight: '900', marginBottom: 6, textAlign: 'center' },
  subtitle: { color: '#343133', fontFamily: 'monospace', fontSize: 16, marginBottom: 54, textAlign: 'center' },
  button: { alignItems: 'center', backgroundColor: '#F5674D', borderRadius: 8, minHeight: 52, justifyContent: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
