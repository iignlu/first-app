import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Switch, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { scheduleDailyReminder } from '../utils/notifications';

export const SettingsScreen = () => {
  const { 
    isDarkMode, setDarkMode, 
    fontSize, setFontSize,
    notificationsEnabled, setNotificationsEnabled,
    resetProgress 
  } = useAppStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;

  const handleReset = () => {
    Alert.alert(
      'إعادة تعيين التقدم',
      'هل أنت متأكد من رغبتك في مسح كافة تقدمك في القراءة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'نعم، امسح', style: 'destructive', onPress: resetProgress }
      ]
    );
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await scheduleDailyReminder('08:00'); // Default time
    }
  };

  const SettingItem = ({ icon, title, children }: any) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
      <View style={styles.settingLabel}>
        <Ionicons name={icon} size={24} color={theme.primary} style={{ marginLeft: 15 }} />
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>الإعدادات</Text>
        </View>

        <View style={styles.section}>
          <SettingItem icon="moon" title="الوضع الليلي">
            <Switch 
              value={isDarkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </SettingItem>

          <SettingItem icon="text" title="حجم الخط">
            <View style={styles.fontSizeControls}>
              <TouchableOpacity onPress={() => setFontSize(Math.max(16, fontSize - 2))}>
                <Ionicons name="remove-circle-outline" size={32} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.fontSizeValue, { color: theme.text }]}>{fontSize}</Text>
              <TouchableOpacity onPress={() => setFontSize(Math.min(48, fontSize + 2))}>
                <Ionicons name="add-circle-outline" size={32} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </SettingItem>

          <SettingItem icon="notifications" title="التنبيهات اليومية">
            <Switch 
              value={notificationsEnabled} 
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: theme.primary }}
            />
          </SettingItem>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
            <Ionicons name="trash-outline" size={24} color="#B00020" style={{ marginLeft: 10 }} />
            <Text style={styles.dangerButtonText}>إعادة تعيين التقدم</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={[styles.aboutText, { color: theme.subtext }]}>إصدار التطبيق 1.0.0</Text>
          <Text style={[styles.aboutText, { color: theme.subtext, marginTop: 5 }]}>
            نص المصحف معتمد من Tanzil.net
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Amiri-Bold',
  },
  section: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 18,
    fontFamily: 'Amiri-Regular',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeValue: {
    fontSize: 20,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  dangerButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFEBEE',
  },
  dangerButtonText: {
    color: '#B00020',
    fontSize: 18,
    fontFamily: 'Amiri-Bold',
  },
  aboutSection: {
    alignItems: 'center',
    padding: 40,
  },
  aboutText: {
    fontSize: 14,
  }
});
