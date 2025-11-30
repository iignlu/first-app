import * as Notifications from 'expo-notifications';

const AZKAR = [
    "سبحان الله",
    "الحمد لله",
    "لا إله إلا الله",
    "الله أكبر",
    "سبحان الله وبحمده",
    "سبحان الله العظيم",
    "لا حول ولا قوة إلا بالله",
    "أستغفر الله العظيم",
    "اللهم صل وسلم على نبينا محمد",
    "رضيت بالله رباً وبالإسلام ديناً وبمحمد نبياً",
    "اللهم إنك عفو تحب العفو فاعف عني",
    "يا حي يا قيوم برحمتك أستغيث",
    "اللهم إني أسألك الجنة وأعوذ بك من النار",
    "حسبي الله لا إله إلا هو عليه توكلت",
    "اللهم أعني على ذكرك وشكرك وحسن عبادتك"
];

export const scheduleAzkarNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel existing Azkar notifications to avoid duplicates
    // We can use a specific identifier if needed, but for now we'll just schedule new ones
    // Note: In a real app, you might want to manage IDs more carefully

    // Schedule 12 notifications for the next 12 hours as a simple implementation
    // Or use a repeating interval. Expo's repeating interval is usually minimum 15 mins or hourly.

    // Schedule 24 notifications for the next 24 hours (one every hour)
    // This ensures variety in the Azkar
    for (let i = 1; i <= 24; i++) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "ذكر 📿",
                body: AZKAR[Math.floor(Math.random() * AZKAR.length)],
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: i * 3600,
                repeats: false,
            },
        });
    }
};
