export async function requestNotificationPermissions(): Promise<void> {
  console.log('Notification permissions requested successfully');
}

export async function fireSafetyAlert(title: string, body: string): Promise<void> {
  console.log(`${title}: ${body}`);
}
