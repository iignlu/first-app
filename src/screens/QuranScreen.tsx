import React, { useEffect, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { QuranText } from '../components/QuranText';
import baqarahData from '../data/baqarah.json';

const { width } = Dimensions.get('window');

export const QuranScreen = () => {
  const { 
    lastAyahIndex, 
    setLastAyahIndex, 
    isDarkMode, 
    toggleBookmark, 
    bookmarks,
    updateStreak 
  } = useAppStore();
  
  const flatListRef = useRef<FlatList>(null);
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const ayahs = baqarahData.data.ayahs;

  const onScrollToIndexFailed = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: lastAyahIndex, animated: true });
    }, 500);
  };

  const handleShare = async (text: string, number: number) => {
    try {
      await Share.share({
        message: `${text} [سورة البقرة: ${number}]`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderAyah = ({ item, index }: { item: any, index: number }) => {
    const isBookmarked = bookmarks.includes(index);
    
    return (
      <View style={[styles.ayahContainer, { borderBottomColor: theme.border }]}>
        <View style={styles.ayahHeader}>
          <View style={[styles.ayahBadge, { backgroundColor: theme.primary }]}>
            <QuranText style={styles.ayahNumber} isAyahNumber>{item.numberInSurah.toString()}</QuranText>
          </View>
          
          <View style={styles.ayahActions}>
            <TouchableOpacity onPress={() => toggleBookmark(index)}>
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? theme.secondary : theme.subtext} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => handleShare(item.text, item.numberInSurah)}>
              <Ionicons name="share-outline" size={24} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        <QuranText style={{ color: theme.text, marginTop: 10 }}>
          {item.text}
        </QuranText>
      </View>
    );
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.floor(event.nativeEvent.contentOffset.y / 150); // Rough estimate
    if (index >= 0 && index < ayahs.length) {
      // Logic to find exact index could be improved with onViewableItemsChanged
    }
  };

  // Update streak when user opens the screen
  useEffect(() => {
    updateStreak();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) {
        setLastAyahIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={flatListRef}
        data={ayahs}
        renderItem={renderAyah}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContent}
        initialScrollIndex={lastAyahIndex > 0 ? lastAyahIndex : undefined}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Floating Action Button for Reset or Info if needed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  ayahContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  ayahHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ayahBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumber: {
    color: '#FFFFFF',
    fontFamily: 'Amiri-Bold',
  },
  ayahActions: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
