import { managerStore } from '@manager-app/store';
import {
  useManagerDispatch,
  useManagerSelector,
} from '@manager-app/managerHooks';
import { useManagerRoleGate } from '@manager/hooks/useManagerRoleGate';
import { loadUserFromStorage } from '@slices/auth';
import { queryClient } from '@lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { KeyboardProvider } from 'react-native-keyboard-controller';

function ManagerAppInitializer({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const dispatch = useManagerDispatch();
  const userStatus = useManagerSelector((state) => state.user.status);

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  useManagerRoleGate();

  return <>{children}</>;
}

export function ManagerAppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={managerStore}>
        <KeyboardProvider>
          <ManagerAppInitializer>{children}</ManagerAppInitializer>
        </KeyboardProvider>
      </Provider>
    </QueryClientProvider>
  );
}
