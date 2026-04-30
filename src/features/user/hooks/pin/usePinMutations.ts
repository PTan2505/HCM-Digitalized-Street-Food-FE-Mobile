import { axiosApi } from '@lib/api/apiInstance';
import { queryClient } from '@lib/queryClient';
import { queryKeys } from '@lib/queryKeys';
import type { VerifyPinResponse } from '@user/api/userPinApi';
import { useMutation } from '@tanstack/react-query';

export const useSetPin = (): {
  mutateAsync: (pin: string) => Promise<void>;
  isPending: boolean;
} => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (pin: string) => axiosApi.userPinApi.setPin(pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPin.status() });
    },
  });
  return { mutateAsync, isPending };
};

export const useVerifyPin = (): {
  mutateAsync: (pin: string) => Promise<VerifyPinResponse>;
  isPending: boolean;
} => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (pin: string) => axiosApi.userPinApi.verifyPin(pin),
  });
  return { mutateAsync, isPending };
};

export const useChangePin = (): {
  mutateAsync: (args: { currentPin: string; newPin: string }) => Promise<void>;
  isPending: boolean;
} => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      currentPin,
      newPin,
    }: {
      currentPin: string;
      newPin: string;
    }) => axiosApi.userPinApi.changePin(currentPin, newPin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPin.status() });
    },
  });
  return { mutateAsync, isPending };
};

export const useRemovePin = (): {
  mutateAsync: (pin: string) => Promise<void>;
  isPending: boolean;
} => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (pin: string) => axiosApi.userPinApi.removePin(pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPin.status() });
    },
  });
  return { mutateAsync, isPending };
};
