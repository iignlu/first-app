import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDailyAyah } from '../hooks/useDailyAyah';
import { useThemeColors } from '../hooks/useThemeColors';
import { AyahCard } from '../components/AyahCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { addFavorite, removeFavorite, isFavoriteAyah } from '../storage/favoritesStorage';
import { getUserName, saveUserName } from '../storage/userStorage';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { scheduleAzkarNotifications } from '../utils/notifications';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const DailyScreen = () => {
    const { ayah, loading, error, fetchNewAyah } = useDailyAyah();
    const colors = useThemeColors();
    const [isFavorite, setIsFavorite] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [userName, setUserName] = useState('صديقي');
    const [isEditingName, setIsEditingName] = useState(false);

    useEffect(() => {
        loadUserName();
        setupNotifications();
    }, []);

    useEffect(() => {
        if (ayah) {
            checkFavoriteStatus();
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        }
    }, [ayah]);

    const loadUserName = async () => {
        const name = await getUserName();
        setUserName(name);
    };

    const handleSaveName = async () => {
        await saveUserName(userName);
        setIsEditingName(false);
    };

    const setupNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
            await Notifications.cancelAllScheduledNotificationsAsync();

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "آية اليوم 📖",
                    body: "لا تنس قراءة وردك اليومي من القرآن الكريم",
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 8,
                    minute: 0,
                },
            });

            // Schedule hourly Azkar
            await scheduleAzkarNotifications();
        }
    };

    const checkFavoriteStatus = async () => {
        if (ayah) {
            const status = await isFavoriteAyah(ayah.id);
            setIsFavorite(status);
        }
    };

    const toggleFavorite = async () => {
        if (!ayah) return;
        if (isFavorite) {
            await removeFavorite(ayah.id);
            setIsFavorite(false);
        } else {
            await addFavorite(ayah);
            setIsFavorite(true);
        }
    };

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View style={styles.greetingRow}>
                        <Text style={[styles.greeting, { color: colors.subtext }]}>مرحباً،</Text>
                        {isEditingName ? (
                            <View style={styles.editNameContainer}>
                                <TextInput
                                    style={[styles.nameInput, { color: colors.primary, borderColor: colors.primary }]}
                                    value={userName}
                                    onChangeText={setUserName}
                                    autoFocus
                                    onBlur={handleSaveName}
                                    onSubmitEditing={handleSaveName}
                                />
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditingName(true)}>
                                <Text style={[styles.name, { color: colors.primary }]}>{userName}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={[styles.date, { color: colors.subtext }]}>
                        {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                <View style={styles.content}>
                    {error ? (
                        <View style={styles.center}>
                            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            <PrimaryButton title="إعادة المحاولة" onPress={fetchNewAyah} style={{ marginTop: 20 }} />
                        </View>
                    ) : ayah ? (
                        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                            <AyahCard
                                ayah={ayah}
                                isFavorite={isFavorite}
                                onToggleFavorite={toggleFavorite}
                            />

                            <View style={styles.buttonContainer}>
                                <PrimaryButton
                                    title="آيات أخرى"
                                    onPress={fetchNewAyah}
                                    loading={loading}
                                    icon={<Ionicons name="refresh" size={20} color="#FFF" />}
                                />
                            </View>
                        </Animated.View>
                    ) : (
                        <View style={styles.center}>
                            <Text style={{ color: colors.subtext }}>جاري تحميل الآيات...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.subtext }]}>
                        Developed by Abdullah Alshehri | دعواتكم
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
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'flex-start',
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    greeting: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
    },
    name: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
    },
    editNameContainer: {
        height: 30,
        justifyContent: 'center',
    },
    nameInput: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        borderBottomWidth: 1,
        padding: 0,
        minWidth: 100,
        textAlign: 'right',
    },
    date: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        marginTop: 30,
        width: '100%',
        paddingHorizontal: 20,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontFamily: typography.fontFamily,
        fontSize: 12,
        opacity: 0.6,
    },
});
