import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * Shared navigation ref that allows imperative navigation from
 * outside the React component tree (e.g., notification handlers).
 *
 * Pass this ref to `<StaticNavigation ref={navigationRef} />`.
 */
export const navigationRef =
  createNavigationContainerRef<ReactNavigation.RootParamList>();
