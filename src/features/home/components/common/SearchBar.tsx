import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onFilterPress?: () => void;
  onPress?: () => void;
  editable?: boolean;
  noMargin?: boolean;
  autoFocus?: boolean;
}

const SearchBar = ({
  placeholder,
  onSearch,
  onFilterPress,
  onPress,
  editable = true,
  noMargin = false,
  autoFocus = false,
}: SearchBarProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <View className={noMargin ? '' : 'mx-4 mb-4'}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
      >
        <View className="flex-row items-center rounded-[50px] bg-white px-4 py-4 shadow-sm">
          <Ionicons name="search" size={20} color="#588d22" />

          <TextInput
            placeholder={placeholder ?? t('search_placeholder')}
            placeholderTextColor="#9CA3AF"
            onChangeText={onSearch}
            className="ml-3 flex-1 text-base text-gray-900"
            editable={editable && !onPress}
            pointerEvents={onPress ? 'none' : 'auto'}
            textAlignVertical="center"
            autoFocus={autoFocus}
          />

          <TouchableOpacity className="ml-2" onPress={onFilterPress}>
            <Ionicons name="options-outline" size={20} color="#588d22" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
