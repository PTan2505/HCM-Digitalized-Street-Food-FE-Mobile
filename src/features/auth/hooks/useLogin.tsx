import type { LoginRequest } from '@auth/types/login';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { selectAuthError, selectAuthStatus, userLogin } from '@slices/auth';

export default function useLogin(): {
  onLoginSubmit: (values: LoginRequest) => Promise<void>;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
} {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  async function onLoginSubmit(values: LoginRequest): Promise<void> {
    await dispatch(userLogin(values)).unwrap();
  }

  return {
    onLoginSubmit,
    status,
    error,
  };
}
