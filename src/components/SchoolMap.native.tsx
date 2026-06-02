import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import { SensorSample } from '../types/models';

interface Props {
  samples: SensorSample[];
}

export function SchoolMap({ samples }: Props) {
  const first = samples[0];
  if (!first) return null;

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: first.latitude ?? 0,
        longitude: first.longitude ?? 0,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }}
    >
      {samples.map((sample, index) => (
        <Marker
          key={`${sample.timestamp}-${index}`}
          coordinate={{ latitude: sample.latitude ?? 0, longitude: sample.longitude ?? 0 }}
          title={`${sample.value.toFixed(0)} dB`}
        />
      ))}
    </MapView>
  );
}
