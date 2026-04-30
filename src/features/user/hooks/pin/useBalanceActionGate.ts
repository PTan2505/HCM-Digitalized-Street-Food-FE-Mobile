import type { PinVerifyModalRef } from '@user/components/pin/PinVerifyModal';
import { usePinStatus } from '@user/hooks/pin/usePinStatus';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef } from 'react';

type GateCallback = () => void | Promise<void>;

interface UseBalanceActionGateResult {
  pinVerifyModalRef: React.RefObject<PinVerifyModalRef | null>;
  gateAction: (callback: GateCallback) => Promise<void>;
  isPinStatusLoading: boolean;
}

export const useBalanceActionGate = (): UseBalanceActionGateResult => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ReactNavigation.RootParamList>>();
  const { hasPin, isLoading: isPinStatusLoading } = usePinStatus();
  const pinVerifyModalRef = useRef<PinVerifyModalRef | null>(null);

  const gateAction = useCallback(
    async (callback: GateCallback): Promise<void> => {
      if (isPinStatusLoading) return;

      if (!hasPin) {
        navigation.navigate('Pin', { mode: 'setup' });
        return;
      }

      const verified = await pinVerifyModalRef.current?.open();
      if (verified) {
        await callback();
      }
    },
    [hasPin, isPinStatusLoading, navigation]
  );

  return { pinVerifyModalRef, gateAction, isPinStatusLoading };
};
