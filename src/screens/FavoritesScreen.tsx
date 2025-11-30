import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../hooks/useThemeColors';
import { AyahCard } from '../components/AyahCard';
import { getFavorites, removeFavorite, AyahData } from '../storage/favoritesStorage';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

export const FavoritesScreen = () => {
    const colors = useThemeColors();
    const [favorites, setFavorites] = useState<AyahData[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        setLoading(true);
        const data = await getFavorites();
        setFavorites(data);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleRemove = async (id: string) => {
        await removeFavorite(id);
        loadFavorites();
    };

    return (
        <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>المفضلة</Text>
            </View>

            {favorites.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                    <Ionicons name="star-outline" size={64} color={colors.subtext} style={{ opacity: 0.5 }} />
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>
                        لا توجد آيات في المفضلة بعد
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadFavorites} tintColor={colors.primary} />
                    }
                    renderItem={({ item }) => (
                        <AyahCard
                            ayah={item}
                            isFavorite={true}
                            onToggleFavorite={() => handleRemove(item.id)}
                        />
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.xxl,
        fontWeight: typography.weights.bold,
        textAlign: 'left',
    },
    listContent: {
        padding: 20,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.md,
        textAlign: 'center',
        marginTop: 16,
    }
});
