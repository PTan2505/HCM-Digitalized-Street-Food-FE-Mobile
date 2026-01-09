import { View, TextInput, TouchableOpacity } from 'react-native';
import type { JSX } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
}

const SearchBar = ({
  placeholder = 'Tìm nhà hàng, quán cà phê',
  onSearch,
}: SearchBarProps): JSX.Element => {
  return (
    <View className="mx-4 mb-4">
      <View className="flex-row items-center rounded-[50px] bg-white px-4 py-4 shadow-sm">
        <Ionicons name="search" size={20} color="#588d22" />

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onChangeText={onSearch}
          className="ml-3 flex-1 text-base text-gray-900"
        />

        <TouchableOpacity className="ml-2">
          <Ionicons name="options-outline" size={20} color="#588d22" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SearchBar;
