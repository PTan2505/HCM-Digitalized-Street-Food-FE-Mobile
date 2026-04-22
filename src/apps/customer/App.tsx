import { CustomTheme } from '@customer-app/navigation/customNavigationTheme';
import { Navigation } from '@customer-app/navigation/stackNavigator';
import { AppProvider, AppSplashGate } from '@customer-app/provider';
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import '@utils/i18n';
import { setGlobalStyles } from '@utils/setGlobalStyles';
import { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

setGlobalStyles();

export default function App(): ReactNode {
  const [fontsLoaded] = useFonts({
    Nunito: Nunito_400Regular,
    'Nunito-Light': Nunito_300Light,
    'Nunito-Medium': Nunito_500Medium,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Nunito-ExtraBold': Nunito_800ExtraBold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppSplashGate fontsLoaded={fontsLoaded ?? false}>
          <Navigation theme={CustomTheme} />
        </AppSplashGate>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
