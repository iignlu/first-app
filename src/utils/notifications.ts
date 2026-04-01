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

export const cancelNotificationByTitle = async (title: string) => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
        if (notification.content.title === title) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }
};

export const scheduleAzkarNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel existing Azkar notifications to avoid duplicates
    await cancelNotificationByTitle("ذكر 📿");

    // Schedule 24 notifications for the next 24 hours (one every hour)
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

export const schedulePrayerNotifications = async (prayerTimes: any) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const prayers = [
        { key: 'fajr', name: 'الفجر', time: prayerTimes.fajr },
        { key: 'dhuhr', name: 'الظهر', time: prayerTimes.dhuhr },
        { key: 'asr', name: 'العصر', time: prayerTimes.asr },
        { key: 'maghrib', name: 'المغرب', time: prayerTimes.maghrib },
        { key: 'isha', name: 'العشاء', time: prayerTimes.isha },
    ];

    const now = new Date();

    for (const prayer of prayers) {
        const prayerTime = new Date(prayer.time);

        // If prayer time is in the past for today, don't schedule
        if (prayerTime.getTime() <= now.getTime()) continue;

        const title = `حان وقت صلاة ${prayer.name} 🕌`;

        // Cancel existing notification for this prayer to avoid duplicates
        await cancelNotificationByTitle(title);

        const secondsUntilPrayer = (prayerTime.getTime() - now.getTime()) / 1000;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: "حي على الصلاة، حي على الفلاح",
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: secondsUntilPrayer,
                repeats: false,
            },
        });
    }
};
