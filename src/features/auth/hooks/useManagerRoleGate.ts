import { ROLES } from '@constants/roles';
import type { AuthState } from '@slices/auth';
import { userLogout } from '@slices/auth';
import { fetchManagerBranch } from '@slices/managerAuth';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export const useManagerRoleGate = (): void => {
  const { t } = useTranslation();
  // Plain any dispatch avoids cross-store type conflicts in feature layer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();

  const user = useSelector((state: { user: AuthState }) => state.user.value);
  const userStatus = useSelector(
    (state: { user: AuthState }) => state.user.status
  );

  const hasFetchedBranchRef = useRef(false);

  useEffect(() => {
    if (!user) {
      hasFetchedBranchRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    console.log('[useManagerRoleGate] userStatus:', userStatus, 'user role:', user?.role);
    if (userStatus !== 'succeeded' || !user) return;

    const isAllowedRole =
      user.role === ROLES.MANAGER || user.role === ROLES.VENDOR;
    console.log('[useManagerRoleGate] isAllowedRole:', isAllowedRole);
    if (!isAllowedRole) {
      hasFetchedBranchRef.current = false;
      void dispatch(userLogout());
      Alert.alert(t('auth.error'), t('auth.manager_access_denied'));
      return;
    }

    // Only branch managers need to pre-fetch their assigned branch.
    // Vendors fetch all branches on-demand via the branch list screen.
    if (user.role === ROLES.MANAGER && !hasFetchedBranchRef.current) {
      hasFetchedBranchRef.current = true;
      console.log('[useManagerRoleGate] fetching manager branch');
      void dispatch(fetchManagerBranch());
    }
  }, [userStatus, user, dispatch, t]);
};
