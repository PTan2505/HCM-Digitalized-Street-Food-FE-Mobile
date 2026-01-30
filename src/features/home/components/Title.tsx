import type { JSX } from 'react';
import { Text } from 'react-native';

interface TitleProps {
  children: string;
}

const Title = ({ children }: TitleProps): JSX.Element => {
  return (
    <Text className="font-nunito title-md font-semibold text-[#a5cf7bff]">
      {children}
    </Text>
  );
};

export default Title;
