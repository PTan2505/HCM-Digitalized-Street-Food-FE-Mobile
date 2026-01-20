import { useAppDispatch } from '@hooks/reduxHooks';
import { userLoginWithGoogle } from '@slices/auth';

export default function useGoogleLogin(): {
  onGoogleLoginSubmit: () => Promise<void>;
} {
  const dispatch = useAppDispatch();

  async function onGoogleLoginSubmit(): Promise<void> {
    await dispatch(userLoginWithGoogle()).unwrap();
  }
  return {
    onGoogleLoginSubmit,
  };
}
