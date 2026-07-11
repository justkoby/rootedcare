import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import type {
  Session,
  User,
} from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useCarePlanStore } from '../store/useCarePlanStore';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        if (currentUser) {
          useFavoriteStore.getState().loadFavorites(currentUser.id);
          useCarePlanStore.getState().loadCarePlan(currentUser.id);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        const nextUser = nextSession?.user ?? null;
        setUser(nextUser);
        setLoading(false);

        if (nextUser) {
          useFavoriteStore.getState().loadFavorites(nextUser.id);
          useCarePlanStore.getState().loadCarePlan(nextUser.id);
        } else {
          // Clear store state on logout
          useFavoriteStore.setState({ favorites: [] });
          useCarePlanStore.setState({ entries: [] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
