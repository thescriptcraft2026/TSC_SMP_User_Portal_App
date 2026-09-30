# App Handover Documentation

## 1. App Overview

**TheScriptCraft** is a React Native mobile app for writers, filmmakers, authors, and other creative professionals. It combines a public-facing home page with a signed-in creator community. The implementation includes a social feed, creator profiles and connections, chat, books, story/screenplay pitches (Synopsis), visual showcases (VisionX), contests, job opportunities, movie reviews, bookmarks, and notifications.

This document describes what is present in the checked-out code. Store publication state, backend operational status, and production readiness require confirmation from the project owner.

## 2. Tech Stack

- React Native `0.84.0`, React `19.2.3`, TypeScript `5.8.3`
- Bare React Native CLI project; it is not an Expo project.
- Navigation: React Navigation 7 (native stack and bottom tabs), plus a custom drawer.
- State: Redux Toolkit with 22 reducers registered in the root store; screens use React Redux.
- Networking: Axios, with request/response interceptors in `Instance/Instance.tsx`.
- Local session storage: `@react-native-async-storage/async-storage`.
- Realtime: `socket.io-client`.
- Push notifications: React Native Firebase Messaging and Notifee. Analytics uses Firebase Analytics.
- UI/media libraries include React Native Paper, gesture/safe-area libraries, image/file pickers, video, HTML rendering, rich text, Lottie, and vector icons.
- Package engine requirement: Node.js `>=22.11.0`. The repository includes `package-lock.json`.

## 3. Project Structure

- `App.tsx`: Redux, Paper, socket, and toast providers; startup permissions, notifications, analytics, deep links, and update check.
- `Navigator.tsx`, `navigationRef.js`: root/auth/app navigators, linking configuration, and navigation helpers.
- `src/screens/`: user-facing screens grouped by feature.
- `src/components/`: shared UI and feature components, including posts, drawer, modals, and toast.
- `src/navigation/BottomTab.tsx`: bottom tabs and floating create menu.
- `src/redux/`: configured Redux store and feature slices.
- `src/services/`: REST service functions, notification handling, and update checks.
- `src/context/`: socket provider and an AuthContext implementation. AuthContextProvider is not mounted by the current `App.tsx`; Redux auth state is the active app-level auth state.
- `Instance/Instance.tsx`: Axios client, API/socket URL defaults, token attachment, and refresh behavior.
- `src/assets/`: images, fonts, animation, video, and SVG assets.
- `android/`, `ios/`: native app projects and platform-specific configuration.
- `docs/`: architecture, feature, API/state, and setup documents. Verify their claims against source because some versions and behaviors are stale or not wired in the current app.

## 4. App/User Flow

1. `App.tsx` initializes notification permissions and FCM, registers notification listeners, logs an `app_opened` analytics event, and schedules an app-store version check.
2. The root navigator opens `SplashScreen`. After a delay, Splash reads `hasSeenOnboarding` and calls `/auth/me` to validate the stored session.
3. A new user is sent to onboarding, then Login. A returning valid session is sent to the app. An invalid session is cleared and sent to Login.
4. Login accepts email or username plus password. It saves access/refresh tokens, fetches the current user, and routes incomplete profiles to username or role setup.
5. Signup submits registration and continues to OTP verification. Forgot-password also uses OTP and then Reset Password. Bio, username, interests, and role-setup screens are registered; the precise completion requirements should be confirmed with the backend/product owner.
6. In the app, the bottom bar provides Home, Feed, Connections, and Chat. The plus menu starts creation flows for a post, opportunity, Synopsis, VisionX, or book.

## 5. Screens

The root/auth/app stacks register these feature areas:

