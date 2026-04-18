import { managerStore } from '@manager-app/store';
import { NotificationHandler } from '@features/notifications/NotificationHandler';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUserStatus } from '@slices/auth';
import * as React from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { KeyboardProvider } from 'react-native-keyboard-controller';

function ManagerAppInitializer({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const dispatch = useAppDispatch();
  const userStatus = useAppSelector(selectUserStatus);

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  return (
    <>
      <NotificationHandler />
      {children}
    </>
  );
}

export function ManagerAppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Provider store={managerStore}>
      <KeyboardProvider>
        <ManagerAppInitializer>{children}</ManagerAppInitializer>
      </KeyboardProvider>
    </Provider>
  );
}
