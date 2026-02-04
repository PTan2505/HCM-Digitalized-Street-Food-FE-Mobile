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
      className={`self-start rounded-3xl border-[1px] border-[#06AA4C] px-4 py-2 ${
        props.isSelected ? 'bg-[#06AA4C]' : 'bg-transparent'
      } active:bg-[#06AA4C]`}
      onPress={props.onSelect}
    >
      <Text
        className={`text-base font-semibold ${props.isSelected ? 'text-white' : 'text-[#06AA4C]'}`}
      >
        {props.dietaryPreference.name}
      </Text>
    </Pressable>
  );
};

export default DietaryOption;
