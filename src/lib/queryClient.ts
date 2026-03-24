import { QueryClient } from '@tanstack/react-query';

/**
 * Central QueryClient instance for TanStack React Query.
 *
 * Default settings:
 * - staleTime (5 min): Data is considered "fresh" for 5 minutes.
 *   During this window, navigating back to a screen shows cached data
 *   WITHOUT making a new API call. After 5 minutes, the next access
 *   triggers a background refetch (the cached data still shows instantly).
 *
 * - gcTime (10 min): Unused cache entries are garbage-collected after 10 min.
 *   "Unused" means no component is currently subscribed to that query.
 *
 * - retry: 1 — retry failed requests once before showing an error.
 *
 * - refetchOnWindowFocus: true (default) — when the app comes back to
 *   foreground, stale queries are silently refetched so data stays current.
 */
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
