import { store } from '@app/store';
import * as React from 'react';
import { Provider } from 'react-redux';

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <Provider store={store}>{children}</Provider>;
}
