import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SensorSample } from '../types/models';

interface Props {
  samples: SensorSample[];
}

export function SchoolMap({ samples }: Props) {
  return (
    <View style={styles.webMap}>
      <Text style={styles.title}>GPS Samples</Text>
      {samples.slice(0, 4).map((sample, index) => (
        <Text key={`${sample.timestamp}-${index}`} style={styles.sample}>
          {sample.value.toFixed(0)} dB | {sample.latitude?.toFixed(4)}, {sample.longitude?.toFixed(4)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  webMap: { alignItems: 'center', justifyContent: 'center', padding: 12 },
  title: { color: '#0074D9', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  sample: { color: '#2F3E46', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
