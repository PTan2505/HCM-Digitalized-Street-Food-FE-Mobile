import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { ManagerCustomTheme } from '@manager-app/navigation/customNavigationTheme';
import { ManagerNavigation } from '@manager-app/navigation/stackNavigator';
import { ManagerAppProvider } from '@manager-app/provider';
import { setGlobalStyles } from '@utils/setGlobalStyles';
import { ReactNode } from 'react';
import { LocaleConfig } from 'react-native-calendars';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ],
  monthNamesShort: [
    'Thg 1',
    'Thg 2',
    'Thg 3',
    'Thg 4',
    'Thg 5',
    'Thg 6',
    'Thg 7',
    'Thg 8',
    'Thg 9',
    'Thg 10',
    'Thg 11',
    'Thg 12',
  ],
  dayNames: [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay',
};

LocaleConfig.defaultLocale = 'vi';
setGlobalStyles();

export default function ManagerApp(): ReactNode {
  const [fontsLoaded] = useFonts({
    Nunito: Nunito_400Regular,
    'Nunito-Light': Nunito_300Light,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ManagerAppProvider>
          <ManagerNavigation theme={ManagerCustomTheme} />
        </ManagerAppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
