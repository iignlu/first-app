import React, { useEffect, useState } from 'react';
import { View, I18nManager, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Import Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { QuranScreen } from './src/screens/QuranScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Import Store and Theme
import { useAppStore } from './src/storage/useAppStore';
import { colors } from './src/theme/colors';

// Force RTL layout on native platforms. Web direction is handled in useEffect below.
if (Platform.OS !== 'web') {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

// Prevent splash screen from auto-hiding on native platforms
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded, fontError] = Font.useFonts({
    'Amiri-Regular': require('./assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('./assets/fonts/Amiri-Bold.ttf'),
  });

  const [fontTimeout, setFontTimeout] = useState(false);

  useEffect(() => {
    // In web/browser environments, set document attributes for proper RTL layout
    if (Platform.OS === 'web') {
      try {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } catch (e) {
        console.warn('Failed to set HTML document attributes:', e);
      }
    }

    // Set a 1.5 second safety timeout to bypass font loading if it gets stuck (common on Web)
    const timer = setTimeout(() => {
      setFontTimeout(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  // On Web, render instantly to avoid blank white pages during font loading.
  // Browser will apply Amiri font dynamically once loaded.
  const isLoaded = Platform.OS === 'web' || fontsLoaded || fontError || fontTimeout;

  useEffect(() => {
    if (isLoaded && Platform.OS !== 'web') {
      if (fontError) {
        console.warn('Error loading Amiri fonts, using system fallback:', fontError);
      }
      SplashScreen.hideAsync().catch((err) => {
        console.warn('Error hiding splash screen:', err);
      });
    }
  }, [isLoaded, fontError]);

  if (!isLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Quran') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.subtext,
            tabBarStyle: {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              height: 70,
              paddingBottom: 12,
              paddingTop: 12,
            },
            tabBarLabelStyle: {
              fontFamily: 'Amiri-Regular',
              fontSize: 13,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'الرئيسية' }}
          />
          <Tab.Screen 
            name="Quran" 
            component={QuranScreen} 
            options={{ title: 'المصحف' }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'الإعدادات' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}
