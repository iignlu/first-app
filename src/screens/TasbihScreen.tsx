import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { typography } from '../theme/typography';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGH_SCORE_KEY = 'TASBIH_HIGH_SCORE';

export const TasbihScreen = () => {
    const colors = useThemeColors();
    const [count, setCount] = useState(0);
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        loadHighScore();
    }, []);

    const loadHighScore = async () => {
        try {
            const saved = await AsyncStorage.getItem(HIGH_SCORE_KEY);
            if (saved) {
                setHighScore(parseInt(saved, 10));
            }
        } catch (e) {
            console.error('Failed to load high score');
        }
    };

    const updateHighScore = async (newCount: number) => {
        if (newCount > highScore) {
            setHighScore(newCount);
            try {
                await AsyncStorage.setItem(HIGH_SCORE_KEY, newCount.toString());
            } catch (e) {
                console.error('Failed to save high score');
            }
        }
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newCount = count + 1;
        setCount(newCount);
        updateHighScore(newCount);
    };

    const handleReset = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCount(0);
    };

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>المسبحة</Text>
                <View style={[styles.highScoreContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.highScoreLabel, { color: colors.subtext }]}>أعلى رقم:</Text>
                    <Text style={[styles.highScoreValue, { color: colors.primary }]}>{highScore}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={[styles.counterButton, { borderColor: colors.primary, backgroundColor: colors.card }]}
                    onPress={handlePress}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.countText, { color: colors.primary }]}>{count}</Text>
                    <Text style={[styles.tapText, { color: colors.subtext }]}>اضغط للتسبيح</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: colors.card }]}
                    onPress={handleReset}
                >
                    <Ionicons name="refresh" size={24} color={colors.subtext} />
                    <Text style={[styles.resetText, { color: colors.subtext }]}>تصفير</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        marginBottom: 16,
    },
    highScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    highScoreLabel: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
    },
    highScoreValue: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.bold,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    counterButton: {
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    countText: {
        fontFamily: typography.fontFamily,
        fontSize: 72,
        fontWeight: typography.weights.bold,
        marginBottom: 8,
    },
    tapText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
    },
    resetText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
    },
});
