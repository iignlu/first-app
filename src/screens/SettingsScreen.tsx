import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../storage/useAppStore';
import { colors } from '../theme/colors';
import { triggerHaptic } from '../utils/haptics';

export const SettingsScreen = () => {
  const { 
    userName = 'صديقي', setUserName,
    isDarkMode = false, setDarkMode,
    fontSize = 24, setFontSize,
    resetProgress 
  } = useAppStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;

  // States for name customization
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  // Sync tempName when userName changes
  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  const handleReset = () => {
    triggerHaptic('medium');
    if (Platform.OS === 'web') {
      const confirmReset = window.confirm(
        'إعادة تعيين التقدم ⚠️\n\nهل أنت متأكد من رغبتك في مسح كافة الصفحات المقروءة وإعادة التعيين إلى صفحة البدء (صفحة 2)؟ لا يمكن التراجع عن هذا الإجراء.'
      );
      if (confirmReset) {
        triggerHaptic('success');
        resetProgress();
      }
    } else {
      Alert.alert(
        'إعادة تعيين التقدم ⚠️',
        'هل أنت متأكد من رغبتك في مسح كافة الصفحات المقروءة وإعادة التعيين إلى صفحة البدء (صفحة 2)؟ لا يمكن التراجع عن هذا الإجراء.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'نعم، امسح التقدم', 
            style: 'destructive', 
            onPress: () => {
              triggerHaptic('success');
              resetProgress();
            } 
          }
        ]
      );
    }
  };

  const handleSaveName = () => {
    triggerHaptic('success');
    setUserName(tempName);
    setIsEditingName(false);
  };

  const handleDarkModeChange = (val: boolean) => {
    triggerHaptic('light');
    setDarkMode(val);
  };

  const handleFontSizeChange = (size: number) => {
    triggerHaptic('light');
    setFontSize(size);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>الإعدادات</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>تخصيص رفيق البقرة بما يناسبك</Text>
        </View>

        {/* Configuration Section */}
        <View style={styles.section}>
          
          {/* User Name Item */}
          <View style={[styles.settingContainer, { borderBottomColor: theme.border }]}>
            <TouchableOpacity 
              style={styles.settingItemRow}
              onPress={() => {
                triggerHaptic('light');
                setIsEditingName(!isEditingName);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLabel}>
                <Ionicons name="person-outline" size={24} color={theme.primary} style={{ marginLeft: 15 }} />
                <Text style={[styles.settingTitle, { color: theme.text }]}>اسمك الشخصي</Text>
              </View>
              {!isEditingName && (
                <View style={styles.userNameDisplay}>
                  <Text style={[styles.userNameText, { color: theme.primary }]}>{userName}</Text>
                  <Ionicons name="pencil-outline" size={16} color={theme.subtext} style={{ marginLeft: 5 }} />
                </View>
              )}
            </TouchableOpacity>

            {isEditingName && (
              <View style={[styles.nameEditBox, { backgroundColor: isDarkMode ? '#222' : '#F5F5F5' }]}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.primary }]}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder="اكتب اسمك هنا..."
                  placeholderTextColor={theme.subtext}
                  maxLength={15}
                />
                <TouchableOpacity 
                  style={[styles.saveNameButton, { backgroundColor: theme.primary }]}
                  onPress={handleSaveName}
                >
                  <Text style={styles.saveNameText}>حفظ</Text>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 5 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Dark Mode */}
          <SettingItem icon="moon" title="الوضع الليلي">
            <Switch 
              value={isDarkMode} 
              onValueChange={handleDarkModeChange}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={isDarkMode ? theme.secondary : '#f4f3f4'}
            />
          </SettingItem>

          {/* Font Size Selector */}
          <SettingItem icon="text" title="حجم خط القراءة">
            <View style={styles.fontSizeControls}>
              <TouchableOpacity onPress={() => handleFontSizeChange(Math.max(16, fontSize - 2))}>
                <Ionicons name="remove-circle-outline" size={32} color={theme.primary} />
              </TouchableOpacity>
              <Text style={[styles.fontSizeValue, { color: theme.text }]}>{fontSize}</Text>
              <TouchableOpacity onPress={() => handleFontSizeChange(Math.min(48, fontSize + 2))}>
                <Ionicons name="add-circle-outline" size={32} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </SettingItem>



        </View>

        {/* Danger/Reset Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
            <Ionicons name="trash-outline" size={24} color="#B00020" style={{ marginLeft: 10 }} />
            <Text style={styles.dangerButtonText}>إعادة تعيين التقدم</Text>
          </TouchableOpacity>
        </View>

        {/* About App Info */}
        <View style={styles.aboutSection}>
          <Text style={[styles.aboutText, { color: theme.subtext }]}>إصدار التطبيق 2.0.0 (تحديث الصفحات)</Text>
          <Text style={[styles.aboutText, { color: theme.subtext, marginTop: 5 }]}>
            نص المصحف وتفصيل الصفحات معتمد من Tanzil.net
          </Text>
          <Text style={[styles.aboutText, { color: theme.subtext, marginTop: 5 }]}>
            التلاوة بصوت القارئ الشيخ محمد أيوب رحمه الله
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
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Amiri-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Amiri-Regular',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingContainer: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  settingItemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
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
  userNameDisplay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameEditBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  nameInput: {
    flex: 1,
    height: 40,
    borderBottomWidth: 1.5,
    paddingHorizontal: 10,
    fontSize: 15,
    textAlign: 'right',
  },
  saveNameButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 36,
    borderRadius: 18,
    marginRight: 15,
  },
  saveNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timePart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 2,
    width: 30,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 4,
    paddingBottom: 2,
  },
  dangerButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
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
    fontSize: 13,
    fontFamily: 'Amiri-Regular',
    textAlign: 'center',
  }
});
