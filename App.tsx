import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, I18nManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Import Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { QuranScreen } from './src/screens/QuranScreen';
import { AdhkarScreen } from './src/screens/AdhkarScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

import { scheduleDailyReminder, registerForPushNotificationsAsync } from './src/utils/notifications';

// Import Store and Theme
import { useAppStore } from './src/storage/useAppStore';
import { colors } from './src/theme/colors';

// Force RTL
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded] = Font.useFonts({
    'Amiri-Regular': require('./assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('./assets/fonts/Amiri-Bold.ttf'),
  });

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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
              } else if (route.name === 'Adhkar') {
                iconName = focused ? 'heart' : 'heart-outline';
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
              paddingBottom: 10,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontFamily: 'Amiri-Regular',
              fontSize: 12,
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
            name="Adhkar" 
            component={AdhkarScreen} 
            options={{ title: 'الأذكار' }}
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
