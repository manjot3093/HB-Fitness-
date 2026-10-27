import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ALLOWED_DOMAIN, RESTRICTED_MESSAGE, googleClientIds } from '../lib/config';
import { isAllowedEmail } from '../lib/domain';
import { Profile, Role, upsertProfile } from '../lib/users';

WebBrowser.maybeCompleteAuthSession();

type AuthState = {
  user: Profile | null;
  loading: boolean;    // resolving persisted session on app start
  signingIn: boolean;  // Google / Demo flow in progress
  error: string | null;
  isDemo: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  demoSignIn: (email: string, role?: Role) => Promise<void>;
};
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({ ...googleClientIds, selectAccount: true });

  // Native: exchange the Google id_token for a Firebase session
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      signInWithCredential(auth, GoogleAuthProvider.credential(response.params.id_token)).catch(() => {
        setError('Sign-in failed. Please try again.');
        setSigningIn(false);
      });
    } else {
      if (response.type === 'error') setError('Google sign-in failed. Please try again.');
      setSigningIn(false);
    }
  }, [response]);

  // Single source of truth: every session (fresh login OR restored) passes the domain gate here.
  useEffect(() => {
    let active = true;

    // Check for persisted demo session first
    AsyncStorage.getItem('@hbplus_demo_user').then((raw) => {
      if (!active || !raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.email && isAllowedEmail(parsed.email, true)) {
          setUser(parsed);
          setIsDemo(true);
          setLoading(false);
        }
      } catch {}
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!active) return;
      if (!fbUser) {
        const demo = await AsyncStorage.getItem('@hbplus_demo_user').catch(() => null);
        if (!demo) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      setIsDemo(false);
      await AsyncStorage.removeItem('@hbplus_demo_user').catch(() => {});
      if (!isAllowedEmail(fbUser.email, fbUser.emailVerified)) {
        await fbSignOut(auth);
        setUser(null); setError(RESTRICTED_MESSAGE); setSigningIn(false); setLoading(false);
        return;
      }
      try {
        setUser(await upsertProfile(fbUser));
        setError(null);
      } catch {
        await fbSignOut(auth);
        setUser(null); setError('Could not load your profile. Please try again.');
      } finally {
        setSigningIn(false); setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setError(null); setSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        // `hd` is only a UX hint; real enforcement = onAuthStateChanged check + Firestore rules
        provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } else {
        await promptAsync();
      }
    } catch (e: any) {
      console.error('Firebase Auth Error:', e);
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        if (e?.code === 'auth/unauthorized-domain') {
          setError('Domain not authorized: Please add your Netlify domain to Firebase Console > Authentication > Settings > Authorized domains.');
        } else if (e?.code === 'auth/invalid-api-key' || !process.env.EXPO_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'demo-api-key') {
          setError('Firebase API key missing in build. On Netlify, go to Deploys > Trigger deploy > "Clear cache and deploy site".');
        } else {
          setError(e?.message || 'Sign-in failed. Check Firebase config or use the Demo Flows below.');
        }
      }
      setSigningIn(false);
    }
  };

  const demoSignIn = async (email: string, role: Role = 'user') => {
    setError(null);
    setSigningIn(true);
    await new Promise((r) => setTimeout(r, 450));
    if (!isAllowedEmail(email, true)) {
      setUser(null);
      setError(RESTRICTED_MESSAGE);
      setSigningIn(false);
      return;
    }
    const demoProfile: Profile = {
      uid: `demo-${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      photoURL: null,
      role,
    };
    await AsyncStorage.setItem('@hbplus_demo_user', JSON.stringify(demoProfile)).catch(() => {});
    setUser(demoProfile);
    setIsDemo(true);
    setError(null);
    setSigningIn(false);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@hbplus_demo_user').catch(() => {});
    await fbSignOut(auth).catch(() => {});
    setUser(null);
    setIsDemo(false);
  };

  const value = useMemo(() => ({ user, loading, signingIn, error, isDemo, signIn, signOut, demoSignIn }),
    [user, loading, signingIn, error, isDemo]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>');
  return c;
}
