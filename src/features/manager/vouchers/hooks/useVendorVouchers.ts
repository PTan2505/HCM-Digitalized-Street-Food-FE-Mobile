import type {
  ManagerVoucher,
  VoucherFormPayload,
} from '@manager/vouchers/api/managerVoucherApi';
import { axiosApi } from '@lib/api/apiInstance';
import { queryKeys } from '@lib/queryKeys';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

export const useVoucherDetail = (
  id: number
): UseQueryResult<ManagerVoucher> =>
  useQuery({
    queryKey: queryKeys.managerVouchers.detail(id),
    queryFn: () => axiosApi.managerVoucherApi.getById(id),
    enabled: id > 0,
  });

export const useVouchersByCampaign = (
  campaignId: number
): UseQueryResult<ManagerVoucher[]> =>
  useQuery({
    queryKey: queryKeys.managerVouchers.byCampaign(campaignId),
    queryFn: () => axiosApi.managerVoucherApi.getByCampaign(campaignId),
    enabled: campaignId > 0,
  });

export const useCreateVouchers = (): UseMutationResult<
  ManagerVoucher[],
  Error,
  VoucherFormPayload[]
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axiosApi.managerVoucherApi.create(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerVouchers.all,
      });
      const campaignIds = Array.from(
        new Set(
          variables
            .map((v) => v.campaignId)
            .filter((id): id is number => id !== null)
        )
      );
      campaignIds.forEach((id) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.managerVouchers.byCampaign(id),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vouchers.campaignVoucher(id),
        });
      });
    },
  });
};

export const useUpdateVoucher = (
  id: number
): UseMutationResult<ManagerVoucher, Error, VoucherFormPayload> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => axiosApi.managerVoucherApi.update(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerVouchers.detail(id),
      });
      if (data.campaignId !== null) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.managerVouchers.byCampaign(data.campaignId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vouchers.campaignVoucher(data.campaignId),
        });
      }
    },
  });
};

export const useDeleteVoucher = (): UseMutationResult<
  void,
  Error,
  { voucherId: number; campaignId: number | null }
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ voucherId }) =>
      axiosApi.managerVoucherApi.delete(voucherId),
    onSuccess: (_, { campaignId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.managerVouchers.all,
      });
      if (campaignId !== null) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.managerVouchers.byCampaign(campaignId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.vouchers.campaignVoucher(campaignId),
        });
      }
    },
  });
};
