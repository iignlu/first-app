import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import baqarahData from '../data/baqarah.json';
import { triggerHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');

export const QuranScreen = () => {
  const { 
    currentPage = 2, 
    setCurrentPage, 
    completedPages = [], 
    markPageAsRead, 
    unmarkPageAsRead,
    toggleBookmark,
    bookmarks = [],
    fontSize = 24,
    isDarkMode = false 
  } = useAppStore();

  const theme = isDarkMode ? colors.dark : colors.light;

  
  // Audio Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAyahIndex, setPlayingAyahIndex] = useState<number | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
  // Premium Improvement: Autoplay Next Page state
  const [autoplayNext, setAutoplayNext] = useState(false);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter all ayahs for the current page and sort strictly by numberInSurah to ensure perfect order
  const pageAyahs = baqarahData.data.ayahs
    .filter((ayah: any) => ayah.page === currentPage)
    .sort((a: any, b: any) => a.numberInSurah - b.numberInSurah);

  const isPageCompleted = completedPages.includes(currentPage);
  const isPageBookmarked = bookmarks.includes(currentPage);

  // Auto-scroll to top and handle autoplay when page changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    
    if (pendingAutoplay) {
      setPendingAutoplay(false);
      // Play first ayah of the new page after a brief premium loading delay
      setTimeout(() => {
        playAyahAudio(0);
      }, 1000);
    } else {
      stopRecitation();
    }
  }, [currentPage]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      stopRecitation();
    };
  }, []);

  // Audio Playback functions
  const stopRecitation = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.error('Error stopping recitation', e);
      }
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPlayingAyahIndex(null);
    setLoadingAudio(false);
  };

  const playAyahAudio = async (index: number) => {
    if (index < 0) return;
    
    if (index >= pageAyahs.length) {
      // Finished all ayahs on this page!
      if (autoplayNext && currentPage < 49) {
        // Haptic feedback & auto-advance page!
        triggerHaptic('success');
        setPendingAutoplay(true);
        setCurrentPage(currentPage + 1);
      } else {
        await stopRecitation();
      }
      return;
    }

    setLoadingAudio(true);
    setPlayingAyahIndex(index);

    try {
      // Unload previous sound if it exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure Audio category for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      const ayah = pageAyahs[index];
      const paddedAyah = ayah.numberInSurah.toString().padStart(3, '0');
      const url = `https://everyayah.com/data/Muhammad_Ayyoub_128kbps/002${paddedAyah}.mp3`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
      setLoadingAudio(false);
    } catch (e) {
      setLoadingAudio(false);
      if (Platform.OS === 'web') {
        alert('حدث خطأ أثناء تحميل تلاوة الشيخ محمد أيوب. الرجاء التحقق من اتصال الإنترنت.');
      } else {
        Alert.alert('خطأ في الصوت', 'حدث خطأ أثناء تحميل تلاوة الشيخ محمد أيوب. الرجاء التحقق من اتصال الإنترنت.');
      }
      await stopRecitation();
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      // Play next ayah sequentially!
      setPlayingAyahIndex((prevIndex) => {
        if (prevIndex !== null) {
          const nextIndex = prevIndex + 1;
          // Trigger next audio asynchronously
          setTimeout(() => {
            playAyahAudio(nextIndex);
          }, 300);
        }
        return prevIndex;
      });
    }
  };

  const handlePlayPause = async () => {
    triggerHaptic('medium');
    if (isPlaying) {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
      setIsPlaying(false);
    } else {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else {
        // Start from first ayah of the page
        await playAyahAudio(0);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < 49) {
      triggerHaptic('light');
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 2) {
      triggerHaptic('light');
      setCurrentPage(currentPage - 1);
    }
  };

  const handleToggleCompleted = () => {
    triggerHaptic('success');
    if (isPageCompleted) {
      unmarkPageAsRead(currentPage);
    } else {
      markPageAsRead(currentPage);
    }
  };

  const handleAyahTap = (index: number) => {
    triggerHaptic('light');
    playAyahAudio(index);
  };

  // Safe cleaner function to strip duplicate Basmalah from the first ayah text flow
  const cleanAyahText = (text: string, index: number) => {
    if (currentPage === 2 && index === 0) {
      const basmalahIndex = text.indexOf("الم");
      const basmalahIndex2 = text.indexOf("الۤمۤ");
      
      if (basmalahIndex !== -1) {
        return text.substring(basmalahIndex).trim();
      } else if (basmalahIndex2 !== -1) {
        return text.substring(basmalahIndex2).trim();
      }
    }
    return text;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#FDFBF7' }]}>
      
      {/* Top Header Controls */}
      <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            triggerHaptic('light');
            toggleBookmark(currentPage);
          }}
        >
          <Ionicons 
            name={isPageBookmarked ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={isPageBookmarked ? theme.secondary : theme.subtext} 
          />
        </TouchableOpacity>

        {/* Page Switcher */}
        <View style={styles.pageSwitcher}>
          <TouchableOpacity 
            onPress={handlePrevPage}
            disabled={currentPage === 2}
            style={[styles.navArrow, { opacity: currentPage === 2 ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.pageTitle, { color: theme.text }]}>صفحة {currentPage}</Text>
          
          <TouchableOpacity 
            onPress={handleNextPage}
            disabled={currentPage === 49}
            style={[styles.navArrow, { opacity: currentPage === 49 ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.completedIndicator, { backgroundColor: isPageCompleted ? theme.primary + '20' : 'rgba(0,0,0,0.03)' }]}>
          <Text style={[styles.completedText, { color: isPageCompleted ? theme.primary : theme.subtext }]}>
            {isPageCompleted ? "مكتملة ✓" : "غير مقروءة"}
          </Text>
        </View>
      </View>

      {/* Main Mushaf Page Block */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.quranScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.mushafBorder, 
          { 
            borderColor: theme.secondary, 
            backgroundColor: isDarkMode ? theme.surface : '#FCFAF2' 
          }
        ]}>
          
          {/* Centered Beautiful Basmalah Header */}
          {currentPage === 2 && (
            <View style={styles.basmalahContainer}>
              <Text style={[styles.basmalah, { color: isDarkMode ? theme.secondary : theme.primary }]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <View style={[styles.basmalahDivider, { backgroundColor: theme.secondary + '60' }]} />
            </View>
          )}

          {/* Continuous Quranic Flow */}
          <Text style={styles.textFlow}>
            {pageAyahs.map((ayah: any, index: number) => {
              const isPlayingThis = playingAyahIndex === index;
              const displayText = cleanAyahText(ayah.text, index);
              
              return (
                <Text 
                  key={ayah.number} 
                  onPress={() => handleAyahTap(index)}
                  style={[
                    styles.ayahText, 
                    { 
                      fontSize: fontSize, 
                      color: isPlayingThis 
                        ? (isDarkMode ? theme.secondary : '#B8860B') 
                        : theme.text,
                      backgroundColor: isPlayingThis 
                        ? (isDarkMode ? 'rgba(255, 213, 79, 0.12)' : 'rgba(212, 175, 55, 0.14)') 
                        : 'transparent',
                    }
                  ]}
                >
                  {displayText}{' '}
                  <Text style={[styles.ayahBracket, { fontSize: fontSize * 0.9, color: theme.primary }]}>
                    ﴿
                    <Text style={[styles.ayahNumber, { fontSize: fontSize * 0.7, color: theme.primary }]}>
                      {ayah.numberInSurah}
                    </Text>
                    ﴾
                  </Text>{' '}
                </Text>
              );
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Design Audio Recitation Toolbar */}
      <View style={[
        styles.audioToolbar, 
        { 
          backgroundColor: theme.surface, 
          borderTopColor: theme.border,
          shadowColor: '#000',
        }
      ]}>
        
        {/* Playback Settings Toggle (Autoplay next page) */}
        <View style={styles.autoplayToggleContainer}>
          <Text style={[styles.autoplayText, { color: theme.subtext }]}>التشغيل التلقائي</Text>
          <Switch 
            value={autoplayNext}
            onValueChange={(val) => {
              triggerHaptic('light');
              setAutoplayNext(val);
            }}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor={autoplayNext ? theme.secondary : '#f4f3f4'}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>

        <View style={styles.audioMeta}>
          <Text style={[styles.audioTitle, { color: theme.text }]}>القارئ محمد أيوب</Text>
          {loadingAudio ? (
            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 2 }} />
          ) : playingAyahIndex !== null ? (
            <View style={styles.activeAyahBadge}>
              <Text style={[styles.audioStatus, { color: theme.primary }]}>
                الآية {pageAyahs[playingAyahIndex]?.numberInSurah}
              </Text>
            </View>
          ) : (
            <Text style={[styles.audioStatus, { color: theme.subtext }]}>جاهز للتلاوة</Text>
          )}
        </View>

        <View style={styles.audioControls}>
          {playingAyahIndex !== null && (
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isDarkMode ? '#333' : '#ECEFF1' }]} 
              onPress={() => {
                triggerHaptic('light');
                stopRecitation();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="square" size={18} color={isDarkMode ? '#FFF' : '#37474F'} />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.playButton, { backgroundColor: theme.primary }]} 
            onPress={handlePlayPause}
            disabled={loadingAudio}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#FFFFFF" 
              style={{ marginRight: isPlaying ? 0 : -3 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Completion Action Bottom Bar */}
      <View style={[styles.bottomToolbar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            { 
              backgroundColor: isPageCompleted ? (isDarkMode ? '#1B5E20' + '30' : '#E8F5E9') : theme.primary,
              borderColor: theme.primary,
              borderWidth: isPageCompleted ? 1.5 : 0
            }
          ]}
          onPress={handleToggleCompleted}
          activeOpacity={0.85}
        >
          <Text style={[styles.completeButtonText, { color: isPageCompleted ? theme.primary : '#FFFFFF' }]}>
            {isPageCompleted ? "تراجع عن إكمال الصفحة" : "أتممت قراءة هذه الصفحة ✅"}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    height: 70,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageSwitcher: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  navArrow: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'Amiri-Bold',
    minWidth: 80,
    textAlign: 'center',
  },
  completedIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  quranScrollContent: {
    padding: 16,
    paddingBottom: 170,
  },
  mushafBorder: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'solid',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },
  basmalahContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  basmalah: {
    fontSize: 28,
    fontFamily: 'Amiri-Bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  basmalahDivider: {
    width: width * 0.4,
    height: 1.5,
    marginTop: 8,
    borderRadius: 1,
  },
  textFlow: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 56,
  },
  ayahText: {
    fontFamily: 'Amiri-Regular',
    paddingVertical: 2,
    borderRadius: 6,
  },
  ayahBracket: {
    fontFamily: 'Amiri-Bold',
  },
  ayahNumber: {
    fontFamily: 'Amiri-Bold',
  },
  audioToolbar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 72,
    borderTopWidth: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 10,
  },
  autoplayToggleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  autoplayText: {
    fontSize: 11,
    fontFamily: 'Amiri-Regular',
  },
  audioMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  audioTitle: {
    fontSize: 14,
    fontFamily: 'Amiri-Bold',
  },
  activeAyahBadge: {
    marginTop: 2,
  },
  audioStatus: {
    fontSize: 12,
    fontFamily: 'Amiri-Regular',
  },
  audioControls: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  bottomToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  completeButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
