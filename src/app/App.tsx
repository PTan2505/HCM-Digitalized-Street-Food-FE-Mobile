import { JSX } from 'react';
import { AppProvider } from '@app/provider';
import { Navigation } from '@app/navigation/stackNavigator';

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