- **Entry and authentication:** Splash, onboarding, Login, Signup, OTP, Forgot Password, Reset Password, Add Username, Choose Interests, Bio Setup, Role Setup.
- **Main tabs:** Home (dynamic public/marketing content), Feed, Connections, Chat.
- **Community:** search, posts, post details, repost details, image viewer, notifications, and bookmarks.
- **Creator profile:** profile, edit profile, settings, privacy settings, connections, roles, experience, and online preferences.
- **Creative content:** books, Synopsis, VisionX, contests, opportunities, and movies, with listing/detail/create/edit/apply/participation screens where registered.
- **Other:** chat room, tutorials, static content, collaboration form, and not-found screen.

`Navigator.tsx` is the authoritative route registration. Screen names and some spellings in route names are inconsistent; use the registered names when linking from new code.

## 6. Navigation

- Root stack: Splash, `onBoarding`, Auth stack, and App stack. Headers are hidden globally.
- Auth stack: Login is initial; Signup, OTP, password reset, username, interests, bio, and roles are nested within it.
- App stack: contains the four-tab navigator and feature/detail routes. The app stack is wrapped in the custom drawer.
- Bottom tabs: `Home` renders `StaticScreen`; `Feed` renders `HomeScreen`; `Connections` renders `Connections`; `Chat` renders `ChatListScreen`.
- The plus menu provides quick routes to AddPost, AddOpportunity, AddSynopsis, AddVisionX, and AddBook.
- Universal/app links are configured for `thescriptcraft.com` and `www.thescriptcraft.com`; the custom scheme is `tsc://`. The code maps post, book, movie, contest, profile, Synopsis, VisionX, and opportunity links.
- Startup links are queued and processed after Splash validation. Notification-open callbacks currently log the notification; they do not route to the notification's target in the inspected service.

## 7. API & Backend

- REST calls are grouped in `src/services/` by feature and share the Axios instance from `Instance/Instance.tsx`.
- `API_BASE_URL` and `SOCKET_URL` are read through `react-native-config`. If missing, the current client falls back to the beta API host (`https://betatscapi.thescriptcraft.com`) with `/v1/user` for REST.
- Axios timeout is 15 seconds. Requests attach the stored bearer access token. On a 401, the client attempts `/auth/refresh-token`, stores returned tokens, and retries once; failed refresh clears local tokens.
- Backend feature groups visible in services include auth/profile, content/feed/posts, actions, books, contests, opportunities, chat, movies, search, notifications, tags/genres, bookmarks, and VisionX.
- Socket.IO connects to `SOCKET_URL` and handles messages, presence, typing, read receipts, message edits/deletes, and socket notifications.
- Backend source code and API documentation are not part of this mobile repository. Confirm endpoint contracts, environments, availability, and test accounts with the backend owner.

## 8. Authentication

- Login uses email-or-username and password; signup submits account details and proceeds to OTP verification.
- Forgot-password flow requests and verifies an OTP, then submits a new password.
- `/auth/me` is called at startup to validate the session.
- Access and refresh tokens are stored in AsyncStorage under `userAccessToken` and `userRefreshToken`. They are cleared on logout/failed refresh.
- A Google-login API function and Google Sign-In dependency exist, but no Google Sign-In UI or client usage was found in the active source search. Confirm whether it is intended to be enabled.
- `react-native-biometrics` is listed as a dependency and Android declares the biometric permission, but no biometric authentication flow was found in `src/`.
- Do not treat the existing token handling as a security review; request the owner's current auth/session policy and test credentials.

## 9. Environment Configuration

- A root `.env` file is present in this workspace. Its values were not read or copied into this document.
- The app expects `API_BASE_URL` and `SOCKET_URL`; `Instance/Instance.tsx` contains hard-coded beta defaults if either value is absent.
- Android applies `react-native-config`'s `dotenv.gradle`; release builds may select an env file with `ENVFILE`.
- `.env` is not listed in the checked-in `.gitignore`. Confirm whether it is tracked or shared, and keep private values out of source control and handover materials.
- Never assume the checked-in/local values are the intended production environment. Obtain approved development, staging, and production configuration from the owner.

## 10. Android Setup

