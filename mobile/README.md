# 3i Mobile

Cross-platform Flutter application for Android and iOS.

## Requirements and platform setup

- Flutter 3.44+ and Dart 3.12+
- Android Studio/SDK for Android builds; Xcode on macOS for iOS builds

The current development environment does not have Flutter installed, so generated `android/` and `ios/` runner projects are not included yet. From this directory, run:

```sh
flutter create --platforms=android,ios .
flutter pub get
```

## Run locally

The API URL includes `/api/v1`. Android Emulator uses `10.0.2.2` to access a host machine service; iOS Simulator can use `localhost`.

```sh
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1 \
  --dart-define=GOOGLE_SERVER_CLIENT_ID=your-web-oauth-client-id
```

Configure an Android OAuth client and `google-services.json`, plus the iOS URL scheme from `GoogleService-Info.plist`, before using Google sign-in. Enable the Sign in with Apple capability for the iOS bundle identifier. The Google server/web client ID must match the backend's `GOOGLE_CLIENT_ID`.

The backend sends verification and password-reset links to its configured frontend URL. Configure Android App Links and iOS Universal Links for that domain, including the domain association files, so links open the app. The `/verify-email?token=...` and `/reset-password?token=...` routes accept those links.

## Authentication delivered

- Email and password login. As in the frontend login mutation, the app admits the `Account Holder` role.
- Registration with adult date-of-birth validation, supported locales, and email verification.
- Verification status and resend cooldown, forgot password, and reset password flows.
- Google and (on iOS) Apple sign-in. First-time social accounts are prompted for date of birth.
- Access-token refresh and session restore. The refresh token is read from the API's `Set-Cookie` response and stored using platform secure storage; rotated tokens are persisted on refresh.
- Logout clears the local secure session even if the logout request fails.

The standard frontend `/register` route creates an Account Holder and asks them to verify email. The separate `/auth/register/learner` endpoint creates an account and learner profile together; learner profiles belong to a later app phase, so mobile follows the standard frontend auth flow here.

## Structure

```text
lib/
  app/                    App widget, theme, routing, startup page
  core/                   Shared configuration, network, error handling
  features/
    auth/
      data/                API data source, models, repository implementation
      domain/              Auth entity and repository contract
      presentation/        Riverpod controller, pages, reusable widgets
    home/presentation/     Authenticated landing placeholder for phase 2
  main.dart                Application entry point
```

## Phases

1. Project and platform setup
2. Authentication flows and API integration (implemented)
3. Learner profiles and course discovery
4. Course learning experience and remaining product areas

Auth API payloads and routes are documented in `frontend/src/services/auth.service.ts`, `password.service.ts`, and `email.service.ts`. The visual references are under `frontend/src/app/(auth)`.
