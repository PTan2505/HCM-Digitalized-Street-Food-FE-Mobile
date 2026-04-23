import { ROLES } from '@constants/roles';
import { selectUser, selectUserStatus, userLogout } from '@slices/auth';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export const useCustomerRoleGate = (): void => {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();

  const user = useSelector(selectUser);
  const userStatus = useSelector(selectUserStatus);

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      hasCheckedRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (userStatus !== 'succeeded' || !user) return;
    if (hasCheckedRef.current) return;

    hasCheckedRef.current = true;

    if (user.role !== ROLES.CUSTOMER) {
      hasCheckedRef.current = false;
      void dispatch(userLogout());
      Alert.alert(t('auth.error'), t('auth.customer_access_denied'));
    }
  }, [userStatus, user, dispatch, t]);
};
