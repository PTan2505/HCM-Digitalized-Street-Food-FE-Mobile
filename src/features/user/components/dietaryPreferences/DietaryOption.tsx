import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX } from 'react';
import { Pressable, Text, View } from 'react-native';

export type DietaryOptionProps = {
  dietaryPreference: DietaryPreference;
  isSelected?: boolean;
  onSelect?: () => void;
};

const DietaryOption = (props: DietaryOptionProps): JSX.Element => {
  return (
    <Pressable
      className="flex-row items-center rounded-xl border border-gray-200 bg-white p-4"
      onPress={props.onSelect}
    >
      {/* Icon */}
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary-light/20">
        <MaterialCommunityIcons
          name={
            (props.dietaryPreference.icon as never) || ('food-variant' as never)
          }
          size={24}
          color="#7AB82D"
        />
      </View>

      {/* Text Content */}
      <View className="mr-auto flex-1">
        <Text className="mb-1 text-base font-semibold text-gray-900">
          {props.dietaryPreference.name}
        </Text>
        {props.dietaryPreference.description && (
          <Text className="text-sm text-gray-600">
            {props.dietaryPreference.description}
          </Text>
        )}
      </View>

      {/* Checkbox */}
      <View
        className={`h-6 w-6 items-center justify-center rounded border-2 ${
          props.isSelected
            ? 'border-primary bg-primary'
            : 'border-gray-300 bg-white'
        }`}
      >
        {props.isSelected && (
          <MaterialCommunityIcons name="check" size={16} color="white" />
        )}
      </View>
    </Pressable>
  );
};

export default DietaryOption;
