import type { LoginRequest } from '@auth/types/login';
import { useAppDispatch } from '@hooks/reduxHooks';
import { useNavigation } from '@react-navigation/native';
import {
  userLogin,
  userLoginWithFacebook,
  userLoginWithGoogle,
  userLogout,
} from '@slices/auth';

export default function useLogin(): {
  onLoginSubmit: (values: LoginRequest) => Promise<void>;
  onGoogleLoginSubmit: () => Promise<void>;
  onFacebookLoginSubmit: () => Promise<void>;
  onLogout: () => Promise<void>;
} {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  async function onLoginSubmit(values: LoginRequest): Promise<void> {
    await dispatch(userLogin(values)).unwrap();
  }

  async function onGoogleLoginSubmit(): Promise<void> {
    const { user } = await dispatch(userLoginWithGoogle()).unwrap();
    // navigation.navigate('Profile', { user });
    navigation.navigate('Profile');
  }

  async function onFacebookLoginSubmit(): Promise<void> {
    const { user } = await dispatch(userLoginWithFacebook()).unwrap();
    // navigation.navigate('Profile', { user });
    navigation.navigate('Profile');
  }

  async function onLogout(): Promise<void> {
    await dispatch(userLogout()).unwrap();
    navigation.navigate('Auth');
    // Implementation for logout if needed
  }
  return {
    onLoginSubmit,
    onGoogleLoginSubmit,
    onFacebookLoginSubmit,
    onLogout,
  };
}
