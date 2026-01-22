import type { JSX } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
}

const SortModal: (props: SortModalProps) => JSX.Element = ({
  visible,
  onClose,
  selectedSort,
  onSelectSort,
}) => {
  const sortOptions = [
    { id: 'distance', label: 'Khoảng cách' },
    { id: 'newest', label: 'Mới nhất' },
    { id: 'votes', label: 'Lượt vote' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1 items-center justify-center px-4">
          <Pressable
            className="w-full max-w-sm rounded-2xl bg-white p-5"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-[18px] font-semibold text-black">
                Sắp xếp theo
              </Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="mb-4 h-[1px] bg-gray-200" />

            {/* Sort Options */}
            <View className="gap-4">
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className="flex-row items-center justify-between py-2"
                  onPress={() => onSelectSort(option.id)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[16px] text-black">{option.label}</Text>
                  <View
                    className={`h-6 w-6 rounded-full border-2 ${
                      selectedSort === option.id
                        ? 'border-[#06AA4C]'
                        : 'border-gray-300'
                    } items-center justify-center`}
                  >
                    {selectedSort === option.id && (
                      <View className="h-3.5 w-3.5 rounded-full bg-[#06AA4C]" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default SortModal;
