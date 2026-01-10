import type { JSX } from 'react';
import { Pressable, Text } from 'react-native';

interface CustomButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text: string;
  loadingText?: string;
  className?: string;
}

export const CustomButton = ({
  onPress,
  disabled = false,
  isLoading = false,
  text,
  loadingText,
  className = '',
}: CustomButtonProps): JSX.Element => {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={`mt-5 w-full items-center justify-center rounded-2xl bg-[#a1d973] px-4 py-5 ${
        isDisabled ? 'opacity-60' : ''
      } ${className}`.trim()}
    >
      <Text className="title-medium font-semibold text-[#F8F8FF]">
        {isLoading && loadingText ? loadingText : text}
      </Text>
    </Pressable>
  );
};
