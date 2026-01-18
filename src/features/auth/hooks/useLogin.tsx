import type { LoginRequest } from '@auth/types/login';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { userLogin } from '@slices/auth';

export default function useLogin(): {
  onLoginSubmit: (values: LoginRequest) => Promise<void>;
} {
  const dispatch = useAppDispatch();
  async function onLoginSubmit(values: LoginRequest): Promise<void> {
    await dispatch(userLogin(values)).unwrap();
  }
  return {
    onLoginSubmit,
  };
}
