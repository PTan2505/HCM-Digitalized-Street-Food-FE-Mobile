import { store } from '@customer-app/store';
import { getLowcaAPIUnimplementedEndpoints } from '@features/customer/campaigns/api/generated';
import { NotificationHandler } from '@features/notifications/NotificationHandler';
import { useCustomerRoleGate } from '@features/auth/hooks/useCustomerRoleGate';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { queryClient } from '@lib/queryClient';
import { queryKeys } from '@lib/queryKeys';
import LottieSplashScreen from '@screens/LottieSplashScreen';
import {
  loadUserFromStorage,
  selectUser,
  selectUserStatus,
} from '@slices/auth';
import { getUserDietaryPreferences } from '@slices/dietary';
import { fetchSettings } from '@slices/settings';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider } from 'react-redux';

const campaignApi = getLowcaAPIUnimplementedEndpoints();

function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const dispatch = useAppDispatch();
  const userStatus = useAppSelector(selectUserStatus);
  const user = useAppSelector(selectUser);
  const hasFetchedDietaryRef = useRef(false);

  useCustomerRoleGate();

  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, userStatus]);

  // Reset the fetch guard when the user logs out so the next user's
  // dietary preferences are fetched fresh on login.
  useEffect(() => {
    if (!user) {
      hasFetchedDietaryRef.current = false;
    }
  }, [user]);

  // Load user's dietary preferences once — guarded by ref because the auth
  // slice's global isPending/isFulfilled matchers flip userStatus on every
  // thunk dispatch, which would re-trigger this effect without the guard.
  useEffect(() => {
    if (userStatus === 'succeeded' && user && !hasFetchedDietaryRef.current) {
      hasFetchedDietaryRef.current = true;
      void dispatch(getUserDietaryPreferences());
      void dispatch(fetchSettings());
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
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect((): (() => void) => {
    const startTime = Date.now();
    fallbackTimerRef.current = setTimeout(() => {
      console.warn(
        `[SplashGate] ⚠️ 15s timeout fired — Lottie onAnimationFinish never called. Elapsed: ${Date.now() - startTime}ms`
      );
      setAnimationFinished(true);
    }, 15000);
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const queryClientInstance = useQueryClient();

  // Prefetch categories so HomeScreen gets instant data
  useEffect(() => {
    void queryClientInstance.prefetchQuery({
      queryKey: queryKeys.categories.all,
      queryFn: () => axiosApi.categoryApi.getCategories(),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClientInstance]);

  // Prefetch public system campaigns for the initial campaign feed.
  useEffect(() => {
    void queryClientInstance.prefetchInfiniteQuery({
      queryKey: queryKeys.campaigns.system,
      queryFn: async ({ pageParam }) => {
        return await campaignApi.getPublicCampaigns({
          isSystem: true,
          page: pageParam,
          pageSize: 10,
        });
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClientInstance]);

  const isReady = fontsLoaded && animationFinished;

  // Log every time isReady flips to true so we know exactly which condition
  // was the last to satisfy (helps diagnose splash timing issues).
  const splashStartRef = useRef(Date.now());
  const prevIsReadyRef = useRef(false);
  if (isReady && !prevIsReadyRef.current) {
    prevIsReadyRef.current = true;
    const elapsed = Date.now() - splashStartRef.current;
    console.log(
      `[SplashGate] ✅ isReady after ${elapsed}ms | fontsLoaded=${fontsLoaded} animationFinished=${animationFinished}`
    );
  }

  // Stable reference — prevents lottie-react-native from firing
  // onAnimationFinish prematurely when AppSplashGate re-renders.
  const handleAnimationFinish = useCallback((isCancelled: boolean) => {
    const elapsed = Date.now() - splashStartRef.current;
    if (isCancelled) {
      // Fired when the animation is interrupted (e.g. hot reload / Fast Refresh
      // causes LottieView to remount). Ignore — the new instance will play fully.
      console.log(
        `[SplashGate] 🎬 onAnimationFinish isCancelled=true after ${elapsed}ms — ignoring`
      );
      return;
    }
    console.log(
      `[SplashGate] 🎬 onAnimationFinish isCancelled=false after ${elapsed}ms — proceeding`
    );
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
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
        <KeyboardProvider>
          <AppInitializer>{children}</AppInitializer>
        </KeyboardProvider>
      </Provider>
    </QueryClientProvider>
  );
}
