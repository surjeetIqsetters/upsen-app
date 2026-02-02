import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@app/types';
import { Colors, Typography, Spacing, BorderRadius } from '@app/utils/constants';
import { useLanguageStore } from '@app/store/languageStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Language {
  code: string;
  name: string;
  flag: string;
  isRTL: boolean;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'es', name: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'fr', name: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'zh', name: '中文', flag: '🇨🇳', isRTL: false },
  { code: 'ja', name: '日本語', flag: '🇯🇵', isRTL: false },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', isRTL: true },
];

export const LanguageSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { currentLanguage, setLanguage } = useLanguageStore();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageSelect = async (language: Language) => {
    const code = language.code as any;
    setSelectedLanguage(code);
    await setLanguage(code);
    if (language.isRTL) {
      // Handle RTL layout change
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Select Language</Text>

        <View style={styles.languageList}>
          {languages.map((language, index) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                index !== languages.length - 1 && styles.languageItemBorder,
                selectedLanguage === language.code && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{language.flag}</Text>
                <Text style={styles.languageName}>{language.name}</Text>
                {language.isRTL && (
                  <View style={styles.rtlBadge}>
                    <Text style={styles.rtlText}>RTL</Text>
                  </View>
                )}
              </View>

              {selectedLanguage === language.code && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Changing the language will restart the app to apply the new settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  languageList: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  languageItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedLanguage: {
    backgroundColor: Colors.primaryLighter,
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  languageName: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.medium,
  },
  rtlBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  rtlText: {
    fontSize: Typography.size.xs,
    color: Colors.warning,
    fontWeight: Typography.weight.semibold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.info,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
});
