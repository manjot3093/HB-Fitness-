# HB Plus Portal — Google Login with Domain Restriction

One **React Native (Expo) + React Native for Web** codebase that runs on **Android, iOS and the browser**.
Users sign in with Google; only `@hbplus.fit` accounts are allowed in. Everyone else sees:

> Access restricted. Please login using your official domain email.

**Stack:** Expo SDK 53 · expo-router · Firebase Auth + Firestore · expo-auth-session · TypeScript

## Features
Google sign-in · domain validation · protected dashboard · logout · loading states · error handling ·
role-based access (Admin/User) · user profiles stored in Firestore · route guards · responsive UI.

## Folder structure
```
app/                    expo-router routes (file = URL)
  _layout.tsx           AuthProvider wrapper
  index.tsx             redirects to /login or /dashboard
  login.tsx             Login page
  (app)/_layout.tsx     ROUTE GUARD for everything in this group
  (app)/dashboard.tsx   Protected dashboard (+ admin panel)
src/
  context/AuthContext   auth state, Google flow, domain gate
  lib/                  config, domain check, firebase init, user DB helpers
  components/Button.tsx
firestore.rules         server-side enforcement
netlify.toml            deployment config
```

## 1. Setup

### Prerequisites
Node 20+, Git, Android Studio (Android) and/or Xcode (iOS, macOS only).

### Firebase
1. https://console.firebase.google.com → create project.
2. **Authentication → Sign-in method → Google → Enable.**
3. **Project settings → Add app → Web** → copy the config values.
4. **Authentication → Settings → Authorized domains** → add your Netlify domain (and `localhost`).
5. **Firestore Database → Create database** (production mode), then publish the rules:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```
   (or paste `firestore.rules` into Console → Firestore → Rules)

### Google OAuth client IDs (Google Cloud Console → APIs & Services → Credentials)
| Platform | What to create | Env var |
|---|---|---|
| Web | Auto-created by Firebase ("Web client (auto created by Google Service)") | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| Android | OAuth client → Android, package `fit.hbplus.portal`, your debug **SHA-1** | `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` |
| iOS | OAuth client → iOS, bundle id `fit.hbplus.portal` | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |

Get the debug SHA-1:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Add the web client's authorized redirect/origin: `http://localhost:8081` and your Netlify URL.

### Install & configure
```bash
npm install
npx expo install --fix        # aligns package versions with the Expo SDK
cp .env.example .env          # fill in every value
```

## 2. Run

### Web (browser)
```bash
npm run web                   # http://localhost:8081
```

### Android phone over USB
Google sign-in on native uses a custom redirect scheme, so it **requires a development build — it does not work inside Expo Go** (the web version does).

1. Phone: *Settings → About phone → tap Build number 7×* → *Developer options → enable **USB debugging***.
2. Plug in via USB, accept the "Allow USB debugging" prompt.
3. Verify the device is seen:
   ```bash
   adb devices                # should list your device as "device"
   ```
4. Build + install + launch on the phone (first build takes several minutes):
   ```bash
   npx expo run:android --device
   ```
5. For later sessions, only start the bundler and let the phone reach it through USB:
   ```bash
   npx expo start --dev-client
   adb reverse tcp:8081 tcp:8081
   ```
   Open the "HB Plus Portal" app on the phone.

### Android emulator
Start an AVD in Android Studio (use a *Google Play* image), then `npx expo run:android`.

### iOS (macOS only)
```bash
npx expo run:ios                  # simulator
npx expo run:ios --device         # USB-connected iPhone (needs Apple developer signing)
```
iOS Google sign-in also needs the **reversed iOS client ID** added as a URL scheme in `app.json`
(`"scheme": ["hbplus", "fit.hbplus.portal", "com.googleusercontent.apps.<YOUR_IOS_CLIENT_ID>"]`).

## 3. Authentication flow
```
Login with Google
   ├─ Web:    signInWithPopup (Firebase) with hd=hbplus.fit hint
   └─ Native: expo-auth-session -> Google id_token -> signInWithCredential
                         │
                 Firebase session created
                         │
          onAuthStateChanged  (single gate for fresh AND restored sessions)
             ├─ email not verified or domain != hbplus.fit  -> signOut() + show error
             └─ allowed -> create/update users/{uid} in Firestore (role defaults to "user")
                         -> user state set -> router redirects to /dashboard
```

## 4. How the domain restriction works (defence in depth)
1. **Google hint (UX only):** `hd=hbplus.fit` pre-filters the account chooser. Never trusted.
2. **Client gate:** `isAllowedEmail()` does an *exact* domain match on the verified email — rejects
   `x@gmail.com`, `x@evilhbplus.fit`, `x@hbplus.fit.evil.com`, `x@sub.hbplus.fit`, and unverified emails.
   Failing users are signed out immediately and shown the restriction message.
3. **Server gate (authoritative):** `firestore.rules` requires `request.auth.token.email` to be a verified
   `@hbplus.fit` address for any read/write, so a tampered client still gets no data.
   Users can create only their own profile with `role: "user"` and can't edit their role.
4. **Optional hardening:** Firebase *blocking functions* (Identity Platform, Blaze plan) can refuse account
   creation for other domains so no Auth record is ever created.

## 5. Roles
New users are `user`. To make an admin: Firebase Console → Firestore → `users/<uid>` → set `role` to `admin`.
Admins see an extra "Registered users" panel; rules allow only admins to list all users.

## 6. Security notes
- Route guard in `app/(app)/_layout.tsx`: opening `/dashboard` while logged out redirects to `/login`.
- Tokens are handled by the Firebase SDK (auto-refresh): IndexedDB on web, AsyncStorage on native.
  No tokens are hand-rolled, logged, or placed in URLs.
- Only public `EXPO_PUBLIC_*` identifiers are in the bundle; there are no secrets client-side. `.env` is git-ignored.
- Authorisation is enforced by Firestore rules, not just hidden UI.

## 7. Deploy to Netlify
```bash
git init && git add . && git commit -m "feat: hbplus auth portal"
git remote add origin https://github.com/<you>/hbplus-auth.git && git push -u origin main
```
Netlify → *Add new site → Import from Git* → pick the repo. `netlify.toml` already sets build
`npm run build:web`, publish `dist`, and the SPA redirect. Under **Site settings → Environment variables**
add every `EXPO_PUBLIC_*` value from `.env`. Then add the Netlify domain to Firebase *Authorized domains*.

Manual alternative: `npm run build:web && npx netlify-cli deploy --prod --dir=dist`

## Quick Demo / Video Presentation Mode
If you do not have an active `@hbplus.fit` Google Workspace domain email or haven't configured Firebase credentials yet, the application includes a **Demo & Evaluation Mode** directly on the login screen:
- **✓ Test Allowed User:** Instantly simulates `alex.fitness@hbplus.fit` login and opens the Dashboard as a standard user.
- **★ Test Allowed Admin:** Instantly simulates `sarah.admin@hbplus.fit` login and opens the Dashboard showcasing the Admin role & Registered Users directory.
- **✕ Test Restricted Email:** Simulates an unauthorized domain (`candidate@gmail.com`) to demonstrate the exact rejection banner:
  > *Access restricted. Please login using your official domain email.*

## Test checklist
- `name@hbplus.fit` → dashboard shows email + role.
- `name@gmail.com` → error message above, no dashboard.
- Open `/dashboard` while logged out → redirected to `/login`.
- Refresh while logged in → stays logged in. Logout → back to `/login`.
