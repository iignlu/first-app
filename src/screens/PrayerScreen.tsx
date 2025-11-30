import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { typography } from '../theme/typography';
import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes, Qibla } from 'adhan';
import { Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';

export const PrayerScreen = () => {
    const colors = useThemeColors();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [cityName, setCityName] = useState<string>('');
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState<number>(0);
    const [compassHeading, setCompassHeading] = useState<number>(0);
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

            // High accuracy for better Qibla and Prayer Times
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(location);

            // Get City Name
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
                if (reverseGeocode && reverseGeocode.length > 0) {
                    const address = reverseGeocode[0];
                    setCityName(address.city || address.region || address.country || '');
                }
            } catch (e) {
                console.log('Error getting city name', e);
            }

            // Calculate Prayer Times
            const coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);
            const params = CalculationMethod.UmmAlQura(); // Default for Saudi/Gulf
            const date = new Date();
            const times = new PrayerTimes(coordinates, date, params);
            setPrayerTimes(times);

            // Calculate Qibla
            const qibla = Qibla(coordinates);
            setQiblaDirection(qibla);

            setLoading(false);
        } catch (e) {
            setError('حدث خطأ في تحديد الموقع');
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshLocation();
    }, []);

    // Compass Logic
    useEffect(() => {
        const subscription = Magnetometer.addListener(data => {
            const { x, y } = data;
            let angle = Math.atan2(y, x) * (180 / Math.PI); // Angle in degrees
            angle = angle - 90; // Adjust for mobile orientation
            if (angle < 0) {
                angle = angle + 360;
            }
            setCompassHeading(angle);
        });

        Magnetometer.setUpdateInterval(100);

        return () => {
            subscription && subscription.remove();
        };
    }, []);

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

    // Calculate rotation for Qibla arrow
    // If phone points North (0), Qibla is at qiblaDirection.
    // We need to rotate the arrow by (qiblaDirection - compassHeading).
    const arrowRotation = qiblaDirection - compassHeading;

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

                {/* Prayer Times Card */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {prayerTimes && ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => (
                        <View key={prayer} style={[styles.prayerRow, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.prayerName, { color: colors.text }]}>{getPrayerName(prayer)}</Text>
                            <Text style={[styles.prayerTime, { color: colors.primary }]}>
                                {formatTime((prayerTimes as any)[prayer])}
                            </Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.refreshButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={refreshLocation}
                >
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                    <Text style={[styles.refreshText, { color: colors.primary }]}>تحديث الموقع</Text>
                </TouchableOpacity>

                {/* Qibla Compass */}
                <Text style={[styles.subtitle, { color: colors.text }]}>اتجاه القبلة</Text>
                <View style={[styles.compassContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.compassCircle, { borderColor: colors.border }]}>
                        <Ionicons
                            name="arrow-up"
                            size={48}
                            color={colors.primary}
                            style={{
                                transform: [{ rotate: `${arrowRotation}deg` }]
                            }}
                        />
                    </View>
                    <Text style={[styles.qiblaText, { color: colors.subtext }]}>
                        {Math.round(qiblaDirection)}° من الشمال
                    </Text>
                    <Text style={[styles.calibrationText, { color: colors.subtext }]}>
                        حرك الهاتف على شكل 8 للمعايرة
                    </Text>
                </View>

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
    subtitle: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        marginTop: 30,
        marginBottom: 16,
        textAlign: 'center',
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    prayerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    prayerName: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
    },
    prayerTime: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 16,
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
    compassContainer: {
        alignItems: 'center',
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
    },
    compassCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    qiblaText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
    },
    calibrationText: {
        fontFamily: typography.fontFamily,
        fontSize: 10,
        marginTop: 8,
        opacity: 0.7,
    },
});
