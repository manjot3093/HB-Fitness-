import { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Role = 'admin' | 'user';
export type Profile = { uid: string; email: string; name: string; photoURL: string | null; role: Role };

export const MOCK_USERS: Profile[] = [
  { uid: 'demo-admin-1', email: 'sarah.admin@hbplus.fit', name: 'Sarah Connor', photoURL: null, role: 'admin' },
  { uid: 'demo-user-2', email: 'alex.fitness@hbplus.fit', name: 'Alex Johnson', photoURL: null, role: 'user' },
  { uid: 'demo-user-3', email: 'priya.trainer@hbplus.fit', name: 'Priya Patel', photoURL: null, role: 'user' },
];

export async function upsertProfile(u: User): Promise<Profile> {
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  const base = { email: u.email as string, name: u.displayName ?? (u.email as string), photoURL: u.photoURL ?? null };
  if (!snap.exists()) {
    await setDoc(ref, { ...base, role: 'user', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
    return { uid: u.uid, ...base, role: 'user' };
  }
  await updateDoc(ref, { lastLoginAt: serverTimestamp() });
  return { uid: u.uid, ...base, role: (snap.data().role as Role) ?? 'user' };
}

export async function listUsers(): Promise<Profile[]> {
  try {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    if (snap.empty) return MOCK_USERS;
    return snap.docs.map((d) => ({ ...(d.data() as Omit<Profile, 'uid'>), uid: d.id }));
  } catch (err) {
    return MOCK_USERS;
  }
}
