import DietaryOption from '@features/user/components/dietaryPreferences/DietaryOption';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX } from 'react';
import { View } from 'react-native';

type Props = {
  dietaryOptions: DietaryPreference[];
  setFocusOptionId?: (id: number | null) => void;
  selectedOptions: number[];
  setSelectedOptions: (options: number[]) => void;
};

const DietaryList = (props: Props): JSX.Element => {
  const handleSelectOption = (id: number): void => {
    props.setFocusOptionId?.(id);
    props.setSelectedOptions(
      props.selectedOptions.includes(id)
        ? props.selectedOptions.filter((optionId) => optionId !== id)
        : [...props.selectedOptions, id]
    );
  };
  return (
    <View className="w-full gap-3">
      {props.dietaryOptions.map((option) => (
        <DietaryOption
          key={option.dietaryPreferenceId}
          dietaryPreference={option}
          isSelected={props.selectedOptions.includes(
            option.dietaryPreferenceId
          )}
          onSelect={() => handleSelectOption(option.dietaryPreferenceId)}
        />
      ))}
    </View>
  );
};

export default DietaryList;
