import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { stemmColors } from './ActivityScaffold';

export function AdMobBanner() {
  return (
    <View accessibilityLabel="Advertisement banner placeholder" nativeID="admob-banner" style={styles.wrap} testID="admob_banner">
      <Text style={styles.label}>AdMob Banner</Text>
      <Text style={styles.unit}>Native ads are shown in Android builds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderColor: stemmColors.border,
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    padding: 8,
  },
  label: { color: stemmColors.muted, fontSize: 12, fontWeight: '800' },
  unit: { color: stemmColors.muted, fontSize: 11 },
});
