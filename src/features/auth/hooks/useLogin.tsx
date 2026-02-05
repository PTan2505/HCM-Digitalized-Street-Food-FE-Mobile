import type {
  LoginRequest,
  LoginWithPhoneNumberRequest,
} from '@auth/types/login';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  userLogin,
  userLoginWithFacebook,
  userLoginWithGoogle,
  userLoginWithPhoneNumber,
  verifyPhoneNumber,
  userLogout,
} from '@slices/auth';

export default function useLogin(): {
  onLoginSubmit: (values: LoginRequest) => Promise<void>;
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

  async function onLoginSubmit(values: LoginRequest): Promise<void> {
    await dispatch(userLogin(values)).unwrap();
  }

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
    onLoginSubmit,
    onGoogleLoginSubmit,
    onFacebookLoginSubmit,
    onPhoneNumberLoginSubmit,
    onVerifyPhoneNumberSubmit,
    onLogout,
  };
}
