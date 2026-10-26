import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = { title: string; onPress: () => void; loading?: boolean; variant?: 'outline' | 'solid'; icon?: string };

export function Button({ title, onPress, loading, variant = 'outline', icon }: Props) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button" disabled={loading} onPress={onPress}
      style={({ pressed }) => [s.btn, solid ? s.solid : s.outline, (pressed || loading) && { opacity: 0.7 }]}>
      {loading ? <ActivityIndicator color={solid ? '#fff' : colors.primary} /> : (
        <View style={s.row}>
          {icon ? <Text style={s.icon}>{icon}</Text> : null}
          <Text style={[s.text, solid && { color: '#fff' }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
const s = StyleSheet.create({
  btn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  solid: { backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  text: { fontSize: 15, fontWeight: '600', color: colors.text },
});
