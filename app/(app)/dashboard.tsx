import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/context/AuthContext';
import { Profile, listUsers } from '../../src/lib/users';
import { colors, shadow } from '../../src/theme';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') listUsers().then(setUsers).catch(() => setErr('Could not load users.'));
  }, [user?.role]);

  if (!user) return null; // the (app) layout guard handles the redirect
  const admin = user.role === 'admin';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.scroll}>
      <View style={s.container}>
        <View style={[s.header, wide && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View style={s.userRow}>
            {user.photoURL
              ? <Image source={{ uri: user.photoURL }} style={s.avatar} />
              : <View style={[s.avatar, s.avatarFallback]}><Text style={s.avatarText}>{(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}</Text></View>}
            <View style={{ flexShrink: 1 }}>
              <Text style={s.name}>{user.name}</Text>
              <Text style={s.email}>{user.email}</Text>
            </View>
            <View style={[s.badge, admin ? s.badgeAdmin : s.badgeUser]}>
              <Text style={[s.badgeText, { color: admin ? colors.primary : colors.success }]}>{user.role.toUpperCase()}</Text>
            </View>
          </View>
          <View style={{ marginTop: wide ? 0 : 16, minWidth: 120 }}>
            <Button title="Logout" variant="solid" loading={out} onPress={async () => { setOut(true); await signOut(); }} />
          </View>
        </View>

        <View style={[s.grid, wide && { flexDirection: 'row' }]}>
          <View style={[s.card, wide && { flex: 1 }]}>
            <Text style={s.cardLabel}>Status</Text><Text style={s.cardValue}>Authenticated</Text><Text style={s.cardHint}>Verified Google account</Text>
          </View>
          <View style={[s.card, wide && { flex: 1 }]}>
            <Text style={s.cardLabel}>Access level</Text><Text style={s.cardValue}>{admin ? 'Administrator' : 'Standard user'}</Text><Text style={s.cardHint}>Role stored in Firestore</Text>
          </View>
        </View>

        {admin && (
          <View style={s.card}>
            <Text style={s.section}>Admin · Registered users</Text>
            {err ? <Text style={{ color: colors.danger }}>{err}</Text> : !users ? <ActivityIndicator /> : users.map((u) => (
              <View key={u.uid} style={s.rowItem}><Text style={s.rowName}>{u.name}</Text><Text style={s.rowMeta}>{u.email} · {u.role}</Text></View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { alignItems: 'center', paddingVertical: 24 },
  container: { width: '100%', maxWidth: 960, paddingHorizontal: 16, gap: 16 },
  header: { backgroundColor: colors.card, borderRadius: 16, padding: 20, ...shadow },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.muted },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeAdmin: { backgroundColor: '#EEF2FF' }, badgeUser: { backgroundColor: colors.successBg },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  grid: { gap: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 20, ...shadow },
  cardLabel: { fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 6 },
  cardHint: { fontSize: 13, color: colors.muted, marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  rowItem: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  rowName: { fontSize: 14, fontWeight: '600', color: colors.text }, rowMeta: { fontSize: 12, color: colors.muted },
});
