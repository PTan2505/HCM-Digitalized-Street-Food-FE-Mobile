import { store } from '@app/store';
import { useLocationPermission } from '@features/maps/hooks/useLocationPermission';
import * as Location from 'expo-location';
import { NotificationHandler } from '@features/notifications/NotificationHandler';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { queryClient } from '@lib/queryClient';
import { queryKeys } from '@lib/queryKeys';
import {
  loadUserFromStorage,
  selectUser,
  selectUserStatus,
} from '@slices/auth';
import { fetchActiveBranches, selectBranchesStatus } from '@slices/branches';
import {
  getUserDietaryPreferences,
  selectDietaryState,
  selectUserDietaryPreferences,
} from '@slices/dietary';
import { fetchUnreadCount } from '@slices/notifications';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import LottieSplashScreen from '../screens/LottieSplashScreen';

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

  return (
    <>
      <NotificationHandler />
      {children}
    </>
  );
}

export function AppSplashGate({
  children,
  fontsLoaded,
}: {
  children: React.ReactNode;
  fontsLoaded: boolean;
}): React.JSX.Element {
  const [animationFinished, setAnimationFinished] = useState(false);

  // Safety-net: if the Lottie native module isn't linked (e.g. missing pod),
  // onAnimationFinish never fires and the app would be stuck forever.
  // Animation is ~12s, so 15s gives it full play time + a small buffer.
  useEffect((): (() => void) => {
    const timer = setTimeout(() => setAnimationFinished(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);
  const userDietaryPreferences = useAppSelector(selectUserDietaryPreferences);
  const dietaryStatus = useAppSelector(selectDietaryState);
  const branchesStatus = useAppSelector(selectBranchesStatus);

  const { coords, permissionStatus } = useLocationPermission();

  const queryClientInstance = useQueryClient();

  // Prefetch categories so HomeScreen gets instant data
  useEffect(() => {
    void queryClientInstance.prefetchQuery({
      queryKey: queryKeys.categories.all,
      queryFn: () => axiosApi.categoryApi.getCategories(),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClientInstance]);

  // Prefetch unread notification count
  useEffect(() => {
    void dispatch(fetchUnreadCount());
  }, [dispatch]);

  // Dispatch the initial branch fetch.
  // Waits for auth to settle and dietary (if applicable) to load.
  // If location is denied, fetches without lat/lng.
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    // Wait for auth to settle before we know whether to wait for dietary
    if (userStatus === 'idle' || userStatus === 'pending') return;
    // Wait for dietary if the user has completed dietary setup
    if (
      user?.dietarySetup &&
      dietaryStatus !== 'succeeded' &&
      dietaryStatus !== 'failed'
    )
      return;
    // Wait until location is fully resolved:
    // - UNDETERMINED: permission dialog not answered yet
    // - GRANTED but no coords: useLocationPermission sets permissionStatus
    //   before awaiting fetchCoords(), so coords can briefly be null here
    if (permissionStatus === Location.PermissionStatus.UNDETERMINED) return;
    if (
      permissionStatus === Location.PermissionStatus.GRANTED &&
      coords === null
    )
      return;
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    const dietaryIds = userDietaryPreferences.map((p) => p.dietaryPreferenceId);

    void dispatch(
      fetchActiveBranches({
        page: 1,
        lat: coords?.latitude,
        lng: coords?.longitude,
        distance: coords ? 5 : undefined,
        dietaryIds,
      })
    );
  }, [
    coords,
    dietaryStatus,
    dispatch,
    permissionStatus,
    user?.dietarySetup,
    userDietaryPreferences,
    userStatus,
  ]);

  const isReady =
    fontsLoaded &&
    animationFinished &&
    (branchesStatus === 'succeeded' || branchesStatus === 'failed');

  // Stable reference — prevents lottie-react-native from firing
  // onAnimationFinish prematurely when AppSplashGate re-renders
  // (auth/location/branches state changes create many re-renders during splash).
  const handleAnimationFinish = useCallback(() => {
    setAnimationFinished(true);
  }, []);

  if (!isReady) {
    return <LottieSplashScreen onFinish={handleAnimationFinish} />;
  }

  return <>{children}</>;
}

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AppInitializer>{children}</AppInitializer>
      </Provider>
    </QueryClientProvider>
  );
}
