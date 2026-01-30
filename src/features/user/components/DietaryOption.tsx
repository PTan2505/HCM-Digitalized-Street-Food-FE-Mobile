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
      className={`self-start rounded-3xl border-[1px] border-teal-600 px-4 py-2 ${
        props.isSelected ? 'bg-teal-600' : 'bg-transparent'
      } active:bg-teal-600`}
      onPress={props.onSelect}
    >
      <Text>{props.dietaryPreference.name}</Text>
    </Pressable>
  );
};

export default DietaryOption;
