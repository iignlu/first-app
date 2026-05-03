import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { ADHKAR_DATA } from '../data/adhkar';

export const AdhkarScreen = () => {
  const { isDarkMode } = useAppStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  const [counts, setCounts] = useState<Record<string, number>>({});

  const handleIncrement = (id: string, max: number) => {
    const current = counts[id] || 0;
    if (current < max) {
      const next = current + 1;
      setCounts({ ...counts, [id]: next });
      
      if (next === max) {
        Vibration.vibrate(100);
      }
    }
  };

  const resetCount = (id: string) => {
    setCounts({ ...counts, [id]: 0 });
  };

  const renderDhikr = ({ item }: { item: any }) => {
    const current = counts[item.id] || 0;
    const isCompleted = current === item.count;

    return (
      <View style={[styles.dhikrCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.dhikrText, { color: theme.text }]}>{item.text}</Text>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={[
              styles.counterButton, 
              { backgroundColor: isCompleted ? theme.success : theme.primary }
            ]}
            onPress={() => handleIncrement(item.id, item.count)}
          >
            <Text style={styles.counterText}>{current} / {item.count}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => resetCount(item.id)}>
            <Ionicons name="refresh" size={24} color={theme.subtext} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>الأذكار اليومية</Text>
      </View>

      <FlatList
        data={ADHKAR_DATA}
        renderItem={renderDhikr}
        keyExtractor={(item) => item.id}
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
    fontSize: 24,
    fontFamily: 'Amiri-Bold',
  },
  listContent: {
    padding: 15,
  },
  dhikrCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
    elevation: 2,
  },
  dhikrText: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'right',
    fontFamily: 'Amiri-Regular',
  },
  cardFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  counterButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
  },
  counterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
