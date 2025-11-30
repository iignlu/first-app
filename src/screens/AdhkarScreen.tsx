import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { typography } from '../theme/typography';
import { ADHKAR_DATA, Zikr } from '../data/adhkar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export const AdhkarScreen = () => {
    const colors = useThemeColors();
    const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
    const [counts, setCounts] = useState<{ [key: string]: number }>({});

    const filteredAdhkar = ADHKAR_DATA.filter(z => z.category === activeTab);

    const handlePress = (id: string, targetCount: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCounts(prev => {
            const current = prev[id] || 0;
            if (current < targetCount) {
                return { ...prev, [id]: current + 1 };
            }
            return prev;
        });
    };

    const renderItem = ({ item }: { item: Zikr }) => {
        const currentCount = counts[item.id] || 0;
        const isDone = currentCount >= item.count;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        borderColor: isDone ? colors.primary : colors.border,
                        opacity: isDone ? 0.6 : 1
                    }
                ]}
                onPress={() => handlePress(item.id, item.count)}
                activeOpacity={0.7}
            >
                <Text style={[styles.zikrText, { color: colors.text }]}>{item.text}</Text>
                <View style={styles.counterRow}>
                    <View style={[
                        styles.counterBadge,
                        { backgroundColor: isDone ? colors.primary : colors.background }
                    ]}>
                        <Text style={[
                            styles.counterText,
                            { color: isDone ? '#FFF' : colors.primary }
                        ]}>
                            {currentCount} / {item.count}
                        </Text>
                    </View>
                    {isDone && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>الأذكار</Text>
                <View style={[styles.tabs, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'morning' && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setActiveTab('morning')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'morning' ? '#FFF' : colors.subtext }
                        ]}>الصباح ☀️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'evening' && { backgroundColor: colors.primary }
                        ]}
                        onPress={() => setActiveTab('evening')}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'evening' ? '#FFF' : colors.subtext }
                        ]}>المساء 🌙</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredAdhkar}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
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
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        width: '100%',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        fontWeight: typography.weights.medium,
    },
    listContent: {
        padding: 20,
        gap: 16,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    zikrText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.lg,
        lineHeight: 32,
        textAlign: 'right',
    },
    counterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    counterBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    counterText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.bold,
    },
});
