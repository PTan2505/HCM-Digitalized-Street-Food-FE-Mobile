import optionIcon from '@assets/icons/option.svg';
import SvgIcon from '@components/SvgIcon';
import { Ionicons } from '@expo/vector-icons';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  debounceMs?: number;
}

const SearchBar = ({
  placeholder,
  onSearch,
  onFilterPress,
  onPress,
  editable = true,
  noMargin = false,
  autoFocus = false,
  debounceMs = 400,
}: SearchBarProps): JSX.Element => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearchRef.current?.(inputValue);
    }, debounceMs);
    return (): void => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputValue, debounceMs]);

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
            onChangeText={setInputValue}
            value={inputValue}
            className="ml-3 flex-1 text-base text-gray-900"
            editable={editable && !onPress}
            pointerEvents={onPress ? 'none' : 'auto'}
            textAlignVertical="center"
            autoFocus={autoFocus}
            clearButtonMode="always"
          />

          <TouchableOpacity
            className="ml-2 border-l-[1px] border-gray-300 pl-1"
            onPress={onFilterPress}
          >
            <SvgIcon icon={optionIcon} width={20} height={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
