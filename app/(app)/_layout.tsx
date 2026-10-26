import { ActivityIndicator, View } from 'react-native';
import { Redirect, Slot } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

/** Route guard: every screen inside (app)/ requires a verified, on-domain session.
 *  Typing /dashboard in the browser while logged out lands here and is redirected. */
export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  if (!user) return <Redirect href="/login" />;
  return <Slot />;
}
