import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function fireSafetyAlert(title: string, body: string) {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: null,
  });
}
