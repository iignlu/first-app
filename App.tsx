import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DailyScreen } from './src/screens/DailyScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { TasbihScreen } from './src/screens/TasbihScreen';
import { PrayerScreen } from './src/screens/PrayerScreen';
import { AdhkarScreen } from './src/screens/AdhkarScreen';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from './src/hooks/useThemeColors';
import { typography } from './src/theme/typography';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';

const Tab = createBottomTabNavigator();

export default function App() {
  const colors = useThemeColors();
  const [fontsLoaded] = useFonts({
    'Amiri-Regular': require('./assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('./assets/fonts/Amiri-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            paddingTop: 12,
            minHeight: 90,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarLabelStyle: {
            fontFamily: typography.fontFamily,
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen
          name="Daily"
          component={DailyScreen}
          options={{
            title: 'الورد اليومي',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "book" : "book-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Prayer"
          component={PrayerScreen}
          options={{
            title: 'الصلاة',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "time" : "time-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Adhkar"
          component={AdhkarScreen}
          options={{
            title: 'الأذكار',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "moon" : "moon-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Tasbih"
          component={TasbihScreen}
          options={{
            title: 'التسبيح',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "finger-print" : "finger-print-outline"} size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'المفضلة',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "heart" : "heart-outline"} size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
