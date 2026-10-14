# 3i Mobile

Flutter app for **3i International Islamic Institute**, for Android and iOS. It talks to the same backend API as the web app (`backend/`) and covers both learners (account holders and their learner profiles) and instructors.

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Running against a local backend](#running-against-a-local-backend)
- [Firebase and push notifications](#firebase-and-push-notifications)
- [Google and Apple sign-in](#google-and-apple-sign-in)
- [Email links (verify email, reset password)](#email-links-verify-email-reset-password)
- [App icon](#app-icon)
- [Building for release](#building-for-release)
- [Tests and code quality](#tests-and-code-quality)
- [Features](#features)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Before publishing to the stores](#before-publishing-to-the-stores)

---

## Requirements

| Tool | Version |
|---|---|
| Flutter | 3.44+ (stable channel) |
| Dart | 3.12+ (bundled with Flutter) |
| Android | Android Studio + Android SDK, JDK 17 |
| iOS | macOS with Xcode and CocoaPods (iOS builds only work on a Mac) |

Check your setup:

```sh
flutter --version
flutter doctor
```

## Quick start

```sh
cd mobile
flutter pub get
flutter run
```

With no extra options, the app uses the **hosted** backend and website (see [Configuration](#configuration)), so it works out of the box on an emulator or a real device.

To pick a device: `flutter devices`, then `flutter run -d <device-id>`.

## Configuration

Settings are passed at build time with `--dart-define` and read in [`lib/core/config/app_config.dart`](lib/core/config/app_config.dart).

| Setting | Default | Used for |
|---|---|---|
| `API_BASE_URL` | `https://threei-institute-v2.onrender.com/api/v1` | All API calls. Must end with `/api/v1`. |
| `WEB_BASE_URL` | `https://threei-institute-v2-1.onrender.com` | Course share links and the "Verify online" link printed on certificate PDFs. |
| `SOCKET_BASE_URL` | Derived from `API_BASE_URL` (same host, no path) | Real-time notifications and chat (Socket.IO). Only set it if sockets run on a different host. |
| `GOOGLE_SERVER_CLIENT_ID` | The production web OAuth client ID | Google sign-in. Must be the backend's **web** OAuth client ID (`GOOGLE_CLIENT_ID`). See [Google sign-in setup](#google-sign-in-setup). |

Example with every setting:

```sh
flutter run \
  --dart-define=API_BASE_URL=https://api.example.com/api/v1 \
  --dart-define=WEB_BASE_URL=https://www.example.com \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
```

**Tip:** to avoid retyping these, put them in a JSON file (keep it out of git if it holds anything private) and use `--dart-define-from-file`:

```json
// dart_defines.local.json
{
  "API_BASE_URL": "http://10.0.2.2:4000/api/v1",
  "GOOGLE_SERVER_CLIENT_ID": "1234567890-abc.apps.googleusercontent.com"
}
```

```sh
flutter run --dart-define-from-file=dart_defines.local.json
```

> Settings are compiled into the app. After changing one, stop the app and run it again; hot reload/restart doesn't pick up new values.

## Google sign-in setup

The learner login and register screens offer **Continue with Google** / **Sign up with Google**. An existing account is signed in; for a new Google email the app asks for the date of birth and creates the account. All OAuth clients below must be in the **same Google Cloud project** as the backend's web client ID (`GOOGLE_CLIENT_ID`).

**Android.** Create an OAuth client of type *Android* (Google Cloud Console → APIs & Services → Credentials) with package name `com.technovicinity.three_i_mobile` and the SHA-1 of the signing key. Add one client per key: the debug key (`keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`), the release/upload key, and the Play App Signing key (Play Console → App integrity). Without a matching client, sign-in fails with a configuration error. No file changes are needed.

**iOS.** Create an OAuth client of type *iOS* with the app's bundle ID, then:

1. Put its client ID and reversed client ID in [`ios/Flutter/GoogleSignIn.xcconfig`](ios/Flutter/GoogleSignIn.xcconfig) (used by `Info.plist`).
2. Add the iOS client ID to the backend's `GOOGLE_MOBILE_CLIENT_IDS`. iOS ID tokens are issued to the iOS client ID, so the backend must accept it.

## Running against a local backend

1. Start the backend (see `backend/`) — by default it listens on port `4000`.
2. Point the app at it. The host address depends on where the app runs:

| Running on | `API_BASE_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:4000/api/v1` (`10.0.2.2` is your computer, seen from the emulator) |
| iOS simulator | `http://localhost:4000/api/v1` |
| Real phone (same Wi-Fi) | `http://<your-computer-LAN-IP>:4000/api/v1`, e.g. `http://192.168.1.20:4000/api/v1` |

```sh
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

If you also run the web frontend locally and want share/verify links to point at it, add `--dart-define=WEB_BASE_URL=http://localhost:3000`.

## Firebase and push notifications

Push notifications use **Firebase Cloud Messaging** (FCM) plus `flutter_local_notifications` to show them while the app is open.

Already in the repo (Firebase project `iinstitute-43580`):

- `android/app/google-services.json` — Android config
- `lib/firebase_options.dart` and `firebase.json` — generated by `flutterfire configure`

The app still starts if Firebase setup fails; push is simply turned off for that run (see [`lib/core/push/push_notifications.dart`](lib/core/push/push_notifications.dart)).

**iOS push needs extra setup** (not done yet):

1. Download `GoogleService-Info.plist` from the Firebase console and add it to `ios/Runner/` through Xcode.
2. In Xcode, enable **Push Notifications** and **Background Modes → Remote notifications** for the Runner target (the background mode is already in `Info.plist`).
3. Upload an **APNs authentication key** (Apple Developer account) in Firebase → Project settings → Cloud Messaging.

To regenerate the Firebase config (e.g. after changing the app ID):

```sh
dart pub global activate flutterfire_cli
flutterfire configure --project=iinstitute-43580
```

The backend also needs its Firebase service account configured to *send* push notifications; until then, the "Push" option in Send Notification shows "Not configured on the server yet".

## Google and Apple sign-in

**Google**

1. In Google Cloud Console, create OAuth clients for **Android** (package name + SHA-1 of your signing key) and **iOS** (bundle ID).
2. Pass the **web** client ID — the same one the backend uses as `GOOGLE_CLIENT_ID` — as `GOOGLE_SERVER_CLIENT_ID`.
3. iOS: add the reversed client ID from `GoogleService-Info.plist` as a URL scheme in `ios/Runner/Info.plist` (`CFBundleURLTypes`).

Get your debug SHA-1 with:

```sh
cd android && ./gradlew signingReport
```

**Apple** (iOS only): enable the **Sign in with Apple** capability for the app's bundle ID in Xcode and in the Apple Developer portal.

New social accounts are asked for a date of birth on first sign-in.

## Email links (verify email, reset password)

The backend emails links to its configured **frontend** URL, e.g. `https://<site>/verify-email?token=…` and `https://<site>/reset-password?token=…`. The app has routes for both, but to open these links *in the app* instead of the browser you need:

- **Android App Links:** an `intent-filter` with `android:autoVerify="true"` for the site's domain in `AndroidManifest.xml`, plus `/.well-known/assetlinks.json` on the website.
- **iOS Universal Links:** the **Associated Domains** capability (`applinks:<domain>`) plus `/.well-known/apple-app-site-association` on the website.

These aren't configured yet, so the links currently open the website, which handles them too.

## App icon

The launcher icon is generated from two images with [`flutter_launcher_icons`](https://pub.dev/packages/flutter_launcher_icons) (settings at the bottom of `pubspec.yaml`):

| File | Used for |
|---|---|
| `assets/icon/app-icon.png` | iOS and older Android (logo on the navy background, square, opaque) |
| `assets/images/logo-icon.png` | Android 8+ adaptive icon (transparent logo on navy `#12304E`) — also the logo shown inside the app |

After replacing either image:

```sh
dart run flutter_launcher_icons
```

Then check `git status`. The tool has two known quirks to undo:

- It may create `android/app/src/main/res/values/colors.xml`, which duplicates `ic_launcher_background` from `ic_launcher_background.xml` and breaks the Android build. Delete `colors.xml`.
- It may change `ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS` in `ios/Runner.xcodeproj/project.pbxproj`. Revert that file: `git checkout -- ios/Runner.xcodeproj/project.pbxproj`.

Phones cache launcher icons: uninstall the app and install again to see a new icon.

## Building for release

Set the version in `pubspec.yaml` first: `version: 1.2.0+5` means version name `1.2.0`, build number `5` (the build number must go up for every store upload).

**Android**

```sh
# App bundle for Google Play
flutter build appbundle --release --dart-define-from-file=dart_defines.prod.json

# APK for direct installs / testing
flutter build apk --release --dart-define-from-file=dart_defines.prod.json
```

Output: `build/app/outputs/bundle/release/app-release.aab` and `build/app/outputs/flutter-apk/app-release.apk`.

> Release builds are currently signed with the **debug key** (see `android/app/build.gradle.kts`). Google Play won't accept that — see [Before publishing](#before-publishing-to-the-stores).

**iOS** (on a Mac)

```sh
cd ios && pod install && cd ..
flutter build ipa --release --dart-define-from-file=dart_defines.prod.json
```

Then upload `build/ios/ipa/*.ipa` with Xcode's Organizer or the Transporter app. Signing uses the team set in Xcode (Runner → Signing & Capabilities).

## Tests and code quality

```sh
flutter test          # unit and widget tests in test/
flutter analyze       # static analysis (rules in analysis_options.yaml)
dart format lib test  # format code
```

Tests live in `test/`. They cover self-contained pieces (e.g. the Markdown renderer for help/policy pages and the grading helpers). The full app widget (`ThreeIApp`) isn't pumped in tests because it starts Firebase, secure storage and network calls.

## Features

**Everyone (no login needed)**
- Course catalogue with search, filters (category, type, language, age), sorting and pagination
- Course details: outcomes, curriculum, batches, instructor, reviews, FAQs, related courses
- Help & support (FAQ, contact details) and policy pages (privacy, terms, …), managed from the admin **Content** section

**Account holders and learners**
- Email/password, Google and Apple sign-in; registration with email verification; forgot/reset password
- Learner profiles: choose a profile (optional 4-digit PIN), add profiles, seat status
- Dashboard: greeting, live-class banner, stats and streak, continue learning, upcoming classes, deadlines, recent results, weekly activity, notes, recommendations
- Enrolment (regular courses directly, online classes by batch), wishlist
- Learning: lessons (video, PDF, documents), progress tracking, lesson notes
- Online classes: class schedule per batch with Join links, batch chat
- Exams (take exams, view results), assignments, certificates (preview and save as PDF)
- Rate & review enrolled courses
- In-app notifications with live unread counts, plus push notifications

**Instructors**
- Dashboard with "needs grading" list and overdue highlighting
- Manage courses, materials, batches and sessions, exams and questions, assignments
- Grading queue, grade attempts with "Grade next"
- Live classes, students, certificates
- Send notifications to a course or a single batch (in-app and/or push), with sent history

## Project structure

```text
mobile/
  assets/
    icon/app-icon.png        Launcher icon source (iOS, older Android)
    images/                  In-app images, incl. logo-icon.png
  lib/
    main.dart                Entry point: Firebase/push setup, ProviderScope, app widget
    firebase_options.dart    Generated by flutterfire configure
    app/
      app.dart               ThreeIApp (MaterialApp.router)
      router/app_router.dart All routes and role-based redirects
      theme/                 Colours and theme
      pages/                 Startup page and shared pages
    core/
      config/app_config.dart Build-time settings (--dart-define)
      network/               Dio API client, auth/refresh handling, error messages
      push/                  Firebase Cloud Messaging + local notifications
      share/                 Share links for courses
    features/                One folder per feature, each split into:
      <feature>/data/          API calls and JSON models
      <feature>/domain/        Entities (plain Dart classes)
      <feature>/presentation/  Riverpod providers, pages, widgets
  test/                      Unit and widget tests
  android/  ios/             Native projects
```

Feature folders: `auth`, `profiles`, `home`, `courses`, `wishlist`, `dashboard`, `learning`, `exams`, `assignments`, `certificates`, `chat`, `notifications`, `content` (help and policy pages), `instructor_dashboard`, `instructor_courses`.

State management is **Riverpod**, routing is **go_router**, HTTP is **Dio**. The refresh token is stored with `flutter_secure_storage` and the session is restored on launch.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Connection refused" against a local backend | On the Android emulator use `10.0.2.2`, not `localhost`. On a real phone use your computer's LAN IP and make sure the backend listens on `0.0.0.0`. |
| A new `--dart-define` value has no effect | Stop the app and run again; hot reload doesn't reload build settings. |
| Launcher icon didn't change | Uninstall the app, then install again (launchers cache icons). Run `flutter clean` if needed. |
| Android build fails with "Duplicate resources … ic_launcher_background" | Delete `android/app/src/main/res/values/colors.xml` (created by the icon generator). |
| Google sign-in fails | Check `GOOGLE_SERVER_CLIENT_ID` is the backend's web client ID, and that your signing key's SHA-1 is registered for the Android OAuth client. |
| Push "Not configured on the server yet" | The backend has no Firebase service account set; configure it on the server. |
| No push notifications on iOS | Add `GoogleService-Info.plist` and the APNs key (see [Firebase](#firebase-and-push-notifications)). |
| Strange build errors after switching branches | `flutter clean && flutter pub get` (and `cd ios && pod install` on macOS). |

## Before publishing to the stores

These are still open:

1. **Android release signing.** Create an upload keystore, add `android/key.properties` (keep it and the keystore out of git), and use it in the `release` build type in `android/app/build.gradle.kts`. See [Flutter's Android deployment guide](https://docs.flutter.dev/deployment/android#sign-the-app).
2. **App identifiers.** iOS still uses the template bundle ID `com.example.threeIMobile`, and the Android `namespace` is `com.example.three_i_mobile` (the Android `applicationId` is already `com.technovicinity.three_i_mobile`). Set a final iOS bundle ID before the first App Store upload, and update the Firebase and OAuth configs to match.
3. **iOS Firebase file and APNs key** for push notifications.
4. **App Links / Universal Links** if email links should open the app.
5. **Production settings:** check `API_BASE_URL` and `WEB_BASE_URL` point at the production backend and website (create `dart_defines.prod.json`).
6. **Store listing:** link the privacy policy published from the admin Content section (`<website>/pages/privacy`).
