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
  selectRegisterEmail,
  userRegister,
  verifyRegistration,
} from '@slices/auth';

export default function useRegister(): {
  registerEmail: string | null;
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
    onRegisterSubmit,
    onVerifyRegistration,
    onResendRegistrationOTP,
    onClearRegisterEmail,
    onClearError,
  };
}
