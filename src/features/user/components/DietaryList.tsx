import DietaryOption from '@features/user/components/DietaryOption';
import { DietaryPreference } from '@features/user/types/dietaryPreference';
import React, { JSX, useState } from 'react';
import { View } from 'react-native';

type Props = {
  dietaryOptions: DietaryPreference[];
  setFocusOptionId?: (id: number | null) => void;
};

const DietaryList = (props: Props): JSX.Element => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  const handleSelectOption = (id: number): void => {
    props.setFocusOptionId?.(id);
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((optionId) => optionId !== id)
        : [...prevSelected, id]
    );
  };
  return (
    <View className="w-full flex-row flex-wrap gap-2">
      {props.dietaryOptions.map((option) => (
        <View key={option.dietaryPreferenceId}>
          <DietaryOption
            dietaryPreference={option}
            isSelected={selectedOptions.includes(option.dietaryPreferenceId)}
            onSelect={() => handleSelectOption(option.dietaryPreferenceId)}
          />
        </View>
      ))}
    </View>
  );
};

export default DietaryList;
