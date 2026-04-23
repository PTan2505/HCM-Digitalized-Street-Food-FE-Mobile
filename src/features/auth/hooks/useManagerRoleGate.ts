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
    if (userStatus !== 'succeeded' || !user) return;

    if (user.role !== ROLES.MANAGER) {
      hasFetchedBranchRef.current = false;
      void dispatch(userLogout());
      Alert.alert(t('auth.error'), t('auth.manager_access_denied'));
      return;
    }

    if (!hasFetchedBranchRef.current) {
      hasFetchedBranchRef.current = true;
      void dispatch(fetchManagerBranch());
    }
  }, [userStatus, user, dispatch, t]);
};
