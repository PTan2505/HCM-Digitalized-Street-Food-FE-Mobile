import { store } from '@app/store';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { loadUserFromStorage, selectUserStatus } from '@slices/auth';
import * as React from 'react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';

function AppInitializer({
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

  return <>{children}</>;
}

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
