import type {
  ForgetPasswordRequest,
  ResendForgetPasswordOTPRequest,
  ResetPasswordRequest,
} from '@auth/types/forgetPassword';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  clearError,
  clearForgetPasswordEmail,
  forgetPassword,
  resendForgetPasswordOTP,
  resetPassword,
  selectAuthError,
  selectAuthStatus,
  selectForgetPasswordEmail,
} from '@slices/auth';

export default function useForgetPassword(): {
  forgetPasswordEmail: string | null;
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: unknown;
  onRequestForgetPassword: (values: ForgetPasswordRequest) => Promise<void>;
  onResetPassword: (values: ResetPasswordRequest) => Promise<void>;
  onResendForgetPasswordOTP: (
    values: ResendForgetPasswordOTPRequest
  ) => Promise<void>;
  onClearForgetPasswordEmail: () => void;
  onClearError: () => void;
} {
  const dispatch = useAppDispatch();
  const forgetPasswordEmail = useAppSelector(selectForgetPasswordEmail);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const onRequestForgetPassword = async (
    values: ForgetPasswordRequest
  ): Promise<void> => {
    await dispatch(forgetPassword(values)).unwrap();
  };

  const onResetPassword = async (
    values: ResetPasswordRequest
  ): Promise<void> => {
    await dispatch(resetPassword(values)).unwrap();
  };

  const onResendForgetPasswordOTP = async (
    values: ResendForgetPasswordOTPRequest
  ): Promise<void> => {
    await dispatch(resendForgetPasswordOTP(values)).unwrap();
  };

  const onClearForgetPasswordEmail = (): void => {
    dispatch(clearForgetPasswordEmail());
  };

  const onClearError = (): void => {
    dispatch(clearError());
  };

  return {
    forgetPasswordEmail,
    status,
    error,
    onRequestForgetPassword,
    onResetPassword,
    onResendForgetPasswordOTP,
    onClearForgetPasswordEmail,
    onClearError,
  };
}
