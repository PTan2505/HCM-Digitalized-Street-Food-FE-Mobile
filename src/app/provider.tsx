import { store } from '@app/store';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  loadUserFromStorage,
  selectUser,
  selectUserStatus,
} from '@slices/auth';
import { getUserDietaryPreferences } from '@slices/dietary';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';

function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const dispatch = useAppDispatch();
  const userStatus = useAppSelector(selectUserStatus);
  const user = useAppSelector(selectUser);
  const hasFetchedDietaryRef = useRef(false);

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  // Load user's dietary preferences once — guarded by ref because the auth
  // slice's global isPending/isFulfilled matchers flip userStatus on every
  // thunk dispatch, which would re-trigger this effect without the guard.
  useEffect(() => {
    if (userStatus === 'succeeded' && user && !hasFetchedDietaryRef.current) {
      hasFetchedDietaryRef.current = true;
      void dispatch(getUserDietaryPreferences());
    }
  }, [dispatch, userStatus, user]);

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
