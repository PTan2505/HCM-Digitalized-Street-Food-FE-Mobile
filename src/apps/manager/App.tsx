import { ManagerCustomTheme } from '@manager-app/navigation/customNavigationTheme';
import { ManagerNavigation } from '@manager-app/navigation/stackNavigator';
import { ManagerAppProvider } from '@manager-app/provider';
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { setGlobalStyles } from '@utils/setGlobalStyles';
import { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
      <ManagerAppProvider>
        <ManagerNavigation theme={ManagerCustomTheme} />
      </ManagerAppProvider>
    </GestureHandlerRootView>
  );
}
