import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseOrNull } from '../lib/supabase';
import { fetchProfile, updateProfile } from '../lib/api';
import { demoProfile } from '../lib/demo';
import type { Profile } from '../lib/types';

interface AuthState {
  /** True while the initial session lookup is in flight. */
  loading: boolean;
  /** Supabase session when signed in (null in demo mode after "sign in"). */
  session: Session | null;
  profile: Profile | null;
  /** True when running against local demo data instead of Supabase. */
  demoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (payload: {
    fullName: string;
    email: string;
    password: string;
    campus: string;
  }) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  update: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Demo mode (no Supabase keys) still persists a session so a refresh keeps
 * you signed in — mirrors the real auth persistence in production mode.
 */
const DEMO_SESSION_KEY = 'campusfit-demo-session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const demoMode = !isSupabaseConfigured;

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const p = await fetchProfile(userId);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, []);

  // Restore session on mount.
  useEffect(() => {
    let cancelled = false;
    const sb = supabaseOrNull();

    if (!sb) {
      // Demo mode: restore a previously signed-in demo session, if any.
      if (localStorage.getItem(DEMO_SESSION_KEY) === '1') {
        setProfile(demoProfile);
      }
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
      if (cancelled) return;
      setSession(next);
      if (next?.user) void loadProfile(next.user.id);
      else setProfile(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const sb = supabaseOrNull();
      if (!sb) {
        // Demo mode accepts any credentials so the UI is fully explorable.
        localStorage.setItem(DEMO_SESSION_KEY, '1');
        setProfile(demoProfile);
        return {};
      }
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },
    []
  );

  const signUp = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      campus: string;
    }) => {
      const sb = supabaseOrNull();
      if (!sb) {
        localStorage.setItem(DEMO_SESSION_KEY, '1');
        setProfile({ ...demoProfile, full_name: payload.fullName, email: payload.email, campus: payload.campus });
        return {};
      }
      const { data, error } = await sb.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { full_name: payload.fullName, campus: payload.campus },
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });
      if (error) return { error: error.message };
      if (data.user && !data.session) {
        // Email confirmation required.
        return {};
      }
      if (data.session?.user) void loadProfile(data.session.user.id);
      return {};
    },
    [loadProfile]
  );

  const verifyOtp = useCallback(
    async (email: string, token: string) => {
      const sb = supabaseOrNull();
      if (!sb) return {};
      const { error } = await sb.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) return { error: error.message };
      return {};
    },
    []
  );

  const signOut = useCallback(async () => {
    const sb = supabaseOrNull();
    if (sb) await sb.auth.signOut();
    localStorage.removeItem(DEMO_SESSION_KEY);
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const id = session?.user?.id;
    if (id) await loadProfile(id);
  }, [session, loadProfile]);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      const id = session?.user?.id ?? profile?.id;
      if (!id) return;
      // Optimistic update keeps the UI responsive.
      setProfile(p => (p ? { ...p, ...patch } : p));
      try {
        await updateProfile(id, patch);
      } catch {
        await refreshProfile(); // roll back to server truth
      }
    },
    [session, profile, refreshProfile]
  );

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      profile,
      demoMode,
      signIn,
      signUp,
      verifyOtp,
      signOut,
      refreshProfile,
      update,
    }),
    [loading, session, profile, demoMode, signIn, signUp, verifyOtp, signOut, refreshProfile, update]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
