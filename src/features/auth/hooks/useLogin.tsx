import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
import { ROLES } from '@constants/roles';
import { User } from '@custom-types/user';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  userLoginWithFacebook,
  userLoginWithGoogle,
  userLoginWithPhoneNumber,
  userLogout,
  verifyPhoneNumber,
} from '@slices/auth';
import { isManagerApp } from '@utils/appVariant';

export default function useLogin(): {
  onGoogleLoginSubmit: () => Promise<void>;
  onFacebookLoginSubmit: () => Promise<void>;
  onPhoneNumberLoginSubmit: (
    values: LoginWithPhoneNumberRequest
  ) => Promise<void>;
  onVerifyPhoneNumberSubmit: (payload: {
    phoneNumber: string;
    otp: string;
  }) => Promise<void>;
  onLogout: () => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();

  function navigateAfterLogin(user: User): void {
    if (!isManagerApp) {
      navigation.replace('Main');
      return;
    }
    if (user.role === ROLES.MANAGER) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).replace('ManagerHome');
    }
    // Non-manager role in manager app: do nothing — useManagerRoleGate handles logout + alert
  }

  async function onGoogleLoginSubmit(): Promise<void> {
    const { user } = await dispatch(userLoginWithGoogle()).unwrap();
    navigateAfterLogin(user);
  }

  async function onFacebookLoginSubmit(): Promise<void> {
    const { user } = await dispatch(userLoginWithFacebook()).unwrap();
    navigateAfterLogin(user);
  }

  async function onPhoneNumberLoginSubmit(
    values: LoginWithPhoneNumberRequest
  ): Promise<void> {
    await dispatch(userLoginWithPhoneNumber(values)).unwrap();
  }

  async function onVerifyPhoneNumberSubmit(payload: {
    phoneNumber: string;
    otp: string;
  }): Promise<void> {
    const { user } = await dispatch(verifyPhoneNumber(payload)).unwrap();
    navigateAfterLogin(user);
  }

  async function onLogout(): Promise<void> {
    await dispatch(userLogout()).unwrap();
    navigation.replace('Auth');
    // Implementation for logout if needed
  }
  return {
    onGoogleLoginSubmit,
    onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
