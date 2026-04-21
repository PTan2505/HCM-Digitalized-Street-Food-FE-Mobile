import {
  clearManagerBranch,
  fetchManagerBranch,
  selectManagerBranch,
  selectManagerBranchId,
  selectManagerIsLoading,
  type ManagerAuthState,
} from '@slices/managerAuth';
import { userLogout, type AuthState } from '@slices/auth';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ManagerAuthHook {
  isLoading: boolean;
  branch: ManagerAuthState['branch'];
  branchId: ManagerAuthState['branchId'];
  isAuthenticated: boolean;
  onFetchBranch: () => void;
  onLogout: () => void;
}

export const useManagerAuth = (): ManagerAuthHook => {
  // Using plain dispatch typed as any-compatible to avoid cross-store type conflicts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = useDispatch<any>();

  const isLoading = useSelector(selectManagerIsLoading);
  const branch = useSelector(selectManagerBranch);
  const branchId = useSelector(selectManagerBranchId);
  const user = useSelector((state: { user: AuthState }) => state.user.value);

  const isAuthenticated = user !== null;

  const onFetchBranch = useCallback((): void => {
    void dispatch(fetchManagerBranch());
  }, [dispatch]);

  const onLogout = useCallback((): void => {
    dispatch(clearManagerBranch());
    void dispatch(userLogout());
  }, [dispatch]);

  return {
    isLoading,
    branch,
    branchId,
    isAuthenticated,
    onFetchBranch,
    onLogout,
  };
};
