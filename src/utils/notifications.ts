import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleDailyReminder(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Clear existing
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule new
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "وقت القراءة 📖",
      body: "حان موعد وردك اليومي من سورة البقرة. لا تنسَ بركتها!",
      data: { screen: 'Quran' },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}
