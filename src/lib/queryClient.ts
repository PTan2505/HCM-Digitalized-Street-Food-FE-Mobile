import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

// Wire React Native's AppState to React Query's focusManager so that
// refetchOnWindowFocus: true actually refetches stale queries when the app
// returns to the foreground (the browser visibilitychange event doesn't exist
// in React Native, so without this hookup the setting would be a no-op).
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active');
  });
  return (): void => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
