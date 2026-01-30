import DietaryOption, {
  DietaryOptionProps,
} from '@features/user/components/DietaryOption';
import React, { JSX, useState } from 'react';
import { View } from 'react-native';

type Props = {
  dietaryOptions: DietaryOptionProps[];
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
        <View key={option.id}>
          <DietaryOption
            isSelected={selectedOptions.includes(option.id)}
            {...option}
            onSelect={() => handleSelectOption(option.id)}
          />
        </View>
      ))}
    </View>
  );
};

export default DietaryList;
