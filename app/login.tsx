import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Button } from '../src/components/Button';
import { useAuth } from '../src/context/AuthContext';
import { ALLOWED_DOMAIN } from '../src/lib/config';
import { colors, shadow } from '../src/theme';

export default function Login() {
  const { user, loading, signingIn, error, signIn, demoSignIn } = useAuth();
  if (loading) return <View style={s.center}><ActivityIndicator size="large" /></View>;
  if (user) return <Redirect href="/dashboard" />;

  return (
    <View style={s.center}>
      <View style={s.card}>
        <View style={s.logo}><Text style={s.logoText}>HB</Text></View>
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.sub}>Sign in with your official <Text style={s.bold}>@{ALLOWED_DOMAIN}</Text> Google account to continue.</Text>
        {error ? <View style={s.error} accessibilityRole="alert"><Text style={s.errorText}>{error}</Text></View> : null}
        <View style={{ marginTop: 20, alignSelf: 'stretch' }}>
          <Button title={signingIn ? 'Signing in…' : 'Login with Google'} icon="G" loading={signingIn} onPress={signIn} />
        </View>

        <View style={s.dividerContainer}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>DEMO & EVALUATION FLOWS</Text>
          <View style={s.dividerLine} />
        </View>
        <Text style={s.demoHint}>
          Test domain validation and role-based views without a real @{ALLOWED_DOMAIN} Google Workspace inbox:
        </Text>

        <View style={s.demoGrid}>
          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn(`alex.fitness@${ALLOWED_DOMAIN}`, 'user')}
            style={({ pressed }) => [s.demoBtn, s.demoAllowed, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.demoBtnTitle}>✓ Test Allowed User</Text>
            <Text style={s.demoBtnSub}>alex.fitness@{ALLOWED_DOMAIN}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn(`sarah.admin@${ALLOWED_DOMAIN}`, 'admin')}
            style={({ pressed }) => [s.demoBtn, s.demoAdmin, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.demoBtnTitle}>★ Test Allowed Admin</Text>
            <Text style={s.demoBtnSub}>sarah.admin@{ALLOWED_DOMAIN}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn('candidate@gmail.com', 'user')}
            style={({ pressed }) => [s.demoBtn, s.demoRejected, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.demoBtnTitle}>✕ Test Restricted Email</Text>
            <Text style={s.demoBtnSub}>candidate@gmail.com (rejected)</Text>
          </Pressable>
        </View>

        <Text style={s.foot}>Access is restricted to authorised team members.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 440, backgroundColor: colors.card, borderRadius: 20, padding: 28, alignItems: 'center', ...shadow },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  sub: { marginTop: 8, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  bold: { fontWeight: '700', color: colors.text },
  error: { marginTop: 18, alignSelf: 'stretch', backgroundColor: colors.dangerBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: 24, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 10, fontWeight: '700', color: colors.muted, marginHorizontal: 10, letterSpacing: 0.8 },
  demoHint: { fontSize: 12, color: colors.muted, textAlign: 'center', marginBottom: 12, lineHeight: 17 },
  demoGrid: { alignSelf: 'stretch', gap: 8 },
  demoBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  demoAllowed: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  demoAdmin: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  demoRejected: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  demoBtnTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  demoBtnSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  foot: { marginTop: 20, fontSize: 12, color: colors.muted },
});
