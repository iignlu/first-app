import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { typography } from '../theme/typography';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';
import { Ionicons } from '@expo/vector-icons';
import { schedulePrayerNotifications } from '../utils/notifications';

export const PrayerScreen = () => {
    const colors = useThemeColors();
    const [cityName, setCityName] = useState<string>('');
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshLocation = async () => {
        setLoading(true);
        setError(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('نحتاج إذن الموقع لحساب مواقيت الصلاة');
                setLoading(false);
                return;
            }

            // High accuracy for better Prayer Times
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });

            // Get City Name
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (reverseGeocode && reverseGeocode.length > 0) {
                    const address = reverseGeocode[0];
                    // Try multiple fields for better city name resolution
                    const city = address.city || address.region || address.subregion || address.district || address.name || address.country || 'موقعي';
                    setCityName(city);
                }
            } catch (e) {
                console.log('Error getting city name', e);
                setCityName('موقعي');
            }

            // Calculate Prayer Times
            const coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);
            const params = CalculationMethod.UmmAlQura(); // Default for Saudi/Gulf
            const date = new Date();
            const times = new PrayerTimes(coordinates, date, params);
            setPrayerTimes(times);

            // Schedule Notifications
            schedulePrayerNotifications(times);

            setLoading(false);
        } catch (e) {
            setError('حدث خطأ في تحديد الموقع');
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLocation();
    }, []);

    // Update Countdown Timer
    useEffect(() => {
        if (!prayerTimes) return;

        const interval = setInterval(() => {
            const now = new Date();
            const next = prayerTimes.nextPrayer();

            if (next === Prayer.None) {
                setNextPrayer('fajr'); // Assumption for next cycle
                setTimeRemaining('');
                return;
            }

            const nextPrayerTime = prayerTimes.timeForPrayer(next);
            if (nextPrayerTime) {
                const diff = nextPrayerTime.getTime() - now.getTime();
                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    setTimeRemaining(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

                    // Map Adhan Prayer enum to our string keys
                    const prayerKeyMap: { [key: string]: string } = {
                        [Prayer.Fajr]: 'fajr',
                        [Prayer.Sunrise]: 'sunrise',
                        [Prayer.Dhuhr]: 'dhuhr',
                        [Prayer.Asr]: 'asr',
                        [Prayer.Maghrib]: 'maghrib',
                        [Prayer.Isha]: 'isha',
                    };
                    setNextPrayer(prayerKeyMap[next] || null);
                } else {
                    // Time passed, refresh to get next prayer
                    // Ideally we would recalculate for the next day if Isha passed, 
                    // but simply refreshing location/times works for now to reset
                    refreshLocation();
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [prayerTimes]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    const getPrayerName = (key: string) => {
        const names: { [key: string]: string } = {
            fajr: 'الفجر',
            sunrise: 'الشروق',
            dhuhr: 'الظهر',
            asr: 'العصر',
            maghrib: 'المغرب',
            isha: 'العشاء',
        };
        return names[key] || key;
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.subtext }]}>جاري تحديد الموقع...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Ionicons name="location-outline" size={48} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                <TouchableOpacity onPress={refreshLocation} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>مواقيت الصلاة</Text>
                    {cityName ? (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location" size={16} color={colors.primary} />
                            <Text style={[styles.cityName, { color: colors.subtext }]}>{cityName}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Next Prayer Countdown Card */}
                {nextPrayer && timeRemaining ? (
                    <View style={[styles.countdownCard, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1 }]}>
                        <Text style={[styles.nextPrayerLabel, { color: colors.subtext }]}>الصلاة القادمة</Text>
                        <Text style={[styles.nextPrayerName, { color: colors.primary }]}>{getPrayerName(nextPrayer)}</Text>
                        <Text style={[styles.countdownTimer, { color: colors.text }]}>{timeRemaining}</Text>
                        <Text style={[styles.timeLeftLabel, { color: colors.subtext }]}>متبقي على الأذان</Text>
                    </View>
                ) : null}

                {/* Prayer Times List */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {prayerTimes && ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => {
                        const isNext = nextPrayer === prayer;
                        return (
                            <View
                                key={prayer}
                                style={[
                                    styles.prayerRow,
                                    { borderBottomColor: colors.border },
                                    isNext && { backgroundColor: colors.background + '80', borderRadius: 8, paddingHorizontal: 8, borderColor: colors.primary, borderWidth: 1 }
                                ]}
                            >
                                <View style={styles.prayerNameContainer}>
                                    <Text style={[
                                        styles.prayerName,
                                        { color: isNext ? colors.primary : colors.text },
                                        isNext && { fontWeight: 'bold' }
                                    ]}>
                                        {getPrayerName(prayer)}
                                    </Text>
                                    {isNext && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                                </View>
                                <Text style={[
                                    styles.prayerTime,
                                    { color: isNext ? colors.primary : colors.subtext },
                                    isNext && { fontWeight: 'bold', fontSize: 20 }
                                ]}>
                                    {formatTime((prayerTimes as any)[prayer])}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={refreshLocation}
                >
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                    <Text style={[styles.refreshText, { color: colors.primary }]}>تحديث الموقع</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
    },
    errorText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        textAlign: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    cityName: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
    },
    countdownCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    nextPrayerLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontFamily: typography.fontFamily,
        fontSize: 14,
        marginBottom: 4,
    },
    nextPrayerName: {
        color: '#FFF',
        fontFamily: typography.fontFamily,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    countdownTimer: {
        color: '#FFF',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    timeLeftLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontFamily: typography.fontFamily,
        fontSize: 12,
        marginTop: 4,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    prayerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    prayerNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    prayerName: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    prayerTime: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.medium,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 24,
        gap: 8,
    },
    refreshText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
    },
    retryText: {
        color: '#FFF',
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
    },
});
