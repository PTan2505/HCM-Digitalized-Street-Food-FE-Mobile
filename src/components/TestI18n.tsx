import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../utils/i18n';

export const TestI18n: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('welcome')}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('home')}</Text>
        <Text style={styles.label}>{t('detail')}</Text>
        <Text style={styles.label}>{t('go_to_detail')}</Text>
        <Text style={styles.label}>{t('back')}</Text>
        <Text style={styles.label}>{t('setting')}</Text>
      </View>

      <View style={styles.languageSection}>
        <Text style={styles.subtitle}>{t('change_language')}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              i18n.language === 'vi' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('vi')}
          >
            <Text style={styles.buttonText}>Tiếng Việt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              i18n.language === 'en' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.currentLang}>
        {t('language')}: {i18n.language}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    color: '#555',
  },
  languageSection: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: 'lightblue',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  currentLang: {
    marginTop: 30,
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
  },
});
