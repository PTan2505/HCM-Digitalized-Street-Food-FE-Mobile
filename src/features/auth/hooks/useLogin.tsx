import type { LoginWithPhoneNumberRequest } from '@auth/types/login';
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

  async function onGoogleLoginSubmit(): Promise<void> {
    await dispatch(userLoginWithGoogle()).unwrap();
    navigation.replace('Main');
  }

  async function onFacebookLoginSubmit(): Promise<void> {
    await dispatch(userLoginWithFacebook()).unwrap();
    navigation.replace('Main');
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
    await dispatch(verifyPhoneNumber(payload)).unwrap();
    navigation.replace('Main');
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
