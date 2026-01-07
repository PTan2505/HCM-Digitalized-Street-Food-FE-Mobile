import type {
  RegisterRequest,
  ResendRegistrationOTPRequest,
  VerifyRegistrationRequest,
} from '@auth/types/register';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  clearRegisterEmail,
  resendRegistrationOTP,
  selectAuthError,
  selectAuthStatus,
  selectRegisterEmail,
  userRegister,
  verifyRegistration,
} from '@slices/auth';

export default function useRegister(): {
  registerEmail: string | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  onRegisterSubmit: (values: RegisterRequest) => Promise<void>;
  onVerifyRegistration: (values: VerifyRegistrationRequest) => Promise<void>;
  onResendRegistrationOTP: (
    values: ResendRegistrationOTPRequest
  ) => Promise<void>;
  onClearRegisterEmail: () => void;
  onClearError: () => void;
} {
  const dispatch = useAppDispatch();
  const registerEmail = useAppSelector(selectRegisterEmail);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const onRegisterSubmit = async (values: RegisterRequest): Promise<void> => {
    await dispatch(userRegister(values)).unwrap();
  };

  const onVerifyRegistration = async (
    values: VerifyRegistrationRequest
  ): Promise<void> => {
    await dispatch(verifyRegistration(values)).unwrap();
  };

  const onResendRegistrationOTP = async (
    values: ResendRegistrationOTPRequest
  ): Promise<void> => {
    await dispatch(resendRegistrationOTP(values)).unwrap();
  };

  const onClearRegisterEmail = (): void => {
    dispatch(clearRegisterEmail());
  };

  const onClearError = (): void => {
    dispatch(clearError());
  };

  return {
    registerEmail,
    status,
    error,
    onRegisterSubmit,
    onVerifyRegistration,
    onResendRegistrationOTP,
    onClearRegisterEmail,
    onClearError,
  };
}
