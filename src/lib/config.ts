export const ALLOWED_DOMAIN = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN ?? 'hbplus.fit').toLowerCase();
export const RESTRICTED_MESSAGE = 'Access restricted. Please login using your official domain email.';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
  !process.env.EXPO_PUBLIC_FIREBASE_API_KEY.includes('your-') &&
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
  !process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID.includes('your-')
);

// Fallback keeps expo-auth-session from throwing on platforms you haven't configured yet.
export const googleClientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'not-configured',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'not-configured',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'not-configured',
};
