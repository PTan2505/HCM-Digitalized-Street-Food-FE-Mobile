import { CustomTheme } from '@app/navigation/customNavigationTheme';
import { Navigation } from '@app/navigation/stackNavigator';
import { AppProvider } from '@app/provider';
import { Nunito_400Regular, useFonts } from '@expo-google-fonts/nunito';
import { setGlobalStyles } from '@utils/setGlobalStyles';
import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

setGlobalStyles();

export default function App(): ReactNode {
  const [fontsLoaded] = useFonts({
    Nunito: Nunito_400Regular,
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
