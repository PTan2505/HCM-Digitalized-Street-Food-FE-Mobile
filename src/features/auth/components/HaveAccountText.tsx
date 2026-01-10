import type { JSX } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface HaveAccountTextProps {
  text: string;
  linkText: string;
  navigateTo: 'Login' | 'Register';
}

export const HaveAccountText = ({
  text,
  linkText,
  navigateTo,
}: HaveAccountTextProps): JSX.Element => {
  const navigation = useNavigation();
  return (
    <View className="mt-2 flex-row items-center justify-center pb-2">
      <Text className="body-medium mt-6 text-center text-[#616161]">
        {text}{' '}
        <Text
          className="font-semibold text-[#a1d973]"
          onPress={() => navigation.navigate(navigateTo)}
        >
          {linkText}
        </Text>
      </Text>
    </View>
  );
};
