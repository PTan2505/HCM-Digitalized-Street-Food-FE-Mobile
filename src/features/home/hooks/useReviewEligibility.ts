import { axiosApi } from '@lib/api/apiInstance';
import { haversineKm } from '@utils/haversineFormula';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

const GEO_FENCE_KM = parseFloat(process.env.EXPO_PUBLIC_GEO_FENCE_KM ?? '0.05');

export type ReviewIneligibilityReason =
  | 'permission_denied'
  | 'too_far'
  | 'daily_limit_reached'
  | 'already_reviewed_today'
  | 'loading';

export interface ReviewEligibilityResult {
  canReview: boolean;
  reason: ReviewIneligibilityReason | null;
  userLat: number | null;
  userLong: number | null;
  isLoading: boolean;
  refetchVelocity: () => void;
}

export const useReviewEligibility = (
  branchId: number,
  branchLat: number,
  branchLong: number
): ReviewEligibilityResult => {
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);
  const [remainingToday, setRemainingToday] = useState<number | null>(null);
  const [reviewedBranchIds, setReviewedBranchIds] = useState<number[]>([]);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isVelocityLoading, setIsVelocityLoading] = useState(true);
  const velocityFetchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const init = async (): Promise<void> => {
      setIsLocationLoading(true);
      try {
        const { status: existing } =
          await Location.getForegroundPermissionsAsync();

        let status = existing;
        if (existing !== Location.PermissionStatus.GRANTED) {
          const result = await Location.requestForegroundPermissionsAsync();
          status = result.status;
        }

        if (cancelled) return;
        setPermissionStatus(status);

        if (status === Location.PermissionStatus.GRANTED) {
          const cached = await Location.getLastKnownPositionAsync();
          const pos =
            cached ??
            (await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }));
          if (!cancelled) {
            setUserLat(pos.coords.latitude);
            setUserLong(pos.coords.longitude);
          }
        }
      } catch {
        if (!cancelled) setPermissionStatus(Location.PermissionStatus.DENIED);
      } finally {
        if (!cancelled) setIsLocationLoading(false);
      }
    };

    init();
    return (): void => {
      cancelled = true;
    };
  }, []);

  const fetchVelocity = useCallback(() => {
    setIsVelocityLoading(true);
    axiosApi.feedbackApi
      .checkVelocity()
      .then((data) => {
        setRemainingToday(data.remainingTotalToday);
        setReviewedBranchIds(data.reviewedBranchIds ?? []);
      })
      .catch(() => {
        // On error, optimistically allow review
        setRemainingToday(1);
        setReviewedBranchIds([]);
      })
      .finally(() => setIsVelocityLoading(false));
  }, []);

  useEffect(() => {
    if (!velocityFetchedRef.current) {
      velocityFetchedRef.current = true;
      fetchVelocity();
    }
  }, [fetchVelocity]);

  const isLoading = isLocationLoading || isVelocityLoading;

  if (isLoading) {
    return {
      canReview: false,
      reason: 'loading',
      userLat,
      userLong,
      isLoading: true,
      refetchVelocity: fetchVelocity,
    };
  }

  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return {
      canReview: false,
      reason: 'permission_denied',
      userLat: null,
      userLong: null,
      isLoading: false,
      refetchVelocity: fetchVelocity,
    };
  }

  if (userLat !== null && userLong !== null) {
    const dist = haversineKm(userLat, userLong, branchLat, branchLong);
    if (dist > GEO_FENCE_KM) {
      return {
        canReview: false,
        reason: 'too_far',
        userLat,
        userLong,
        isLoading: false,
        refetchVelocity: fetchVelocity,
      };
    }
  }

  if (remainingToday !== null && remainingToday <= 0) {
    return {
      canReview: false,
      reason: 'daily_limit_reached',
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity: fetchVelocity,
    };
  }

  if (reviewedBranchIds.includes(branchId)) {
    return {
      canReview: false,
      reason: 'already_reviewed_today',
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity: fetchVelocity,
    };
  }

  return {
    canReview: true,
    reason: null,
    userLat,
    userLong,
    isLoading: false,
    refetchVelocity: fetchVelocity,
  };
};
