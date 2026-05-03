import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { QuranText } from '../components/QuranText';
import baqarahData from '../data/baqarah.json';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { lastAyahIndex, streakDays, isDarkMode } = useAppStore();
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const totalAyahs = baqarahData.data.numberOfAyahs;
  const progress = ((lastAyahIndex / totalAyahs) * 100).toFixed(1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.greeting}>تقبل الله طاعاتكم 🌿</Text>
          <Text style={styles.appName}>رفيق البقرة</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="flame" size={32} color="#FF7043" />
            <Text style={[styles.statValue, { color: theme.text }]}>{streakDays}</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>أيام متتالية</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="analytics" size={32} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{progress}%</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>نسبة الإنجاز</Text>
          </View>
        </View>

        <View style={[styles.resumeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <QuranText style={[styles.resumeTitle, { color: theme.primary }]}>سورة البقرة</QuranText>
          <Text style={[styles.resumeSubtitle, { color: theme.subtext }]}>
            وصلت إلى الآية رقم {lastAyahIndex + 1}
          </Text>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.secondary }]} />
          </View>

          <TouchableOpacity 
            style={[styles.resumeButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Quran')}
          >
            <Text style={styles.resumeButtonText}>أكمل القراءة</Text>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.dailyInspiration}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>حكمة اليوم</Text>
          <View style={[styles.wisdomCard, { backgroundColor: theme.primary + '10', borderLeftColor: theme.primary }]}>
            <Text style={[styles.wisdomText, { color: theme.text }]}>
              "البيت الذي تُقرأ فيه سورة البقرة لا يدخله الشيطان"
            </Text>
            <Text style={[styles.wisdomSource, { color: theme.subtext }]}>- حديث شريف</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    height: 200,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    color: '#E8F5E9',
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
    marginBottom: 5,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Amiri-Bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: -40,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  resumeCard: {
    margin: 20,
    padding: 25,
    borderRadius: 25,
    borderWidth: 1,
    elevation: 2,
  },
  resumeTitle: {
    fontSize: 28,
    textAlign: 'center',
  },
  resumeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 25,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  resumeButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dailyInspiration: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Amiri-Bold',
    marginBottom: 15,
  },
  wisdomCard: {
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
  },
  wisdomText: {
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 28,
    textAlign: 'right',
  },
  wisdomSource: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'left',
  }
});