- Native project: `android/`.
- Application ID/namespace: `com.rnscriptcarft` (spelling as configured).
- Current Android version in `android/app/build.gradle`: `versionName 1.9.3`, `versionCode 44`.
- SDK configuration: min SDK 24, compile/target SDK 36, Build Tools 36.0.0, NDK `27.1.12297006`, Kotlin `2.1.20`; Android Gradle Plugin `8.5.0`.
- Hermes and Android New Architecture are enabled in `android/gradle.properties`; release builds enable minification and resource shrinking.
- Firebase config file exists at `android/app/google-services.json`. Confirm it belongs to the intended Firebase project/package.
- Android manifest declares Internet, biometrics, vibration, and notification permissions; it registers `tsc` and HTTPS App Links.
- Release signing configuration depends on upload-keystore settings in Gradle properties. Do not copy signing values into docs or chat. Confirm whether these credentials are committed/shared and rotate or move them to approved secret storage if exposed.
- Associated domain verification depends on the domain's Digital Asset Links file; hosting/verification status is not established by this repository alone.

## 11. iOS Setup

- Native project/workspace: `ios/TheScriptCraft.xcworkspace`.
- Configured iOS bundle identifier: `com.scriptcraft.scriptcraft` (the Xcode project has a generic fallback setting as well).
- Current project values: marketing version `2.6`, build number `1`, deployment target iOS `15.1`.
- Firebase initialization is in `AppDelegate.swift`; `ios/GoogleService-Info.plist` is included in the Xcode project. Confirm the Firebase project, APNs key/certificate, and signing team are correct for the app being handed over.
- URL scheme `tsc` and associated domains are configured. The entitlement lists both `thescriptcraft.com` and `www.thescriptcraft.com`.
- Install pods with Bundler (see Build & Run). The Podfile explicitly sets React Native New Architecture and Fabric off, while `Info.plist` sets `RCTNewArchEnabled` to true. Confirm intended iOS architecture settings before changing native dependencies or building release.
- Universal Link operation also requires the website's Apple App Site Association file; live hosting and app identifiers need owner verification.

## 12. Build & Run Instructions

### Prerequisites

- Node.js `>=22.11.0` and npm.
- Android: Android Studio/SDK, an emulator or device, and JDK 17 is a practical starting point for the configured Android toolchain.
- iOS: macOS, Xcode, Ruby/Bundler, and CocoaPods. The repository has a Gemfile; use Bundler to honor its CocoaPods constraints.

### Install and launch

```sh
npm ci
npm start
```

In a second terminal, launch a configured emulator/device:

```sh
npm run android
```

On macOS, install pods and launch the iOS app:

```sh
bundle install
bundle exec pod install --project-directory=ios
npm run ios
```

### Useful project scripts

- `npm start`: Metro bundler.
- `npm run android`: React Native Android debug run.
- `npm run ios`: React Native iOS debug run.
- `npm test`: Jest.
- `npm run lint`: ESLint.

### Android release build

Release builds require valid signing configuration; obtain it securely from the release owner before building or publishing.

```sh
cd android
ENVFILE=.env ./gradlew bundleRelease
```

The bundle is normally written under `android/app/build/outputs/bundle/release/`. Confirm environment selection and signing inputs before using any release artifact.

## 13. Third-Party Services

- **Firebase:** native Firebase app configuration, Cloud Messaging for push, Analytics for app-open events.
- **Notifee:** local display and notification channels.
- **Backend Socket.IO gateway:** realtime chat/presence/notifications.
- **Google Sign-In:** package and backend endpoint are present, but active UI wiring was not found; confirmation required.
- **External content/share integrations:** YouTube iframe player and native share targets (Facebook, Instagram, X/Twitter, TikTok) are represented by dependencies/configuration.
- **App-store version check:** `react-native-version-check` compares installed and store versions; store URLs are in `src/services/updateService.ts`.
- No external crash-reporting vendor was found. `index.js` installs a global error handler and calls the app's local crash logger.

## 14. Known Issues

These are code/config observations, not claims that a production failure has been reproduced:

