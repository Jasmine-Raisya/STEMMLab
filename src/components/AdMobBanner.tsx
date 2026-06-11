import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { stemmColors } from './ActivityScaffold';

export function AdMobBanner() {
  const unitId = process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID || TestIds.ADAPTIVE_BANNER;

  return (
    <View accessibilityLabel="Advertisement banner" nativeID="admob-banner" style={styles.wrap} testID="admob_banner">
      <BannerAd
        onAdFailedToLoad={(error) => {
          console.warn('AdMob banner failed to load', error);
        }}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        unitId={unitId}
      />
      <Text style={styles.unit}>{process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ? 'AdMob configured' : 'AdMob test banner'}</Text>
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
  unit: { color: stemmColors.muted, fontSize: 11 },
});
