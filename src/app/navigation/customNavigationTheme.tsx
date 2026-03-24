import { DefaultTheme } from '@react-navigation/native';

export const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    fonts: ['Nunito'],
    primary: 'rgba(255, 255, 255, 1)',
  },
};
