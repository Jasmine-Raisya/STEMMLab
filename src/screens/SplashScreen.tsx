import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  onNext: () => void;
  onLogin: () => void;
}

export function SplashScreen({ onNext, onLogin }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoIcon}>STEMM</Text>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{t('onboarding.appTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.btnText}>{t('onboarding.getStarted')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={onLogin} activeOpacity={0.85}>
        <Text style={styles.loginBtnText}>Login with Team Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: '#fff' },
  logoBox: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#0B5D4C',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  logoIcon: { fontSize: 18, color: '#0B5D4C', fontWeight: '900' },
  titleBlock: { alignItems: 'center', marginBottom: 64 },
  title: { fontSize: 32, fontWeight: '800', color: '#2F3E46', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#2F3E46', textAlign: 'center' },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: '#0074D9', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  loginBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#0074D9', alignItems: 'center', marginTop: 12 },
  loginBtnText: { color: '#0074D9', fontSize: 17, fontWeight: '800' },
});
