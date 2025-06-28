import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZohoAuth } from '../types';

interface AuthState {
  auth: ZohoAuth | null;
  setAuth: (auth: ZohoAuth) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      auth: null,
      setAuth: (auth: ZohoAuth) => set({ auth }),
      setAccessToken: (access_token: string) => 
        set((state) => ({ 
          auth: state.auth ? { ...state.auth, access_token } : { access_token }
        })),
      clearAuth: () => set({ auth: null }),
      isAuthenticated: () => {
        const { auth } = get();
        return auth?.access_token ? true : false;
      },
    }),
    {
      name: 'zohotask-auth',
    }
  )
);