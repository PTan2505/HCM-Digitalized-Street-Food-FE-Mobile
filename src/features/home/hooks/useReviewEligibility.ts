import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type ReviewIneligibilityReason =
  | 'permission_denied'
  | 'too_far'
  | 'daily_limit_reached'
  | 'already_reviewed_branch'
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
 * Determines whether the user is eligible to write a NON-ORDER review for
 * this branch.  Pass `hasCompletedOrders=true` to bypass all velocity/location
 * checks — the caller will use an `orderId` in the submit payload instead.
 *
 * TWO DATA SOURCES (non-order path only):
 * 1. Location permission + user coordinates (local, via expo-location)
 * 2. Branch-specific velocity check API (includes distance, daily limit,
 *    and permanent "already reviewed this branch without order" check)
 *
 * VELOCITY QUERY KEY:
 * Uses `queryKeys.feedback.velocityBranch(branchId, lat, lng)` so each
 * branch/position combination is cached independently.  `refetchVelocity`
 * invalidates the `['feedback', 'velocity']` prefix, which covers all
 * velocity cache entries.
 *
 * ORDER PATH:
 * When `hasCompletedOrders=true` this hook immediately returns
 * `{ canReview: true, isLoading: false }`.  The velocity API is not called.
 * Location is still fetched in the background so `userLat/userLong` are
 * available for any non-order fallback scenario, but they are not required.
 */
export const useReviewEligibility = (
  branchId: number,
  branchLat: number,
  branchLong: number,
  hasCompletedOrders?: boolean
): ReviewEligibilityResult => {
  const queryClient = useQueryClient();

  // ── Location ──────────────────────────────────────────────────────────────
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

  // ── Branch-specific velocity check (non-order path only) ─────────────────
  const velocityEnabled =
    !hasCompletedOrders &&
    !isLocationLoading &&
    userLat != null &&
    userLong != null;

  const { data: velocity, isLoading: isVelocityLoading } = useQuery({
    queryKey: queryKeys.feedback.velocityBranch(
      branchId,
      userLat ?? branchLat,
      userLong ?? branchLong
    ),
    queryFn: () =>
      axiosApi.feedbackApi.checkVelocity({
        branchId,
        userLat: userLat!,
        userLong: userLong!,
      }),
    enabled: velocityEnabled,
    staleTime: 30 * 1000,
    placeholderData: {
      remainingTotalToday: 1,
      dailyLimit: 5,
      reviewedBranchIds: [],
    },
  });

  const refetchVelocity = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.feedback.velocity(),
    });
  };

  // ── Short-circuit for order-based path ────────────────────────────────────
  if (hasCompletedOrders) {
    return {
      canReview: true,
      reason: null,
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity,
    };
  }

  // ── Loading states ────────────────────────────────────────────────────────
  const isLoading = isLocationLoading || (velocityEnabled && isVelocityLoading);

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

  // ── Location denied ───────────────────────────────────────────────────────
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

  // ── Velocity/eligibility (non-order path) ─────────────────────────────────
  //
  // Prefer the branch-specific `canReviewWithoutOrder` flag from the API.
  // If not yet available (using placeholder), fall back to the daily limit
  // counter so the UI is never incorrectly blocked.
  if (velocity?.canReviewWithoutOrder === false) {
    // Determine the most specific reason
    if (velocity.isWithinDistance === false) {
      return {
        canReview: false,
        reason: 'too_far',
        userLat,
        userLong,
        isLoading: false,
        refetchVelocity,
      };
    }
    if ((velocity.remainingTotalToday ?? 1) <= 0) {
      return {
        canReview: false,
        reason: 'daily_limit_reached',
        userLat,
        userLong,
        isLoading: false,
        refetchVelocity,
      };
    }
    // Within range and under daily limit → branch already reviewed without order
    return {
      canReview: false,
      reason: 'already_reviewed_branch',
      userLat,
      userLong,
      isLoading: false,
      refetchVelocity,
    };
  }

  // Fallback for placeholder data (canReviewWithoutOrder not yet returned)
  if (velocity?.canReviewWithoutOrder == null) {
    if ((velocity?.remainingTotalToday ?? 1) <= 0) {
      return {
        canReview: false,
        reason: 'daily_limit_reached',
        userLat,
        userLong,
        isLoading: false,
        refetchVelocity,
      };
    }
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
