import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import { storage } from '@/utils/storage';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type AuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string };

type AuthStatus = 'loading' | 'signedOut' | 'guest' | 'signedIn';

interface AuthStore {
  status: AuthStatus;
  user: AuthUser | null;
  /** True when accounts live in Supabase; false = accounts saved on this device only. */
  isOnline: boolean;
  /** Signed in or browsing as guest — allowed past the welcome screen. */
  hasEntered: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateName: (name: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthStore | null>(null);

const KEY_ACCOUNTS = 'auth.localAccounts';
const KEY_SESSION = 'auth.localSession';
const KEY_GUEST = 'auth.guest';

interface LocalAccount {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  createdAt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD_LENGTH = 6;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim());
}

function randomId(): string {
  try {
    const Crypto = require('expo-crypto');
    if (Crypto?.randomUUID) return Crypto.randomUUID();
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Salted SHA-256 for device-only accounts; the password itself is never stored. */
async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `${salt}:${password}`;
  try {
    const Crypto = require('expo-crypto');
    if (Crypto?.digestStringAsync) {
      return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
    }
  } catch {}
  // Last-resort fallback when the native crypto module is unavailable
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return `f${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}

function translateError(message: string | undefined): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Já existe uma conta com este e-mail. Tente entrar.';
  if (m.includes('not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (m.includes('password')) return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitas tentativas. Aguarde um instante e tente de novo.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Sem conexão. Verifique sua internet e tente de novo.';
  return 'Não foi possível concluir. Tente novamente.';
}

function nameFromEmail(email: string) {
  const base = email.split('@')[0] ?? '';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function toUser(account: LocalAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt,
  };
}

function loadLocalUser(): AuthUser | null {
  const email = storage.get<string | null>(KEY_SESSION, null);
  if (!email) return null;
  const accounts = storage.get<Record<string, LocalAccount>>(KEY_ACCOUNTS, {});
  return accounts[email] ? toUser(accounts[email]) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    isSupabaseConfigured ? null : loadLocalUser()
  );
  const [guest, setGuest] = useState(() => storage.get<boolean>(KEY_GUEST, false));
  const [ready, setReady] = useState(!isSupabaseConfigured);

  // Online accounts: restore the saved session and follow auth changes
  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const apply = (sessionUser: {
      id: string;
      email?: string;
      created_at: string;
      user_metadata?: Record<string, unknown>;
    } | null) => {
      if (!active) return;
      if (!sessionUser) {
        setUser(null);
        return;
      }
      const email = sessionUser.email ?? '';
      const metaName = sessionUser.user_metadata?.name;
      setUser({
        id: sessionUser.id,
        email,
        name: typeof metaName === 'string' && metaName.trim() ? metaName : nameFromEmail(email),
        createdAt: sessionUser.created_at,
      });
    };

    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session?.user ?? null))
      .catch(() => apply(null))
      .finally(() => {
        if (active) setReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (rawEmail: string, password: string): Promise<AuthResult> => {
    const email = rawEmail.trim().toLowerCase();
    if (!isValidEmail(email)) return { ok: false, error: 'Digite um e-mail válido.' };
    if (!password) return { ok: false, error: 'Digite sua senha.' };

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, error: translateError(error.message) };
        return { ok: true };
      } catch (e) {
        return { ok: false, error: translateError(e instanceof Error ? e.message : '') };
      }
    }

    const accounts = storage.get<Record<string, LocalAccount>>(KEY_ACCOUNTS, {});
    const account = accounts[email];
    if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
      return { ok: false, error: 'E-mail ou senha incorretos.' };
    }
    storage.set(KEY_SESSION, email);
    setUser(toUser(account));
    return { ok: true };
  }, []);

  const signUp = useCallback(
    async (rawName: string, rawEmail: string, password: string): Promise<AuthResult> => {
      const name = rawName.trim();
      const email = rawEmail.trim().toLowerCase();
      if (name.length < 2) return { ok: false, error: 'Digite seu nome.' };
      if (!isValidEmail(email)) return { ok: false, error: 'Digite um e-mail válido.' };
      if (password.length < MIN_PASSWORD_LENGTH) {
        return {
          ok: false,
          error: `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        };
      }

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
          if (error) return { ok: false, error: translateError(error.message) };
          return { ok: true, needsEmailConfirmation: !data.session };
        } catch (e) {
          return { ok: false, error: translateError(e instanceof Error ? e.message : '') };
        }
      }

      const accounts = storage.get<Record<string, LocalAccount>>(KEY_ACCOUNTS, {});
      if (accounts[email]) {
        return { ok: false, error: 'Já existe uma conta com este e-mail. Tente entrar.' };
      }
      const salt = randomId();
      const account: LocalAccount = {
        id: randomId(),
        email,
        name,
        salt,
        hash: await hashPassword(password, salt),
        createdAt: new Date().toISOString(),
      };
      storage.set(KEY_ACCOUNTS, { ...accounts, [email]: account });
      storage.set(KEY_SESSION, email);
      setUser(toUser(account));
      return { ok: true };
    },
    []
  );

  const resetPassword = useCallback(async (rawEmail: string): Promise<AuthResult> => {
    const email = rawEmail.trim().toLowerCase();
    if (!isValidEmail(email)) return { ok: false, error: 'Digite um e-mail válido.' };

    if (!supabase) {
      return {
        ok: false,
        error:
          'Sua conta está salva só neste aparelho, então não dá para recuperar a senha por e-mail. Crie uma nova conta.',
      };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { ok: false, error: translateError(error.message) };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: translateError(e instanceof Error ? e.message : '') };
    }
  }, []);

  const updateName = useCallback(
    async (rawName: string): Promise<AuthResult> => {
      const name = rawName.trim();
      if (!user) return { ok: false, error: 'Entre na sua conta primeiro.' };
      if (name.length < 2) return { ok: false, error: 'Digite seu nome.' };

      if (supabase) {
        try {
          const { error } = await supabase.auth.updateUser({ data: { name } });
          if (error) return { ok: false, error: translateError(error.message) };
        } catch (e) {
          return { ok: false, error: translateError(e instanceof Error ? e.message : '') };
        }
      } else {
        const accounts = storage.get<Record<string, LocalAccount>>(KEY_ACCOUNTS, {});
        const account = accounts[user.email];
        if (account) storage.set(KEY_ACCOUNTS, { ...accounts, [user.email]: { ...account, name } });
      }
      setUser({ ...user, name });
      return { ok: true };
    },
    [user]
  );

  const signOut = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Even if the network call fails, drop the session on this device
      }
    } else {
      storage.remove(KEY_SESSION);
    }
    storage.remove(KEY_GUEST);
    setGuest(false);
    setUser(null);
  }, []);

  const continueAsGuest = useCallback(() => {
    storage.set(KEY_GUEST, true);
    setGuest(true);
  }, []);

  const value = useMemo<AuthStore>(() => {
    const status: AuthStatus = !ready
      ? 'loading'
      : user
      ? 'signedIn'
      : guest
      ? 'guest'
      : 'signedOut';
    return {
      status,
      user,
      isOnline: isSupabaseConfigured,
      hasEntered: status === 'signedIn' || status === 'guest',
      signIn,
      signUp,
      resetPassword,
      updateName,
      signOut,
      continueAsGuest,
    };
  }, [ready, user, guest, signIn, signUp, resetPassword, updateName, signOut, continueAsGuest]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
