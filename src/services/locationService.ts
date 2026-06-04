import * as Location from 'expo-location';

export async function requestLocationPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) return true;
  const next = await Location.requestForegroundPermissionsAsync();
  return next.granted;
}

export async function getCurrentCoordinates() {
  const granted = await requestLocationPermission();
  if (!granted) return null;
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
