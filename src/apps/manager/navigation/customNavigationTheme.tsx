import { DefaultTheme } from '@react-navigation/native';

export const ManagerCustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    fonts: ['Nunito'],
    primary: 'rgba(255, 255, 255, 1)',
  },
};
