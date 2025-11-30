import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_AYAH_KEY = 'DAILY_AYAH';

export interface AyahData {
    id: string; // verse_key of the first verse
    text: string; // Combined text
    surahName: string;
    ayahNumber: number; // Start verse number
    endAyahNumber: number; // End verse number
    savedAt: string; // ISO date
    audioUrls: string[]; // Array of audio URLs
    tafseer?: string; // Tafseer of the first verse or combined
}

export const getDailyAyah = async (): Promise<AyahData | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(DAILY_AYAH_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error reading daily ayah', e);
        return null;
    }
};

export const saveDailyAyah = async (ayah: AyahData) => {
    try {
        await AsyncStorage.setItem(DAILY_AYAH_KEY, JSON.stringify(ayah));
    } catch (e) {
        console.error('Error saving daily ayah', e);
    }
};
