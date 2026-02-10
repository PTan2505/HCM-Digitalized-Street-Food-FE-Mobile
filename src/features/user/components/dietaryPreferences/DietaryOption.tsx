import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX } from 'react';
import { Pressable, Text } from 'react-native';

export type DietaryOptionProps = {
  dietaryPreference: DietaryPreference;
  isSelected?: boolean;
  onSelect?: () => void;
};

const DietaryOption = (props: DietaryOptionProps): JSX.Element => {
  return (
    <Pressable
      className={`self-start rounded-3xl border-[1px] border-[#a1d973] px-4 py-2 ${
        props.isSelected ? 'bg-[#a1d973]' : 'bg-transparent'
      } active:bg-[#a1d973]`}
      onPress={props.onSelect}
    >
      <Text
        className={`text-base font-semibold ${props.isSelected ? 'text-white' : 'text-[#a1d973]'}`}
      >
        {props.dietaryPreference.name}
      </Text>
    </Pressable>
  );
};

export default DietaryOption;
