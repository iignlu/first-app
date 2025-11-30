import AsyncStorage from '@react-native-async-storage/async-storage';
import { AyahData } from './dailyAyahStorage';
export { AyahData };

const FAVORITES_KEY = 'FAVORITES';

export const getFavorites = async (): Promise<AyahData[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading favorites', e);
        return [];
    }
};

export const addFavorite = async (ayah: AyahData) => {
    try {
        const favorites = await getFavorites();
        // Check if already exists
        if (favorites.some(f => f.id === ayah.id)) return;

        const newFavorites = [ayah, ...favorites];
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
        console.error('Error adding favorite', e);
    }
};

export const removeFavorite = async (id: string) => {
    try {
        const favorites = await getFavorites();
        const newFavorites = favorites.filter(f => f.id !== id);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (e) {
        console.error('Error removing favorite', e);
    }
};

export const isFavoriteAyah = async (id: string): Promise<boolean> => {
    try {
        const favorites = await getFavorites();
        return favorites.some(f => f.id === id);
    } catch (e) {
        return false;
    }
}
