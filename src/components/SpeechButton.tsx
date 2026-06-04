import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';

import { speechLanguageFor } from '../services/i18n';

interface SpeechButtonProps {
  text: string | string[];
  style?: ViewStyle;
}

export function SpeechButton({ text, style }: SpeechButtonProps) {
  const { i18n, t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  const phrase = Array.isArray(text) ? text.join('. ') : text;

  const handlePress = async () => {
    const active = await Speech.isSpeakingAsync();
    if (active) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }

    Speech.speak(phrase, {
      language: speechLanguageFor(i18n.language),
      pitch: 1,
      rate: i18n.language.startsWith('id') ? 0.88 : 0.92,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    setSpeaking(true);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={speaking ? t('common.stopReading') : t('common.readAloud')}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Text style={styles.icon}>{speaking ? '■' : '▶'}</Text>
      <Text style={styles.label}>{speaking ? t('common.stopReading') : t('common.readAloud')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0B5D4C',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.82 },
  icon: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
