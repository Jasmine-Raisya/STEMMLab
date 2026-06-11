import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';

import { stemmColors } from './ActivityScaffold';

interface Props {
  text: string | string[];
  style?: StyleProp<ViewStyle>;
}

export function SpeechButton({ text, style }: Props) {
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  const handlePress = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    const content = Array.isArray(text) ? text.join('\n') : text;
    setSpeaking(true);
    Speech.speak(content, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity accessibilityRole="button" onPress={handlePress} style={[styles.button, style]} testID="read_aloud_button">
      <Text style={styles.icon}>{speaking ? '■' : '▶'}</Text>
      <Text style={styles.label}>{speaking ? t('common.stopReading') : t('common.readAloud')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: stemmColors.green,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  icon: { color: stemmColors.blue, fontSize: 14, fontWeight: '900' },
  label: { color: stemmColors.blue, fontSize: 15, fontWeight: '800' },
});
