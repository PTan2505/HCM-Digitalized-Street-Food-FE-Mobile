import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

const LanguageButton = (): JSX.Element => {
  const { i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const isDark = colorScheme === 'dark';

  const currentLang = i18n.language || 'vi';
  const languageLabel = currentLang === 'vi' ? 'Tiếng Việt' : 'English';

  const changeLanguage = async (lng: string): Promise<void> => {
    try {
      setShowDropdown(false);
      console.log('Changing language to:', lng);
      await i18n.changeLanguage(lng);
      console.log('Language changed successfully to:', i18n.language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onPress={() => setShowDropdown(!showDropdown)}
        className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm"
      >
        <Ionicons name="globe-outline" size={18} color="#000000" />
        <Text className="text-sm font-medium text-gray-900">
          {languageLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#000000" />
      </TouchableOpacity>

      {showDropdown && (
        <Modal
          visible={showDropdown}
          transparent
          animationType="none"
          onRequestClose={() => setShowDropdown(false)}
        >
          <Pressable className="flex-1" onPress={() => setShowDropdown(false)}>
            <View
              style={{
                position: 'absolute',
                top: 100,
                right: 12,
                width: 190,
              }}
            >
              <View
                className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                }}
              >
                <TouchableOpacity
                  onPress={() => changeLanguage('vi')}
                  className={`px-4 py-3 ${
                    currentLang === 'vi'
                      ? isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-100'
                      : ''
                  }`}
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                  }}
                >
                  <Text
                    className={`text-base ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    🇻🇳 Tiếng Việt
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => changeLanguage('en')}
                  className={`px-4 py-3 ${
                    currentLang === 'en'
                      ? isDark
                        ? 'bg-gray-700'
                        : 'bg-gray-100'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    🇬🇧 English
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default LanguageButton;
