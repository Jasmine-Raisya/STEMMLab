import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useBatteryGuard } from '../hooks/useBatteryGuard';

export function BatteryWarning() {
  const battery = useBatteryGuard();
  if (!battery.isLow && !battery.lowPowerMode) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Battery warning</Text>
      <Text style={styles.copy}>
        Battery is at {battery.percent}%. STEMM Lab will reduce sensor sampling frequency to protect the device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#FFF4E8', borderColor: '#F08A24', borderRadius: 14, borderWidth: 1, padding: 14 },
  title: { color: '#9A4E00', fontSize: 16, fontWeight: '900', marginBottom: 2 },
  copy: { color: '#7A4B1F', fontSize: 14, lineHeight: 20 },
});
