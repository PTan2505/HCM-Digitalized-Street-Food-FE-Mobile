import { useAppDispatch } from '@hooks/reduxHooks';
import { userLoginWithFacebook } from '@slices/auth';

export default function useFacebookLogin(): {
  onFacebookLoginSubmit: () => Promise<void>;
} {
  const dispatch = useAppDispatch();

  async function onFacebookLoginSubmit(): Promise<void> {
    await dispatch(userLoginWithFacebook()).unwrap();
  }

  return {
    onFacebookLoginSubmit,
  };
}
