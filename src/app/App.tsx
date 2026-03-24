import { CustomTheme } from '@app/navigation/customNavigationTheme';
import { Navigation } from '@app/navigation/stackNavigator';
import { AppProvider } from '@app/provider';
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
import { ActivityIndicator, View } from 'react-native';

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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppProvider>
      <Navigation theme={CustomTheme} />
    </AppProvider>
  );
}
