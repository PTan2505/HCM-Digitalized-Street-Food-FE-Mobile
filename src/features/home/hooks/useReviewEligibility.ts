import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { haversineKm } from '@utils/haversineFormula';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

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

/**
 * Determines whether the user is eligible to review this branch.
 *
 * This hook combines TWO data sources:
 * 1. Location permission + user coordinates (local side-effect via expo-location)
 * 2. Velocity check API call (migrated to React Query for caching)
 *
 * WHY `placeholderData` IS USED:
 * We pass `{ remainingTotalToday: 1, reviewedBranchIds: [] }` as placeholder
 * so the UI doesn't block on the velocity API. If the API fails, we
 * optimistically allow the review (same as the original behavior).
 *
 * HOW `refetchVelocity` WORKS:
 * After submitting or deleting a review, the caller invokes refetchVelocity()
 * which calls `queryClient.invalidateQueries()`. This marks the cached velocity
 * data as stale, triggering an immediate background refetch. The cache key
 * is ['feedback', 'velocity'] — shared across all instances of this hook.
 */
export const useReviewEligibility = (
  branchId: number,
  branchLat: number,
  branchLong: number
): ReviewEligibilityResult => {
  const queryClient = useQueryClient();

  // ── Location (unchanged — not an API cache concern) ──
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLong, setUserLong] = useState<number | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

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

    void init();
    return (): void => {
      cancelled = true;
    };
  }, []);

  // ── Velocity check (migrated to React Query) ──
  const { data: velocity, isLoading: isVelocityLoading } = useQuery({
    queryKey: queryKeys.feedback.velocity(),
    queryFn: () => axiosApi.feedbackApi.checkVelocity(),
    staleTime: 30 * 1000, // 30 sec — velocity can change after each review
    placeholderData: {
      remainingTotalToday: 1,
      dailyLimit: 5,
      reviewedBranchIds: [],
    },
  });

  const remainingToday = velocity?.remainingTotalToday ?? 1;
  const reviewedBranchIds = velocity?.reviewedBranchIds ?? [];

  const refetchVelocity = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.feedback.velocity(),
    });
  };

  const isLoading = isLocationLoading || isVelocityLoading;

  if (isLoading) {
    return {
      canReview: false,
      reason: 'loading',
      userLat,
      userLong,
      isLoading: true,
      refetchVelocity,
    };
  }

  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return {
      canReview: false,
      reason: 'permission_denied',
      userLat: null,
      userLong: null,
      isLoading: false,
      refetchVelocity,
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
        refetchVelocity,
      };
    }
  }

  if (remainingToday <= 0) {
    return {
      canReview: false,
      reason: 'daily_limit_reached',
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity,
    };
  }

  if (reviewedBranchIds.includes(branchId)) {
    return {
      canReview: false,
      reason: 'already_reviewed_today',
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity,
    };
  }

  return {
    canReview: true,
    reason: null,
    userLat,
    userLong,
    isLoading: false,
    refetchVelocity,
  };
};
