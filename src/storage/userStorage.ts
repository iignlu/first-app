import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = 'USER_NAME';

export const getUserName = async (): Promise<string> => {
    try {
        const name = await AsyncStorage.getItem(USER_NAME_KEY);
        return name || 'صديقي';
    } catch (e) {
        return 'صديقي';
    }
};

export const saveUserName = async (name: string) => {
    try {
        await AsyncStorage.setItem(USER_NAME_KEY, name);
    } catch (e) {
        console.error('Error saving user name', e);
    }
};
