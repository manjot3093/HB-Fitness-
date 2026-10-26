import { getApp, getApps, initializeApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence only exists in the React Native build of firebase/auth
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { firebaseConfig } from './config';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth() {
  if (Platform.OS === 'web') return getAuth(app); // web: SDK-managed IndexedDB persistence
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app); // already initialised (fast refresh)
  }
}

export const auth = createAuth();
export const db = getFirestore(app);
