'use client';

import {StudyLearnerContext} from '@/lib/study/learner-context';
import {usePathname} from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { startProfileSession } from '@/lib/profile-session';
import { onAuthStateChanged, User, type UserInfo, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { apiRequest, gameProgress } from '@/lib/game-session';
import { OperationType, handleFirestoreError } from '@/lib/firestore-errors';
import { authErrorMessage, createEmailAccount, connectGoogleAccount } from '@/lib/account-auth';

interface UserProfile {
  uid: string;
  displayName: string;
  handle?: string;
  photoURL?: string;
  email: string;
  rating: number;
  classification: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws?: number;
  ratedGames?: number;
  topicRatedGames?: Record<string, number>;
  answeredQuestions?: number;
  correctAnswers?: number;
  freeResponseStats?: {rounds?:number;finalized?:number;graded?:number;correct?:number;skipped?:number;revealed?:number;ungraded?:number};
  createdAt: string;
  xp?: number;
  topicXp?: Record<string, number>;
  topicRatings?: Record<string, number>;
  settings?: {
    theme?: string;
    notifications?: boolean;
    soundEnabled?: boolean;
    includeLegacyProblems?: boolean;
  };
  friends?: string[];
  lastActive?: number;
  color?: string;
}

interface AuthContextType {
  user: User | null;
  linkedProviders: UserInfo[];
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  linkedProviders: [],
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  signupWithEmail: async () => {},
  loginWithEmail: async () => {},
  linkGoogleAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const readOnlyReplay=usePathname().startsWith('/replay/');
  const [user, setUser] = useState<User | null>(null);
  const [linkedProviders, setLinkedProviders] = useState<UserInfo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let revision = 0;
    let stopProfile = () => {};
    let stopResults = () => {};
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      const current = ++revision;
      stopProfile(); stopResults();
      setUser(firebaseUser); setProfile(null); setLoading(true); setProfileError('');
      setLinkedProviders([...(firebaseUser?.providerData || [])]);
      if (!firebaseUser) { setLoading(false); return; }
      const userRef = doc(db, 'users', firebaseUser.uid);
      stopProfile = startProfileSession<UserProfile>({
        subscribe: (next, failed) => onSnapshot(userRef, snapshot => next(snapshot.exists() ? snapshot.data() as UserProfile : null), failed),
        bootstrap: readOnlyReplay ? undefined : () => apiRequest('profile', {}),
        profile: value => { if (current === revision) setProfile(value); },
        loading: value => { if (current === revision) setLoading(value); },
        error: value => { if (current === revision) setProfileError(value); },
        ready: () => { if (current === revision) stopResults = gameProgress.watchPendingResults(firebaseUser.uid, error => console.error('Pending result sync failed', error)); },
      });
    });
    return () => { revision++; unsubscribe(); stopProfile(); stopResults(); };
  }, [retry,readOnlyReplay]);

  useEffect(() => {
    if (readOnlyReplay || !user || profile?.uid !== user.uid) return;

    let lastAttempt = Date.now();
    const updateLastActive = async () => {
      if (document.hidden || !navigator.onLine || Date.now() - lastAttempt < 120000) return;
      lastAttempt = Date.now();
      try {
        await apiRequest('profile', {});
      } catch (error) {
        // Silently fail for lastActive updates to not spam errors
        console.error('Failed to update lastActive', error);
      }
    };

    // Bootstrap already updates presence; avoid a duplicate write on mount.
    const interval = setInterval(updateLastActive, 120000);
    document.addEventListener('visibilitychange', updateLastActive);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', updateLastActive); };
  }, [user, profile?.uid,readOnlyReplay]);

  useEffect(() => {
    try { localStorage.setItem('soundEnabled', String(profile?.settings?.soundEnabled !== false)); } catch {}
  }, [profile?.settings?.soundEnabled, user?.uid]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
      throw new Error(authErrorMessage(error, 'google-login'));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    await createEmailAccount(auth, email, pass, name, displayName => apiRequest('profile', { patch: { displayName } }));
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error) {
      console.error('Login failed', error);
      throw new Error(authErrorMessage(error, 'email-login'));
    }
  };

  const linkGoogleAccount = async () => {
    const linkedUser = await connectGoogleAccount(auth);
    // Firebase mutates the User instance in place; publish a new provider list
    // so Settings updates immediately without requiring a page reload.
    setLinkedProviders([...linkedUser.providerData]);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      try {
        await apiRequest('profile', { patch: data });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
      setProfile(current => current ? { ...current, ...data } : current);
      
      if (data.displayName !== undefined || data.photoURL !== undefined) {
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        if (data.displayName !== undefined) authUpdates.displayName = data.displayName;
        if (data.photoURL !== undefined && data.photoURL.length < 2000) authUpdates.photoURL = data.photoURL;
        
        if (Object.keys(authUpdates).length > 0) {
          await updateAuthProfile(user, authUpdates);
        }
      }
    } catch (error) {
      console.error('Update profile failed', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, linkedProviders, profile, loading, login, logout, updateUserProfile, signupWithEmail, loginWithEmail, linkGoogleAccount }}>
      {profileError && <div role="alert" className="border-b border-red-500/30 bg-red-950 px-4 py-3 text-center text-sm text-red-100">{profileError} <button onClick={() => setRetry(value => value + 1)} className="ml-3 min-h-11 rounded-lg px-3 font-bold underline">Retry</button></div>}
      <StudyLearnerContext.Provider value={{uid:user?.uid??null,loading:loading&&!user}}>{children}</StudyLearnerContext.Provider>
    </AuthContext.Provider>
  );
}