- **401 navigation reset may not work:** `Instance/Instance.tsx` creates a separate navigation ref rather than using the ref attached to `NavigationContainer`; its reset may not reach the active navigator. It also targets `Onboarding` while the registered root route is `onBoarding`. Verify both before relying on automatic logout navigation.
- **Notification navigation:** notification-open handlers currently log events rather than opening the related screen.
- **Sensitive diagnostic output:** token-bearing data is logged in auth/network/notification/native code paths (including refresh/FCM/APNs-related logs). Remove or redact before sharing device logs or builds.
- **Credential handling:** Android release signing values are present in `android/gradle.properties`; no values are reproduced here. Review repository access/history and rotate if those values have been exposed.
- **Environment-file hygiene:** `.env` exists locally and is not covered by the current `.gitignore`; check repository tracking and keep secrets out of version control.
- **Platform versions/config differ:** Android is `1.9.3`/code `44`; iOS is `2.6`/build `1`. Existing setup documentation states different/stale Android values and example iOS identifiers.
- **New Architecture settings differ on iOS:** Podfile disables it while `Info.plist` enables the corresponding flag. Confirm the intended setup.
- **Limited automated coverage:** the visible Jest test only renders `App`; it does not exercise auth, navigation, API, notifications, or native builds.
- Existing docs describe Google login and biometric login as features, but those flows were not found wired in the active auth screens/source search.

## 15. Pending Tasks

- No authoritative backlog or actionable TODO/FIXME list was found in the inspected source. A keyword scan did not find implementation TODOs; it only matched unrelated Mastodon identifiers.
- Confirm whether Google and biometric sign-in are planned, partially removed, or intentionally unsupported.
- Confirm correct API environments, app versioning, iOS/Android architecture settings, and store identifiers with the release owner.
- Test and document notification-tap routing and each supported deep-link path on real devices.
- Establish a broader test/build/release checklist; current automated test coverage is minimal.
- Confirm security remediation for tracked environment/signing material and sensitive logs.

## 16. Important Notes for the Next Developer

- Treat source configuration as authoritative over the existing `README.md` and `docs/` when they disagree; update handover/release docs after confirmation.
- Do not commit or share `.env`, Firebase provisioning files, signing keys, passwords, access tokens, or private service credentials. The Firebase files may contain project identifiers/configuration and should still be transferred only through approved channels.
- Never paste signing credentials into tickets or chat. Verify signing-key ownership and backup before attempting a store release.
- The default API fallback points at the beta host. Confirm that environment selection is correct before QA or release.
- Check actual route registrations in `Navigator.tsx` before adding navigation calls; route names have inconsistent casing/spelling.
- Run platform builds on macOS for iOS and a configured Android SDK/JDK for Android. A successful Metro start alone does not verify native integration.
- This handover was based on static code/config inspection. No source files were changed and no app build, test, or store validation was performed for this documentation task.

## 17. Information/Access Required From the Original Developer

- **Backend:** owner/contact, development/staging/production API and socket URLs, API contract/version, required headers, test accounts, and escalation/monitoring details.
- **Environment:** approved variable values and which files/CI secrets supply them; confirmation whether the current `.env` is tracked or safe to keep locally.
- **Release signing:** Android upload keystore ownership, secure location, alias/password handoff, Play Console access, and whether existing credentials must be rotated. iOS Apple Developer team, certificates/profiles, App Store Connect access, and release-owner contact.
- **Firebase and OAuth:** Firebase project access, Android/iOS app registrations, APNs configuration, Google OAuth client setup, and confirmation whether Google login is supported.
- **Domains and links:** DNS/site owner and deployment status for `assetlinks.json` and Apple App Site Association, plus verified app identifiers/fingerprints.
- **Operations:** CI/CD pipelines, build flavor/environment selection, release procedure, version policy, crash/log access, and rollback process.
- **Product/maintenance:** current known defects, open tickets, priority roadmap, supported OS/device matrix, and feature behavior not described by the code.
