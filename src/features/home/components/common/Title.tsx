import type { JSX } from 'react';
import { Text } from 'react-native';

interface TitleProps {
  children: string;
}

const Title = ({ children }: TitleProps): JSX.Element => {
  return <Text className="title-md">{children}</Text>;
};

export default Title;
