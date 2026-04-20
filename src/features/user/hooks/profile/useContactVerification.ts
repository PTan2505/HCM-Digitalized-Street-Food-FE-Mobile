import { useAppDispatch } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { updateUserVerificationStatus } from '@slices/auth';
import { useState } from 'react';

export interface ContactVerificationState {
  isStarting: boolean;
  isVerifying: boolean;
  isOTPVisible: boolean;
  channels: string[];
  error: string | null;
  startVerification: () => Promise<void>;
  submitOtp: (otp: string) => Promise<void>;
  dismissOTP: () => void;
}

export const useContactVerification = (): ContactVerificationState => {
  const dispatch = useAppDispatch();
  const [isStarting, setIsStarting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOTPVisible, setIsOTPVisible] = useState(false);
  const [channels, setChannels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startVerification = async (): Promise<void> => {
    setIsStarting(true);
    setError(null);
    try {
      const result = await axiosApi.userProfileApi.startContactVerification();
      setChannels(result.channels ?? []);
      setIsOTPVisible(true);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Không thể gửi mã xác minh';
      setError(message);
    } finally {
      setIsStarting(false);
    }
  };

  const submitOtp = async (otp: string): Promise<void> => {
    setIsVerifying(true);
    setError(null);
    try {
      const result = await axiosApi.userProfileApi.verifyContactOtp(otp);
      dispatch(updateUserVerificationStatus({ channel: result.channel }));
      setIsOTPVisible(false);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Mã xác minh không đúng';
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const dismissOTP = (): void => {
    setIsOTPVisible(false);
    setError(null);
  };

  return {
    isStarting,
    isVerifying,
    isOTPVisible,
    channels,
    error,
    startVerification,
    submitOtp,
    dismissOTP,
  };
};
