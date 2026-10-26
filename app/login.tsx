import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.scroll}>
      <View style={s.card}>
        <View style={s.logo}><Text style={s.logoText}>HB</Text></View>
        <Text style={s.title}>Welcome back</Text>
        <Text style={s.sub}>Sign in with your official <Text style={s.bold}>@{ALLOWED_DOMAIN}</Text> Google account to continue.</Text>
        
        {error ? (
          <View style={s.error} accessibilityRole="alert">
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
          <Button title={signingIn ? 'Signing in…' : 'Login with Google'} icon="G" loading={signingIn} onPress={signIn} />
        </View>

        <View style={s.dividerContainer}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>DEMO & EVALUATION FLOWS</Text>
          <View style={s.dividerLine} />
        </View>
        <Text style={s.demoHint}>
          Click below to test domain restriction & role dashboards instantly:
        </Text>

        <View style={s.demoGrid}>
          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn('candidate@gmail.com', 'user')}
            style={({ pressed }) => [s.demoBtn, s.demoRejected, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.demoBtnTitle, { color: colors.danger }]}>✕ Test Blocked Domain (Rejected)</Text>
            <Text style={s.demoBtnSub}>candidate@gmail.com → Triggers access restricted message</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn(`alex.fitness@${ALLOWED_DOMAIN}`, 'user')}
            style={({ pressed }) => [s.demoBtn, s.demoAllowed, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.demoBtnTitle, { color: colors.success }]}>✓ Test Allowed User (Standard)</Text>
            <Text style={s.demoBtnSub}>alex.fitness@{ALLOWED_DOMAIN} → Opens Dashboard</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={signingIn}
            onPress={() => demoSignIn(`sarah.admin@${ALLOWED_DOMAIN}`, 'admin')}
            style={({ pressed }) => [s.demoBtn, s.demoAdmin, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.demoBtnTitle, { color: colors.primary }]}>★ Test Allowed Admin (Admin Panel)</Text>
            <Text style={s.demoBtnSub}>sarah.admin@{ALLOWED_DOMAIN} → Unlocks User Directory</Text>
          </Pressable>
        </View>

        <Text style={s.foot}>Access is restricted to authorised team members.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: 'center', ...shadow },
  logo: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { marginTop: 6, fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center' },
  bold: { fontWeight: '700', color: colors.text },
  error: { marginTop: 14, alignSelf: 'stretch', backgroundColor: colors.dangerBg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FECACA' },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: 18, marginBottom: 6 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 10, fontWeight: '700', color: colors.muted, marginHorizontal: 8, letterSpacing: 0.6 },
  demoHint: { fontSize: 11, color: colors.muted, textAlign: 'center', marginBottom: 10, lineHeight: 16 },
  demoGrid: { alignSelf: 'stretch', gap: 8 },
  demoBtn: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  demoAllowed: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  demoAdmin: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
  demoRejected: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  demoBtnTitle: { fontSize: 13, fontWeight: '700' },
  demoBtnSub: { fontSize: 11, color: colors.muted, marginTop: 1 },
  foot: { marginTop: 16, fontSize: 11, color: colors.muted },
});
