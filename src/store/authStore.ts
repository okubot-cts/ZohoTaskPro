import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZohoAuth } from '../types';

interface AuthState {
  auth: ZohoAuth;
  setApiKey: (apiKey: string) => void;
  setOrganizationId: (organizationId: string) => void;
  setConnected: (isConnected: boolean) => void;
  clearAuth: () => void;
}

const initialState: ZohoAuth = {
  apiKey: '',
  organizationId: '',
  isConnected: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: initialState,
      setApiKey: (apiKey: string) => set((state) => ({ auth: { ...state.auth, apiKey } })),
      setOrganizationId: (organizationId: string) =>
        set((state) => ({ auth: { ...state.auth, organizationId } })),
      setConnected: (isConnected: boolean) =>
        set((state) => ({ auth: { ...state.auth, isConnected } })),
      clearAuth: () => set({ auth: initialState }),
    }),
    {
      name: 'zohotask-auth',
    }
  )
);