import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { virtues } from '../data/virtues';
import { triggerHaptic } from '../utils/haptics';

const { width, height } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { 
    userName = 'صديقي',
    currentPage = 2, 
    completedPages = [], 
    dailyPagesRead = {}, 
    streakDays = 0, 
    isDarkMode = false,
    updateStreakOnOpen,
    resetProgress
  } = useAppStore();

  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Total pages in Surah Al-Baqarah are 48 (Page 2 to Page 49)
  const totalPages = 48;
  const progressPercent = Math.min(100, Math.round((completedPages.length / totalPages) * 100));
  const isFinished = completedPages.length === totalPages;

  // Initialize active virtue index based on current day of the year for automatic daily rotation
  const getInitialVirtueIndex = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day % virtues.length;
  };

  const [activeVirtueIndex, setActiveVirtueIndex] = useState(getInitialVirtueIndex());

  // Update streak when user opens the screen
  useEffect(() => {
    updateStreakOnOpen();
  }, []);

  // Get pages read today
  const today = new Date().toISOString().split('T')[0];
  const pagesReadToday = dailyPagesRead[today] || [];
  const readTodayCount = pagesReadToday.length;



  const handleStartReading = () => {
    triggerHaptic('medium');
    navigation.navigate('Quran');
  };

  const handleRestartJourney = () => {
    triggerHaptic('success');
    resetProgress();
  };

  const handleNextVirtue = () => {
    triggerHaptic('light');
    setActiveVirtueIndex((prev) => (prev + 1) % virtues.length);
  };

  const handlePrevVirtue = () => {
    triggerHaptic('light');
    setActiveVirtueIndex((prev) => (prev - 1 + virtues.length) % virtues.length);
  };

  const activeVirtue = virtues[activeVirtueIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.greeting}>أهلاً بك يا {userName} 🌿</Text>
          <Text style={styles.appName}>رفيق البقرة</Text>
          <Text style={styles.tagline}>وردك اليومي المحفوظ والمسموع</Text>
        </View>

        {/* Stats Cards (Streaks & Total Progress) */}
        <View style={styles.statsContainer}>
          {/* Streak Card */}
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="flame" size={36} color="#FF7043" />
            <Text style={[styles.statValue, { color: theme.text }]}>{streakDays}</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>أيام متتالية</Text>
          </View>

          {/* Progress Card */}
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="trophy" size={36} color={theme.secondary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{progressPercent}%</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>نسبة الختم</Text>
          </View>
        </View>

        {/* Main CTA & Current Page Progress Card */}
        <View style={[styles.mainProgressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.pageIndicatorContainer}>
            <View style={[styles.pageIndicatorBadge, { backgroundColor: theme.primary + '15' }]}>
              <Text style={[styles.pageIndicatorText, { color: theme.primary }]}>الصفحة الحالية</Text>
            </View>
            <Text style={[styles.pageNumberTitle, { color: theme.text }]}>صفحة {currentPage}</Text>
          </View>
          
          <Text style={[styles.progressDetailedText, { color: theme.subtext }]}>
            أنجزت {completedPages.length} صفحة من أصل {totalPages} صفحات (من صفحة 2 إلى 49)
          </Text>

          {/* Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? '#333333' : '#EAE6D9' }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.secondary }]} />
          </View>

          {/* Contextual CTA Button */}
          <TouchableOpacity 
            style={[styles.ctaButton, { backgroundColor: theme.primary }]}
            onPress={handleStartReading}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>
              {readTodayCount > 0 
                ? `قراءة صفحة أخرى (صفحة ${currentPage})`
                : `ابدأ قراءة صفحة اليوم (صفحة ${currentPage})`
              }
            </Text>
            <Ionicons name="book" size={22} color="#FFFFFF" style={styles.ctaIcon} />
          </TouchableOpacity>
        </View>

        {/* Today's Achievements Section */}
        <View style={[styles.todayCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.todayHeader}>
            <Ionicons name="calendar-outline" size={24} color={theme.primary} />
            <Text style={[styles.todayTitle, { color: theme.text }]}>إنجاز اليوم</Text>
          </View>

          {readTodayCount > 0 ? (
            <View>
              <Text style={[styles.todaySuccessText, { color: theme.text }]}>
                لقد قرأت <Text style={{ color: theme.primary, fontWeight: 'bold' }}>{readTodayCount}</Text> صفحة اليوم! 🎉
              </Text>
              <View style={styles.pagesListContainer}>
                {pagesReadToday.map((p) => (
                  <View key={p} style={[styles.pageBadge, { backgroundColor: theme.primary, borderColor: theme.secondary }]}>
                    <Text style={styles.pageBadgeText}>صفحة {p}</Text>
                    <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.todayEmptyContainer}>
              <Text style={[styles.todayEmptyText, { color: theme.subtext }]}>
                لم تقرأ أي صفحة اليوم بعد. تذكّر أن قراءة صفحة واحدة يومياً لا تستغرق أكثر من دقيقتين ولكن بركتها عظيمة!
              </Text>
            </View>
          )}
        </View>

        {/* Interactive Islamic Virtues Widget */}
        <View style={styles.inspirationContainer}>
          <View style={styles.inspirationHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>بركة سورة البقرة</Text>
            <View style={styles.inspirationControls}>
              <TouchableOpacity onPress={handlePrevVirtue} style={styles.sliderArrow}>
                <Ionicons name="chevron-forward" size={20} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.sliderIndex, { color: theme.subtext }]}>
                {activeVirtueIndex + 1} / {virtues.length}
              </Text>
              <TouchableOpacity onPress={handleNextVirtue} style={styles.sliderArrow}>
                <Ionicons name="chevron-back" size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.wisdomCard, { backgroundColor: theme.primary + '10', borderLeftColor: theme.primary }]}>
            <Text style={[styles.wisdomText, { color: theme.text }]}>
              "{activeVirtue.text}"
            </Text>
            <Text style={[styles.wisdomSource, { color: theme.subtext }]}>- {activeVirtue.source}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Full Screen Celebration Overlay Modal when Surah Al-Baqarah is Completed */}
      <Modal
        visible={isFinished}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.celebrationOverlay}>
          <View style={[styles.celebrationCard, { backgroundColor: '#1B5E20', borderColor: '#D4AF37' }]}>
            
            {/* Calligraphy stars and icons */}
            <View style={styles.celebrationTrophyContainer}>
              <Ionicons name="star" size={32} color="#D4AF37" style={styles.celebrationStar} />
              <View style={[styles.celebrationBadge, { backgroundColor: '#D4AF37' }]}>
                <Ionicons name="trophy" size={54} color="#1B5E20" />
              </View>
              <Ionicons name="star" size={32} color="#D4AF37" style={styles.celebrationStar} />
            </View>

            <Text style={styles.celebrationTitle}>مبارك الختم يا {userName}! 🎉</Text>
            
            <View style={styles.celebrationDivider} />
            
            <Text style={styles.celebrationText}>
              الحمد لله الذي بنعمته تتم الصالحات. لقد أتممت قراءة سورة البقرة كاملة وواظبت على وردك اليومي بنجاح!
            </Text>

            <Text style={styles.celebrationBlessing}>
              نسأل الله أن ينفعك ببركتها، وأن يحفظك ويحفظ بيتك ويملأ حياتك بالخير والسلام والبركات. 🌿
            </Text>

            <TouchableOpacity 
              style={styles.restartButton}
              onPress={handleRestartJourney}
              activeOpacity={0.8}
            >
              <Text style={styles.restartButtonText}>ابدأ رحلة بركة جديدة 🔄</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    height: 220,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  greeting: {
    color: '#E8F5E9',
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
    marginBottom: 5,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: 'Amiri-Bold',
  },
  tagline: {
    color: '#C8E6C9',
    fontSize: 14,
    fontFamily: 'Amiri-Regular',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -35,
  },
  statCard: {
    width: (width - 60) / 2,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Amiri-Regular',
    marginTop: 2,
  },
  mainProgressCard: {
    margin: 20,
    padding: 24,
    borderRadius: 25,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  pageIndicatorContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pageIndicatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  pageIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pageNumberTitle: {
    fontSize: 30,
    fontFamily: 'Amiri-Bold',
  },
  progressDetailedText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Amiri-Regular',
    marginVertical: 12,
    lineHeight: 22,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  ctaButton: {
    flexDirection: 'row-reverse',
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaIcon: {
    marginLeft: 10,
  },
  todayCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    elevation: 2,
  },
  todayHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  todaySuccessText: {
    fontSize: 16,
    fontFamily: 'Amiri-Regular',
    marginBottom: 12,
    textAlign: 'right',
  },
  pagesListContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
  },
  pageBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  todayEmptyContainer: {
    paddingVertical: 10,
  },
  todayEmptyText: {
    fontSize: 15,
    fontFamily: 'Amiri-Regular',
    lineHeight: 24,
    textAlign: 'right',
  },
  inspirationContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  inspirationHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inspirationControls: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  sliderArrow: {
    padding: 5,
  },
  sliderIndex: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Amiri-Bold',
    textAlign: 'right',
  },
  wisdomCard: {
    padding: 20,
    borderRadius: 18,
    borderLeftWidth: 5,
    elevation: 1,
  },
  wisdomText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'right',
    fontFamily: 'Amiri-Regular',
  },
  wisdomSource: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'left',
    fontFamily: 'Amiri-Regular',
  },
  
  // Celebration Screen Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '100%',
    padding: 30,
    borderRadius: 28,
    borderWidth: 2.5,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  celebrationTrophyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  celebrationStar: {
    transform: [{ translateY: 10 }],
  },
  celebrationBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  celebrationTitle: {
    fontSize: 24,
    fontFamily: 'Amiri-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  celebrationDivider: {
    width: '60%',
    height: 1.5,
    backgroundColor: '#D4AF37',
    marginVertical: 18,
    borderRadius: 1,
  },
  celebrationText: {
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
    color: '#E8F5E9',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 15,
  },
  celebrationBlessing: {
    fontSize: 16,
    fontFamily: 'Amiri-Regular',
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  restartButton: {
    backgroundColor: '#D4AF37',
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  restartButtonText: {
    color: '#1B5E20',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
