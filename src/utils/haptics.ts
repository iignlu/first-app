import { Platform } from 'react-native';

// Dynamic import of expo-haptics on native platforms to prevent web import crashes
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    console.warn('Failed to load expo-haptics:', e);
  }
}

export const triggerHaptic = (type: 'light' | 'medium' | 'success') => {
  if (Platform.OS === 'web' || !Haptics) return;
  try {
    if (type === 'light') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'success') {
      Haptics.notificationAsync?.(Haptics.NotificationFeedbackType.Success);
    }
  } catch (e) {
    console.log('Haptics not supported:', e);
  }
};
