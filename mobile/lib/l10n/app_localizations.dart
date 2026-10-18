import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_bn.dart';
import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_ur.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('bn'),
    Locale('en'),
    Locale('hi'),
    Locale('ur'),
  ];

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get commonContinue;

  /// No description provided for @commonTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get commonTryAgain;

  /// No description provided for @commonSending.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get commonSending;

  /// No description provided for @commonClose.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get commonClose;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonOr.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get commonOr;

  /// No description provided for @commonLearner.
  ///
  /// In en, this message translates to:
  /// **'Learner'**
  String get commonLearner;

  /// No description provided for @commonAdult.
  ///
  /// In en, this message translates to:
  /// **'Adult'**
  String get commonAdult;

  /// No description provided for @commonAgeRange.
  ///
  /// In en, this message translates to:
  /// **'Ages {min}–{max}'**
  String commonAgeRange(String min, String max);

  /// No description provided for @commonAgeUnder.
  ///
  /// In en, this message translates to:
  /// **'Ages {max} and under'**
  String commonAgeUnder(String max);

  /// No description provided for @commonNotSubscribed.
  ///
  /// In en, this message translates to:
  /// **'Not subscribed'**
  String get commonNotSubscribed;

  /// No description provided for @commonConnectionError.
  ///
  /// In en, this message translates to:
  /// **'Unable to connect. Check your internet connection.'**
  String get commonConnectionError;

  /// No description provided for @commonLogoLabel.
  ///
  /// In en, this message translates to:
  /// **'3i International Islamic Institute logo'**
  String get commonLogoLabel;

  /// No description provided for @commonInstituteName.
  ///
  /// In en, this message translates to:
  /// **'International Islamic Institute'**
  String get commonInstituteName;

  /// No description provided for @languageLabel.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageLabel;

  /// No description provided for @languageSettingBody.
  ///
  /// In en, this message translates to:
  /// **'The language used on the website, in the app and in emails'**
  String get languageSettingBody;

  /// No description provided for @languageSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t save your language on your account. It will reset the next time you sign in.'**
  String get languageSaveFailed;

  /// No description provided for @authEmailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email address'**
  String get authEmailLabel;

  /// No description provided for @authPasswordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPasswordLabel;

  /// No description provided for @authShowPassword.
  ///
  /// In en, this message translates to:
  /// **'Show password'**
  String get authShowPassword;

  /// No description provided for @authHidePassword.
  ///
  /// In en, this message translates to:
  /// **'Hide password'**
  String get authHidePassword;

  /// No description provided for @authEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address'**
  String get authEmailInvalid;

  /// No description provided for @authPasswordRequired.
  ///
  /// In en, this message translates to:
  /// **'Password is required'**
  String get authPasswordRequired;

  /// No description provided for @authPasswordMin.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 10 characters'**
  String get authPasswordMin;

  /// No description provided for @authPasswordMax.
  ///
  /// In en, this message translates to:
  /// **'Password must be 128 characters or fewer'**
  String get authPasswordMax;

  /// No description provided for @authBackToLogin.
  ///
  /// In en, this message translates to:
  /// **'Back to log in'**
  String get authBackToLogin;

  /// No description provided for @authGoToLogin.
  ///
  /// In en, this message translates to:
  /// **'Go to log in'**
  String get authGoToLogin;

  /// No description provided for @authSelectDate.
  ///
  /// In en, this message translates to:
  /// **'Select date'**
  String get authSelectDate;

  /// No description provided for @authSelectDob.
  ///
  /// In en, this message translates to:
  /// **'Select your date of birth'**
  String get authSelectDob;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome back'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Please enter your credentials to log in.'**
  String get loginSubtitle;

  /// No description provided for @loginForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot password?'**
  String get loginForgotPassword;

  /// No description provided for @loginSubmit.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get loginSubmit;

  /// No description provided for @loginFailed.
  ///
  /// In en, this message translates to:
  /// **'Login failed. Please try again.'**
  String get loginFailed;

  /// No description provided for @loginNewHere.
  ///
  /// In en, this message translates to:
  /// **'New to 3i?'**
  String get loginNewHere;

  /// No description provided for @loginCreateAccount.
  ///
  /// In en, this message translates to:
  /// **'Create an account'**
  String get loginCreateAccount;

  /// No description provided for @loginInstructorPortal.
  ///
  /// In en, this message translates to:
  /// **'Instructor portal'**
  String get loginInstructorPortal;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Start your journey'**
  String get registerTitle;

  /// No description provided for @registerSubtitle.
  ///
  /// In en, this message translates to:
  /// **'One account. Add your children whenever you\'re ready.'**
  String get registerSubtitle;

  /// No description provided for @registerFirstName.
  ///
  /// In en, this message translates to:
  /// **'First name'**
  String get registerFirstName;

  /// No description provided for @registerFirstNameHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Sarah'**
  String get registerFirstNameHint;

  /// No description provided for @registerLastName.
  ///
  /// In en, this message translates to:
  /// **'Last name'**
  String get registerLastName;

  /// No description provided for @registerLastNameHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. Ahmed'**
  String get registerLastNameHint;

  /// No description provided for @registerFirstNameRequired.
  ///
  /// In en, this message translates to:
  /// **'First name is required'**
  String get registerFirstNameRequired;

  /// No description provided for @registerLastNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Last name is required'**
  String get registerLastNameRequired;

  /// No description provided for @registerNameTooLong.
  ///
  /// In en, this message translates to:
  /// **'Must be 100 characters or fewer'**
  String get registerNameTooLong;

  /// No description provided for @registerPasswordHint.
  ///
  /// In en, this message translates to:
  /// **'At least 10 characters'**
  String get registerPasswordHint;

  /// No description provided for @registerDateOfBirth.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get registerDateOfBirth;

  /// No description provided for @registerDateOfBirthHint.
  ///
  /// In en, this message translates to:
  /// **'Must be 18 or older'**
  String get registerDateOfBirthHint;

  /// No description provided for @registerDobRequired.
  ///
  /// In en, this message translates to:
  /// **'Select your date of birth. You must be at least 18.'**
  String get registerDobRequired;

  /// No description provided for @registerLanguage.
  ///
  /// In en, this message translates to:
  /// **'Preferred language'**
  String get registerLanguage;

  /// No description provided for @registerLanguageHint.
  ///
  /// In en, this message translates to:
  /// **'The language the app uses. You can change it anytime.'**
  String get registerLanguageHint;

  /// No description provided for @registerSubmit.
  ///
  /// In en, this message translates to:
  /// **'Create account'**
  String get registerSubmit;

  /// No description provided for @registerFailed.
  ///
  /// In en, this message translates to:
  /// **'Registration failed. Please try again.'**
  String get registerFailed;

  /// No description provided for @registerHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get registerHaveAccount;

  /// No description provided for @registerLogIn.
  ///
  /// In en, this message translates to:
  /// **'Log in'**
  String get registerLogIn;

  /// No description provided for @forgotTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset your password'**
  String get forgotTitle;

  /// No description provided for @forgotSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter the email on your account and we\'ll send you a link.'**
  String get forgotSubtitle;

  /// No description provided for @forgotSubmit.
  ///
  /// In en, this message translates to:
  /// **'Send reset link'**
  String get forgotSubmit;

  /// No description provided for @forgotSentTitle.
  ///
  /// In en, this message translates to:
  /// **'Check your email'**
  String get forgotSentTitle;

  /// No description provided for @forgotSentBody.
  ///
  /// In en, this message translates to:
  /// **'If an account with that email exists, we\'ve sent a password reset link.'**
  String get forgotSentBody;

  /// No description provided for @forgotFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to send reset link'**
  String get forgotFailed;

  /// No description provided for @resetTitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a new password'**
  String get resetTitle;

  /// No description provided for @resetSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Choose a secure password with at least 10 characters.'**
  String get resetSubtitle;

  /// No description provided for @resetNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get resetNewPassword;

  /// No description provided for @resetConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm new password'**
  String get resetConfirm;

  /// No description provided for @resetSubmit.
  ///
  /// In en, this message translates to:
  /// **'Update password'**
  String get resetSubmit;

  /// No description provided for @resetMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get resetMismatch;

  /// No description provided for @resetInvalidLink.
  ///
  /// In en, this message translates to:
  /// **'This password reset link is invalid or incomplete. Request a new link.'**
  String get resetInvalidLink;

  /// No description provided for @resetFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to reset password'**
  String get resetFailed;

  /// No description provided for @resetDoneTitle.
  ///
  /// In en, this message translates to:
  /// **'Password updated'**
  String get resetDoneTitle;

  /// No description provided for @resetDoneBody.
  ///
  /// In en, this message translates to:
  /// **'Your password has been updated. Log in with your new password.'**
  String get resetDoneBody;

  /// No description provided for @checkEmailTitle.
  ///
  /// In en, this message translates to:
  /// **'Check your email'**
  String get checkEmailTitle;

  /// No description provided for @checkEmailSentTo.
  ///
  /// In en, this message translates to:
  /// **'We\'ve sent a verification link to {email}'**
  String checkEmailSentTo(String email);

  /// No description provided for @checkEmailResend.
  ///
  /// In en, this message translates to:
  /// **'Resend email'**
  String get checkEmailResend;

  /// No description provided for @checkEmailCanResendNow.
  ///
  /// In en, this message translates to:
  /// **'You can resend now'**
  String get checkEmailCanResendNow;

  /// No description provided for @checkEmailResendIn.
  ///
  /// In en, this message translates to:
  /// **'You can resend in {seconds} seconds'**
  String checkEmailResendIn(int seconds);

  /// No description provided for @checkEmailResendFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to resend email'**
  String get checkEmailResendFailed;

  /// No description provided for @checkEmailWrongEmail.
  ///
  /// In en, this message translates to:
  /// **'Wrong email? Go back'**
  String get checkEmailWrongEmail;

  /// No description provided for @checkEmailBackInstructor.
  ///
  /// In en, this message translates to:
  /// **'Back to instructor sign in'**
  String get checkEmailBackInstructor;

  /// No description provided for @verifyVerifying.
  ///
  /// In en, this message translates to:
  /// **'Verifying your email...'**
  String get verifyVerifying;

  /// No description provided for @verifyPleaseWait.
  ///
  /// In en, this message translates to:
  /// **'Please wait while we verify your email.'**
  String get verifyPleaseWait;

  /// No description provided for @verifyVerifiedTitle.
  ///
  /// In en, this message translates to:
  /// **'Email verified!'**
  String get verifyVerifiedTitle;

  /// No description provided for @verifyVerifiedBody.
  ///
  /// In en, this message translates to:
  /// **'Your email is verified. You can now log in.'**
  String get verifyVerifiedBody;

  /// No description provided for @verifyExpiredTitle.
  ///
  /// In en, this message translates to:
  /// **'This link has expired'**
  String get verifyExpiredTitle;

  /// No description provided for @verifyExpiredBody.
  ///
  /// In en, this message translates to:
  /// **'Verification links are valid for 24 hours. We can send a new one to the same email address.'**
  String get verifyExpiredBody;

  /// No description provided for @verifyFailedTitle.
  ///
  /// In en, this message translates to:
  /// **'Verification failed'**
  String get verifyFailedTitle;

  /// No description provided for @verifyFailed.
  ///
  /// In en, this message translates to:
  /// **'Verification failed'**
  String get verifyFailed;

  /// No description provided for @verifyInvalidLink.
  ///
  /// In en, this message translates to:
  /// **'Invalid verification link'**
  String get verifyInvalidLink;

  /// No description provided for @verifyNewLinkTitle.
  ///
  /// In en, this message translates to:
  /// **'New link sent'**
  String get verifyNewLinkTitle;

  /// No description provided for @verifyNewLinkBody.
  ///
  /// In en, this message translates to:
  /// **'We\'ve sent a new verification link to your email. Open it within 24 hours to finish setting up your account.'**
  String get verifyNewLinkBody;

  /// No description provided for @verifySendNewLink.
  ///
  /// In en, this message translates to:
  /// **'Send me a new link'**
  String get verifySendNewLink;

  /// No description provided for @verifyNewLinkFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to send a new link'**
  String get verifyNewLinkFailed;

  /// No description provided for @unverifiedTitle.
  ///
  /// In en, this message translates to:
  /// **'Please verify your email first'**
  String get unverifiedTitle;

  /// No description provided for @unverifiedBody.
  ///
  /// In en, this message translates to:
  /// **'We sent a verification link to {email}. If it has expired or you can\'t find it, we can send a new one.'**
  String unverifiedBody(String email);

  /// No description provided for @unverifiedResend.
  ///
  /// In en, this message translates to:
  /// **'Resend verification email'**
  String get unverifiedResend;

  /// No description provided for @socialContinueGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get socialContinueGoogle;

  /// No description provided for @socialContinueApple.
  ///
  /// In en, this message translates to:
  /// **'Continue with Apple'**
  String get socialContinueApple;

  /// No description provided for @socialSignUpGoogle.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Google'**
  String get socialSignUpGoogle;

  /// No description provided for @socialSignUpApple.
  ///
  /// In en, this message translates to:
  /// **'Sign up with Apple'**
  String get socialSignUpApple;

  /// No description provided for @socialGoogleFailed.
  ///
  /// In en, this message translates to:
  /// **'Google sign-in failed'**
  String get socialGoogleFailed;

  /// No description provided for @socialAppleFailed.
  ///
  /// In en, this message translates to:
  /// **'Apple sign-in failed'**
  String get socialAppleFailed;

  /// No description provided for @socialAppleNoToken.
  ///
  /// In en, this message translates to:
  /// **'No identity token received from Apple'**
  String get socialAppleNoToken;

  /// No description provided for @socialDobRequired.
  ///
  /// In en, this message translates to:
  /// **'Your date of birth is required to create an account with {provider}.'**
  String socialDobRequired(String provider);

  /// No description provided for @socialCreateTitle.
  ///
  /// In en, this message translates to:
  /// **'Create your account'**
  String get socialCreateTitle;

  /// No description provided for @socialCreateBody.
  ///
  /// In en, this message translates to:
  /// **'There\'s no 3i account for this {provider} email yet. To create one, enter your date of birth. You must be at least 13 years old.'**
  String socialCreateBody(String provider);

  /// No description provided for @profilesWhoIsLearning.
  ///
  /// In en, this message translates to:
  /// **'Who\'s learning today?'**
  String get profilesWhoIsLearning;

  /// No description provided for @profilesEmpty.
  ///
  /// In en, this message translates to:
  /// **'Add a learner profile to get started.'**
  String get profilesEmpty;

  /// No description provided for @profilesLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load profiles'**
  String get profilesLoadFailed;

  /// No description provided for @profilesAddLearner.
  ///
  /// In en, this message translates to:
  /// **'Add learner'**
  String get profilesAddLearner;

  /// No description provided for @profilesLogOut.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get profilesLogOut;

  /// No description provided for @pinEnter.
  ///
  /// In en, this message translates to:
  /// **'Enter your 4-digit PIN'**
  String get pinEnter;

  /// No description provided for @pinIncorrect.
  ///
  /// In en, this message translates to:
  /// **'That PIN doesn\'t match. Try again.'**
  String get pinIncorrect;

  /// No description provided for @pinTriesLeft.
  ///
  /// In en, this message translates to:
  /// **'Incorrect PIN. {count, plural, one {{count} try} other {{count} tries}} left.'**
  String pinTriesLeft(int count);

  /// No description provided for @pinCheckFailed.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t check the PIN. Check your connection.'**
  String get pinCheckFailed;

  /// No description provided for @pinTooMany.
  ///
  /// In en, this message translates to:
  /// **'Too many attempts. Try again in {seconds}s.'**
  String pinTooMany(int seconds);

  /// No description provided for @pinForgot.
  ///
  /// In en, this message translates to:
  /// **'Forgot your PIN? Ask the account holder to reset it from Manage profiles.'**
  String get pinForgot;

  /// No description provided for @pinProgress.
  ///
  /// In en, this message translates to:
  /// **'PIN, {filled} of {length} digits entered'**
  String pinProgress(int filled, int length);

  /// No description provided for @settingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Account settings'**
  String get settingsTitle;

  /// No description provided for @settingsFamilyTitle.
  ///
  /// In en, this message translates to:
  /// **'Family & profiles'**
  String get settingsFamilyTitle;

  /// No description provided for @settingsFamilyBody.
  ///
  /// In en, this message translates to:
  /// **'Manage learner profiles and PINs'**
  String get settingsFamilyBody;

  /// No description provided for @settingsDevicesTitle.
  ///
  /// In en, this message translates to:
  /// **'Devices'**
  String get settingsDevicesTitle;

  /// No description provided for @settingsDevicesBody.
  ///
  /// In en, this message translates to:
  /// **'Device management is available on the website'**
  String get settingsDevicesBody;

  /// No description provided for @settingsSubscriptionTitle.
  ///
  /// In en, this message translates to:
  /// **'Subscription & billing'**
  String get settingsSubscriptionTitle;

  /// No description provided for @settingsSubscriptionBody.
  ///
  /// In en, this message translates to:
  /// **'Pay for and renew each learner\'s subscription'**
  String get settingsSubscriptionBody;

  /// No description provided for @settingsSecurityTitle.
  ///
  /// In en, this message translates to:
  /// **'Login & security'**
  String get settingsSecurityTitle;

  /// No description provided for @settingsSecurityBody.
  ///
  /// In en, this message translates to:
  /// **'Update your email and password'**
  String get settingsSecurityBody;

  /// No description provided for @menuAccount.
  ///
  /// In en, this message translates to:
  /// **'User menu'**
  String get menuAccount;

  /// No description provided for @menuSwitchLearner.
  ///
  /// In en, this message translates to:
  /// **'Switch learner profile'**
  String get menuSwitchLearner;

  /// No description provided for @menuFamily.
  ///
  /// In en, this message translates to:
  /// **'Family & profiles'**
  String get menuFamily;

  /// No description provided for @menuSubscription.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get menuSubscription;

  /// No description provided for @menuManageAccount.
  ///
  /// In en, this message translates to:
  /// **'Manage account'**
  String get menuManageAccount;

  /// No description provided for @menuLogOut.
  ///
  /// In en, this message translates to:
  /// **'Log out'**
  String get menuLogOut;

  /// No description provided for @menuCourses.
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get menuCourses;

  /// No description provided for @menuHelp.
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get menuHelp;

  /// No description provided for @menuLearnerProfile.
  ///
  /// In en, this message translates to:
  /// **'Learner profile'**
  String get menuLearnerProfile;

  /// No description provided for @dashboardGreeting.
  ///
  /// In en, this message translates to:
  /// **'Assalamu alaikum, {name}'**
  String dashboardGreeting(String name);

  /// No description provided for @dashboardWelcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome back to your dashboard'**
  String get dashboardWelcomeBack;

  /// No description provided for @dashboardSearchCourses.
  ///
  /// In en, this message translates to:
  /// **'Search courses'**
  String get dashboardSearchCourses;

  /// No description provided for @dashboardExploreCourses.
  ///
  /// In en, this message translates to:
  /// **'Explore courses'**
  String get dashboardExploreCourses;

  /// No description provided for @navDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// No description provided for @navRegularCourses.
  ///
  /// In en, this message translates to:
  /// **'Regular Courses'**
  String get navRegularCourses;

  /// No description provided for @navOnlineClasses.
  ///
  /// In en, this message translates to:
  /// **'Online Classes'**
  String get navOnlineClasses;

  /// No description provided for @navAssignments.
  ///
  /// In en, this message translates to:
  /// **'Assignments'**
  String get navAssignments;

  /// No description provided for @navExams.
  ///
  /// In en, this message translates to:
  /// **'Exams'**
  String get navExams;

  /// No description provided for @navCertificates.
  ///
  /// In en, this message translates to:
  /// **'Certificates'**
  String get navCertificates;

  /// No description provided for @navWishlist.
  ///
  /// In en, this message translates to:
  /// **'Wishlist'**
  String get navWishlist;

  /// No description provided for @coursesTitle.
  ///
  /// In en, this message translates to:
  /// **'Courses'**
  String get coursesTitle;

  /// No description provided for @coursesForLearner.
  ///
  /// In en, this message translates to:
  /// **'Showing courses suited to {name} (age {age}).'**
  String coursesForLearner(String name, int age);

  /// No description provided for @detailAgeNoticeTitle.
  ///
  /// In en, this message translates to:
  /// **'This course isn\'t for {name}\'s age'**
  String detailAgeNoticeTitle(String name);

  /// No description provided for @detailAgeNoticeBody.
  ///
  /// In en, this message translates to:
  /// **'It\'s for learners aged {range}. {name} is {age}.'**
  String detailAgeNoticeBody(String range, String name, int age);

  /// No description provided for @detailAgeNoticeBrowse.
  ///
  /// In en, this message translates to:
  /// **'See courses for {name}'**
  String detailAgeNoticeBrowse(String name);

  /// No description provided for @coursesBandNotForAge.
  ///
  /// In en, this message translates to:
  /// **'Not for {name}\'s age'**
  String coursesBandNotForAge(String name);

  /// No description provided for @coursesSearch.
  ///
  /// In en, this message translates to:
  /// **'Search courses, instructors, topics...'**
  String get coursesSearch;

  /// No description provided for @coursesClearSearch.
  ///
  /// In en, this message translates to:
  /// **'Clear search'**
  String get coursesClearSearch;

  /// No description provided for @coursesLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading courses...'**
  String get coursesLoading;

  /// No description provided for @coursesLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Courses could not be loaded.'**
  String get coursesLoadFailed;

  /// No description provided for @coursesCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} course} other {{count} courses}}'**
  String coursesCount(int count);

  /// No description provided for @coursesCategory.
  ///
  /// In en, this message translates to:
  /// **'Category'**
  String get coursesCategory;

  /// No description provided for @coursesAllCategories.
  ///
  /// In en, this message translates to:
  /// **'All categories'**
  String get coursesAllCategories;

  /// No description provided for @coursesType.
  ///
  /// In en, this message translates to:
  /// **'Type'**
  String get coursesType;

  /// No description provided for @coursesAllTypes.
  ///
  /// In en, this message translates to:
  /// **'All types'**
  String get coursesAllTypes;

  /// No description provided for @coursesTypeRegular.
  ///
  /// In en, this message translates to:
  /// **'Regular'**
  String get coursesTypeRegular;

  /// No description provided for @coursesTypeLive.
  ///
  /// In en, this message translates to:
  /// **'Online Class'**
  String get coursesTypeLive;

  /// No description provided for @coursesTypeHybrid.
  ///
  /// In en, this message translates to:
  /// **'Hybrid'**
  String get coursesTypeHybrid;

  /// No description provided for @coursesLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get coursesLanguage;

  /// No description provided for @coursesAllLanguages.
  ///
  /// In en, this message translates to:
  /// **'All languages'**
  String get coursesAllLanguages;

  /// No description provided for @coursesAge.
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get coursesAge;

  /// No description provided for @coursesSort.
  ///
  /// In en, this message translates to:
  /// **'Sort'**
  String get coursesSort;

  /// No description provided for @coursesSortPopularity.
  ///
  /// In en, this message translates to:
  /// **'Relevance'**
  String get coursesSortPopularity;

  /// No description provided for @coursesSortNewest.
  ///
  /// In en, this message translates to:
  /// **'Newest'**
  String get coursesSortNewest;

  /// No description provided for @coursesSortRating.
  ///
  /// In en, this message translates to:
  /// **'Highest Rated'**
  String get coursesSortRating;

  /// No description provided for @coursesSortTitle.
  ///
  /// In en, this message translates to:
  /// **'Title A-Z'**
  String get coursesSortTitle;

  /// No description provided for @coursesClearFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear filters'**
  String get coursesClearFilters;

  /// No description provided for @coursesClearAllFilters.
  ///
  /// In en, this message translates to:
  /// **'Clear all filters'**
  String get coursesClearAllFilters;

  /// No description provided for @coursesNoResults.
  ///
  /// In en, this message translates to:
  /// **'No courses found matching your filters.'**
  String get coursesNoResults;

  /// No description provided for @coursesPageOf.
  ///
  /// In en, this message translates to:
  /// **'Page {page} of {total}'**
  String coursesPageOf(int page, int total);

  /// No description provided for @commonAllAges.
  ///
  /// In en, this message translates to:
  /// **'All ages'**
  String get commonAllAges;

  /// No description provided for @commonAgesFrom.
  ///
  /// In en, this message translates to:
  /// **'Ages {min}+'**
  String commonAgesFrom(String min);

  /// No description provided for @commonNewRating.
  ///
  /// In en, this message translates to:
  /// **'New'**
  String get commonNewRating;

  /// No description provided for @commonRecommendedAge.
  ///
  /// In en, this message translates to:
  /// **'Recommended age group'**
  String get commonRecommendedAge;

  /// No description provided for @commonPrevious.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get commonPrevious;

  /// No description provided for @commonNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get commonNext;

  /// No description provided for @courseCardPreview.
  ///
  /// In en, this message translates to:
  /// **'Course Preview'**
  String get courseCardPreview;

  /// No description provided for @wishlistAdd.
  ///
  /// In en, this message translates to:
  /// **'Add to wishlist'**
  String get wishlistAdd;

  /// No description provided for @wishlistRemove.
  ///
  /// In en, this message translates to:
  /// **'Remove from wishlist'**
  String get wishlistRemove;

  /// No description provided for @wishlistUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not update wishlist.'**
  String get wishlistUpdateFailed;

  /// No description provided for @landingHomeLabel.
  ///
  /// In en, this message translates to:
  /// **'3i International Islamic Institute home'**
  String get landingHomeLabel;

  /// No description provided for @landingAccountMenu.
  ///
  /// In en, this message translates to:
  /// **'Account and learner menu'**
  String get landingAccountMenu;

  /// No description provided for @landingAccount.
  ///
  /// In en, this message translates to:
  /// **'Account'**
  String get landingAccount;

  /// No description provided for @menuDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get menuDashboard;

  /// No description provided for @menuMyCourses.
  ///
  /// In en, this message translates to:
  /// **'My Courses'**
  String get menuMyCourses;

  /// No description provided for @footerTagline.
  ///
  /// In en, this message translates to:
  /// **'Rigorous teaching. Global classrooms. One institute.'**
  String get footerTagline;

  /// No description provided for @footerAbout.
  ///
  /// In en, this message translates to:
  /// **'Structured, accredited programs across the sciences, humanities, and professional fields, taught to students in 40 countries.'**
  String get footerAbout;

  /// No description provided for @footerRights.
  ///
  /// In en, this message translates to:
  /// **'© {year} 3i International Islamic Institute. All rights reserved.'**
  String footerRights(String year);

  /// No description provided for @homeWelcome.
  ///
  /// In en, this message translates to:
  /// **'Welcome'**
  String get homeWelcome;

  /// No description provided for @homeWelcomeName.
  ///
  /// In en, this message translates to:
  /// **'Welcome, {name}'**
  String homeWelcomeName(String name);

  /// No description provided for @homeSignedIn.
  ///
  /// In en, this message translates to:
  /// **'You are signed in.'**
  String get homeSignedIn;

  /// No description provided for @shareText.
  ///
  /// In en, this message translates to:
  /// **'Check out \"{title}\" at 3i International Islamic Institute'**
  String shareText(String title);

  /// No description provided for @shareDetailsCopied.
  ///
  /// In en, this message translates to:
  /// **'Course details copied'**
  String get shareDetailsCopied;

  /// No description provided for @shareLinkCopied.
  ///
  /// In en, this message translates to:
  /// **'Link copied'**
  String get shareLinkCopied;

  /// No description provided for @levelBeginner.
  ///
  /// In en, this message translates to:
  /// **'Beginner'**
  String get levelBeginner;

  /// No description provided for @levelIntermediate.
  ///
  /// In en, this message translates to:
  /// **'Intermediate'**
  String get levelIntermediate;

  /// No description provided for @levelAdvanced.
  ///
  /// In en, this message translates to:
  /// **'Advanced'**
  String get levelAdvanced;

  /// No description provided for @levelAll.
  ///
  /// In en, this message translates to:
  /// **'All levels'**
  String get levelAll;

  /// No description provided for @commonMinutes.
  ///
  /// In en, this message translates to:
  /// **'{count} min'**
  String commonMinutes(int count);

  /// No description provided for @commonBackToCourses.
  ///
  /// In en, this message translates to:
  /// **'Back to courses'**
  String get commonBackToCourses;

  /// No description provided for @detailLearn.
  ///
  /// In en, this message translates to:
  /// **'What you\'ll learn'**
  String get detailLearn;

  /// No description provided for @detailRequirements.
  ///
  /// In en, this message translates to:
  /// **'Requirements'**
  String get detailRequirements;

  /// No description provided for @detailAbout.
  ///
  /// In en, this message translates to:
  /// **'About this course'**
  String get detailAbout;

  /// No description provided for @detailStudentsAlsoTook.
  ///
  /// In en, this message translates to:
  /// **'Students also took'**
  String get detailStudentsAlsoTook;

  /// No description provided for @detailBreadcrumb.
  ///
  /// In en, this message translates to:
  /// **'Courses  ›  {category}'**
  String detailBreadcrumb(String category);

  /// No description provided for @detailRatingMeta.
  ///
  /// In en, this message translates to:
  /// **'{rating} · {count, plural, one {{count} review} other {{count} reviews}}'**
  String detailRatingMeta(String rating, int count);

  /// No description provided for @detailInstructedBy.
  ///
  /// In en, this message translates to:
  /// **'Instructed by '**
  String get detailInstructedBy;

  /// No description provided for @detailLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load course'**
  String get detailLoadFailed;

  /// No description provided for @enrolWaitlisted.
  ///
  /// In en, this message translates to:
  /// **'Added to waitlist. You\'ll be notified when a seat opens.'**
  String get enrolWaitlisted;

  /// No description provided for @enrolSuccess.
  ///
  /// In en, this message translates to:
  /// **'Enrolled successfully'**
  String get enrolSuccess;

  /// No description provided for @enrolFailed.
  ///
  /// In en, this message translates to:
  /// **'Enrolment failed'**
  String get enrolFailed;

  /// No description provided for @enrolSubscribe.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get enrolSubscribe;

  /// No description provided for @enrolNoBatches.
  ///
  /// In en, this message translates to:
  /// **'There are no available batches right now.'**
  String get enrolNoBatches;

  /// No description provided for @cardIncluded.
  ///
  /// In en, this message translates to:
  /// **'INCLUDED WITH MEMBERSHIP'**
  String get cardIncluded;

  /// No description provided for @cardEnrolledTitle.
  ///
  /// In en, this message translates to:
  /// **'You\'re enrolled'**
  String get cardEnrolledTitle;

  /// No description provided for @cardStartToday.
  ///
  /// In en, this message translates to:
  /// **'Start learning today'**
  String get cardStartToday;

  /// No description provided for @cardNotAvailable.
  ///
  /// In en, this message translates to:
  /// **'Not available for {name}. {message} ({name} is {age}).'**
  String cardNotAvailable(String name, String message, String age);

  /// No description provided for @cardEnrolNow.
  ///
  /// In en, this message translates to:
  /// **'Enrol Now'**
  String get cardEnrolNow;

  /// No description provided for @cardNeedsSubscription.
  ///
  /// In en, this message translates to:
  /// **'{name} needs a subscription to enrol in courses.'**
  String cardNeedsSubscription(String name);

  /// No description provided for @cardSubscribeToEnrol.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to Enrol'**
  String get cardSubscribeToEnrol;

  /// No description provided for @cardChooseBatch.
  ///
  /// In en, this message translates to:
  /// **'Choose a class batch'**
  String get cardChooseBatch;

  /// No description provided for @cardManageSubscription.
  ///
  /// In en, this message translates to:
  /// **'Manage subscription'**
  String get cardManageSubscription;

  /// No description provided for @cardWhatsIncluded.
  ///
  /// In en, this message translates to:
  /// **'What\'s included'**
  String get cardWhatsIncluded;

  /// No description provided for @batchChoose.
  ///
  /// In en, this message translates to:
  /// **'Choose Your Batch'**
  String get batchChoose;

  /// No description provided for @batchChooseBody.
  ///
  /// In en, this message translates to:
  /// **'Select a class group to continue with enrolment.'**
  String get batchChooseBody;

  /// No description provided for @batchSubtitleBody.
  ///
  /// In en, this message translates to:
  /// **'View the schedule and sessions for each available batch.'**
  String get batchSubtitleBody;

  /// No description provided for @batchSessions.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} session} other {{count} sessions}}'**
  String batchSessions(int count);

  /// No description provided for @batchSeats.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} seat} other {{count} seats}}'**
  String batchSeats(int count);

  /// No description provided for @batchActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get batchActive;

  /// No description provided for @batchUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get batchUpcoming;

  /// No description provided for @batchSessionNotes.
  ///
  /// In en, this message translates to:
  /// **'Session notes'**
  String get batchSessionNotes;

  /// No description provided for @detailSyllabus.
  ///
  /// In en, this message translates to:
  /// **'DETAILED SYLLABUS'**
  String get detailSyllabus;

  /// No description provided for @detailCurriculum.
  ///
  /// In en, this message translates to:
  /// **'Curriculum'**
  String get detailCurriculum;

  /// No description provided for @detailLessons.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} lesson} other {{count} lessons}}'**
  String detailLessons(int count);

  /// No description provided for @detailYourInstructor.
  ///
  /// In en, this message translates to:
  /// **'YOUR INSTRUCTOR'**
  String get detailYourInstructor;

  /// No description provided for @detailInstructorStats.
  ///
  /// In en, this message translates to:
  /// **'{courses, plural, one {{courses} course} other {{courses} courses}} · {learners, plural, one {{learners} learner} other {{learners} learners}}'**
  String detailInstructorStats(int courses, int learners);

  /// No description provided for @detailReviews.
  ///
  /// In en, this message translates to:
  /// **'Learner reviews'**
  String get detailReviews;

  /// No description provided for @detailReviewCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} review} other {{count} reviews}}'**
  String detailReviewCount(int count);

  /// No description provided for @detailEnrolledShare.
  ///
  /// In en, this message translates to:
  /// **'You\'re enrolled in this course. Share how it\'s going.'**
  String get detailEnrolledShare;

  /// No description provided for @detailRateReview.
  ///
  /// In en, this message translates to:
  /// **'Rate & review'**
  String get detailRateReview;

  /// No description provided for @detailNoReviews.
  ///
  /// In en, this message translates to:
  /// **'No reviews yet.'**
  String get detailNoReviews;

  /// No description provided for @reviewParent.
  ///
  /// In en, this message translates to:
  /// **'Parent'**
  String get reviewParent;

  /// No description provided for @reviewThanks.
  ///
  /// In en, this message translates to:
  /// **'Thanks! Your review has been submitted.'**
  String get reviewThanks;

  /// No description provided for @reviewSelectRating.
  ///
  /// In en, this message translates to:
  /// **'Please select a rating.'**
  String get reviewSelectRating;

  /// No description provided for @reviewSubmitFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not submit your review.'**
  String get reviewSubmitFailed;

  /// No description provided for @reviewTitle.
  ///
  /// In en, this message translates to:
  /// **'Rate this course'**
  String get reviewTitle;

  /// No description provided for @reviewSubmittingAs.
  ///
  /// In en, this message translates to:
  /// **'Submitting as {name}'**
  String reviewSubmittingAs(String name);

  /// No description provided for @reviewYourRating.
  ///
  /// In en, this message translates to:
  /// **'Your rating'**
  String get reviewYourRating;

  /// No description provided for @reviewStars.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} star} other {{count} stars}}'**
  String reviewStars(int count);

  /// No description provided for @reviewWrite.
  ///
  /// In en, this message translates to:
  /// **'Write a review (optional)'**
  String get reviewWrite;

  /// No description provided for @reviewHint.
  ///
  /// In en, this message translates to:
  /// **'Share your experience with this course...'**
  String get reviewHint;

  /// No description provided for @reviewSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit review'**
  String get reviewSubmit;

  /// No description provided for @cardReviewCourse.
  ///
  /// In en, this message translates to:
  /// **'Review Course'**
  String get cardReviewCourse;

  /// No description provided for @cardContinue.
  ///
  /// In en, this message translates to:
  /// **'Continue Learning'**
  String get cardContinue;

  /// No description provided for @cardStart.
  ///
  /// In en, this message translates to:
  /// **'Start Learning'**
  String get cardStart;

  /// No description provided for @cardComingSoon.
  ///
  /// In en, this message translates to:
  /// **'Lessons coming soon'**
  String get cardComingSoon;

  /// No description provided for @cardClassSchedule.
  ///
  /// In en, this message translates to:
  /// **'Class Schedule'**
  String get cardClassSchedule;

  /// No description provided for @cardChatRoom.
  ///
  /// In en, this message translates to:
  /// **'Chat Room'**
  String get cardChatRoom;

  /// No description provided for @cardYourBatch.
  ///
  /// In en, this message translates to:
  /// **'Your Batch'**
  String get cardYourBatch;

  /// No description provided for @cardDashboard.
  ///
  /// In en, this message translates to:
  /// **'Go to Dashboard'**
  String get cardDashboard;

  /// No description provided for @cardEnrolled.
  ///
  /// In en, this message translates to:
  /// **'Enrolled'**
  String get cardEnrolled;

  /// No description provided for @detailFaq.
  ///
  /// In en, this message translates to:
  /// **'Common questions'**
  String get detailFaq;

  /// No description provided for @membershipTitle.
  ///
  /// In en, this message translates to:
  /// **'One membership. Every course.'**
  String get membershipTitle;

  /// No description provided for @membershipAllCourses.
  ///
  /// In en, this message translates to:
  /// **'All courses'**
  String get membershipAllCourses;

  /// No description provided for @membershipAllCoursesBody.
  ///
  /// In en, this message translates to:
  /// **'Learn across Islamic studies, languages, sciences and more.'**
  String get membershipAllCoursesBody;

  /// No description provided for @membershipLive.
  ///
  /// In en, this message translates to:
  /// **'Live classes included'**
  String get membershipLive;

  /// No description provided for @membershipLiveBody.
  ///
  /// In en, this message translates to:
  /// **'Join interactive seminars and live Q&As.'**
  String get membershipLiveBody;

  /// No description provided for @membershipCertificates.
  ///
  /// In en, this message translates to:
  /// **'Certificates included'**
  String get membershipCertificates;

  /// No description provided for @membershipCertificatesBody.
  ///
  /// In en, this message translates to:
  /// **'Earn certificates as you complete your learning.'**
  String get membershipCertificatesBody;

  /// No description provided for @detailShare.
  ///
  /// In en, this message translates to:
  /// **'Share this course'**
  String get detailShare;

  /// No description provided for @learnSelectProfileCourses.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view courses.'**
  String get learnSelectProfileCourses;

  /// No description provided for @learnCoursesLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load your courses'**
  String get learnCoursesLoadFailed;

  /// No description provided for @learnRegularTitle.
  ///
  /// In en, this message translates to:
  /// **'Regular Courses'**
  String get learnRegularTitle;

  /// No description provided for @learnRegularCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} self-paced course} other {{count} self-paced courses}}'**
  String learnRegularCount(int count);

  /// No description provided for @learnSearch.
  ///
  /// In en, this message translates to:
  /// **'Search by course or instructor...'**
  String get learnSearch;

  /// No description provided for @learnNoRegular.
  ///
  /// In en, this message translates to:
  /// **'No regular courses yet'**
  String get learnNoRegular;

  /// No description provided for @learnNoRegularBody.
  ///
  /// In en, this message translates to:
  /// **'Browse the course catalogue to find your next lesson.'**
  String get learnNoRegularBody;

  /// No description provided for @learnBrowse.
  ///
  /// In en, this message translates to:
  /// **'Browse courses'**
  String get learnBrowse;

  /// No description provided for @learnNoMatch.
  ///
  /// In en, this message translates to:
  /// **'No matching courses'**
  String get learnNoMatch;

  /// No description provided for @learnNoMatchBody.
  ///
  /// In en, this message translates to:
  /// **'Try a different course or instructor name.'**
  String get learnNoMatchBody;

  /// No description provided for @learnLessonsProgress.
  ///
  /// In en, this message translates to:
  /// **'{done}/{total} lessons'**
  String learnLessonsProgress(int done, int total);

  /// No description provided for @learnNoLessons.
  ///
  /// In en, this message translates to:
  /// **'No lessons'**
  String get learnNoLessons;

  /// No description provided for @learnResume.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get learnResume;

  /// No description provided for @learnStart.
  ///
  /// In en, this message translates to:
  /// **'Start Learning'**
  String get learnStart;

  /// No description provided for @learnExams.
  ///
  /// In en, this message translates to:
  /// **'Exams'**
  String get learnExams;

  /// No description provided for @levelAllCaps.
  ///
  /// In en, this message translates to:
  /// **'ALL LEVELS'**
  String get levelAllCaps;

  /// No description provided for @levelBeginnerCaps.
  ///
  /// In en, this message translates to:
  /// **'BEGINNER'**
  String get levelBeginnerCaps;

  /// No description provided for @levelIntermediateCaps.
  ///
  /// In en, this message translates to:
  /// **'INTERMEDIATE'**
  String get levelIntermediateCaps;

  /// No description provided for @levelAdvancedCaps.
  ///
  /// In en, this message translates to:
  /// **'ADVANCED'**
  String get levelAdvancedCaps;

  /// No description provided for @classesSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view your live classes.'**
  String get classesSelectProfile;

  /// No description provided for @classesLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load online classes'**
  String get classesLoadFailed;

  /// No description provided for @classesTitle.
  ///
  /// In en, this message translates to:
  /// **'Online Classes'**
  String get classesTitle;

  /// No description provided for @classesCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} live course} other {{count} live courses}}'**
  String classesCount(int count);

  /// No description provided for @classesNone.
  ///
  /// In en, this message translates to:
  /// **'No live classes yet'**
  String get classesNone;

  /// No description provided for @classesNoneBody.
  ///
  /// In en, this message translates to:
  /// **'Browse the course catalogue to find a class.'**
  String get classesNoneBody;

  /// No description provided for @classesNoMatch.
  ///
  /// In en, this message translates to:
  /// **'No matching classes'**
  String get classesNoMatch;

  /// No description provided for @classesNoMatchBody.
  ///
  /// In en, this message translates to:
  /// **'Try another course or instructor name.'**
  String get classesNoMatchBody;

  /// No description provided for @classesNoUpcoming.
  ///
  /// In en, this message translates to:
  /// **'No upcoming session'**
  String get classesNoUpcoming;

  /// No description provided for @classesBatch.
  ///
  /// In en, this message translates to:
  /// **'Batch'**
  String get classesBatch;

  /// No description provided for @classesChat.
  ///
  /// In en, this message translates to:
  /// **'Chat'**
  String get classesChat;

  /// No description provided for @classesMoreActions.
  ///
  /// In en, this message translates to:
  /// **'More actions'**
  String get classesMoreActions;

  /// No description provided for @classesDetails.
  ///
  /// In en, this message translates to:
  /// **'Details'**
  String get classesDetails;

  /// No description provided for @classesSessions.
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get classesSessions;

  /// No description provided for @classesExams.
  ///
  /// In en, this message translates to:
  /// **'Exams'**
  String get classesExams;

  /// No description provided for @classesCertificate.
  ///
  /// In en, this message translates to:
  /// **'Certificate'**
  String get classesCertificate;

  /// No description provided for @classesDateTba.
  ///
  /// In en, this message translates to:
  /// **'Date to be announced'**
  String get classesDateTba;

  /// No description provided for @scheduleStatusLive.
  ///
  /// In en, this message translates to:
  /// **'Live now'**
  String get scheduleStatusLive;

  /// No description provided for @scheduleStatusSoon.
  ///
  /// In en, this message translates to:
  /// **'Starting soon'**
  String get scheduleStatusSoon;

  /// No description provided for @scheduleStatusUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get scheduleStatusUpcoming;

  /// No description provided for @scheduleStatusCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get scheduleStatusCompleted;

  /// No description provided for @scheduleSectionUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming sessions'**
  String get scheduleSectionUpcoming;

  /// No description provided for @scheduleSectionCompleted.
  ///
  /// In en, this message translates to:
  /// **'Previous sessions'**
  String get scheduleSectionCompleted;

  /// No description provided for @scheduleSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view this class schedule.'**
  String get scheduleSelectProfile;

  /// No description provided for @scheduleTitle.
  ///
  /// In en, this message translates to:
  /// **'Class schedule'**
  String get scheduleTitle;

  /// No description provided for @scheduleUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Class schedule unavailable'**
  String get scheduleUnavailable;

  /// No description provided for @scheduleUnavailableBody.
  ///
  /// In en, this message translates to:
  /// **'We could not load this batch. You may no longer be enrolled in this batch, or the batch may no longer be available.'**
  String get scheduleUnavailableBody;

  /// No description provided for @scheduleScheduled.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} session scheduled} other {{count} sessions scheduled}}'**
  String scheduleScheduled(int count);

  /// No description provided for @scheduleNone.
  ///
  /// In en, this message translates to:
  /// **'No sessions scheduled yet.'**
  String get scheduleNone;

  /// No description provided for @scheduleNoneHint.
  ///
  /// In en, this message translates to:
  /// **'Your instructor has not added any sessions to this batch.'**
  String get scheduleNoneHint;

  /// No description provided for @scheduleBack.
  ///
  /// In en, this message translates to:
  /// **'Back to Online Classes'**
  String get scheduleBack;

  /// No description provided for @scheduleEnrolledOn.
  ///
  /// In en, this message translates to:
  /// **'Enrolled {date}'**
  String scheduleEnrolledOn(String date);

  /// No description provided for @scheduleSessionNumber.
  ///
  /// In en, this message translates to:
  /// **'Session {number}'**
  String scheduleSessionNumber(int number);

  /// No description provided for @scheduleJoin.
  ///
  /// In en, this message translates to:
  /// **'Join class'**
  String get scheduleJoin;

  /// No description provided for @scheduleJoinSoon.
  ///
  /// In en, this message translates to:
  /// **'Join soon'**
  String get scheduleJoinSoon;

  /// No description provided for @scheduleNoLink.
  ///
  /// In en, this message translates to:
  /// **'No link yet'**
  String get scheduleNoLink;

  /// No description provided for @scheduleCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get scheduleCompleted;

  /// No description provided for @scheduleNotStarted.
  ///
  /// In en, this message translates to:
  /// **'Not started'**
  String get scheduleNotStarted;

  /// No description provided for @scheduleLinkFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not open the meeting link.'**
  String get scheduleLinkFailed;

  /// No description provided for @lessonReloadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not reload. Check your connection.'**
  String get lessonReloadFailed;

  /// No description provided for @lessonProgressSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Progress could not be saved. It will retry next time.'**
  String get lessonProgressSaveFailed;

  /// No description provided for @lessonNoteEmpty.
  ///
  /// In en, this message translates to:
  /// **'Note cannot be empty'**
  String get lessonNoteEmpty;

  /// No description provided for @lessonNoteSaveFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not save note. Please try again.'**
  String get lessonNoteSaveFailed;

  /// No description provided for @lessonSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to continue.'**
  String get lessonSelectProfile;

  /// No description provided for @lessonTitle.
  ///
  /// In en, this message translates to:
  /// **'Lesson'**
  String get lessonTitle;

  /// No description provided for @lessonLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load course lessons.'**
  String get lessonLoadFailed;

  /// No description provided for @lessonNotInCourse.
  ///
  /// In en, this message translates to:
  /// **'This lesson is not part of the course.'**
  String get lessonNotInCourse;

  /// No description provided for @lessonReload.
  ///
  /// In en, this message translates to:
  /// **'Reload'**
  String get lessonReload;

  /// No description provided for @lessonCourseContent.
  ///
  /// In en, this message translates to:
  /// **'Course content'**
  String get lessonCourseContent;

  /// No description provided for @lessonPrevious.
  ///
  /// In en, this message translates to:
  /// **'Previous'**
  String get lessonPrevious;

  /// No description provided for @lessonNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get lessonNext;

  /// No description provided for @lessonCourseName.
  ///
  /// In en, this message translates to:
  /// **'Course: {title}'**
  String lessonCourseName(String title);

  /// No description provided for @lessonOverview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get lessonOverview;

  /// No description provided for @lessonNotes.
  ///
  /// In en, this message translates to:
  /// **'Notes'**
  String get lessonNotes;

  /// No description provided for @lessonDefaultOverview.
  ///
  /// In en, this message translates to:
  /// **'Continue through this lesson, then use the course content button to move between topics.'**
  String get lessonDefaultOverview;

  /// No description provided for @lessonNotesHint.
  ///
  /// In en, this message translates to:
  /// **'Write your notes for this lesson...'**
  String get lessonNotesHint;

  /// No description provided for @lessonSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved'**
  String get lessonSaved;

  /// No description provided for @lessonSaveNote.
  ///
  /// In en, this message translates to:
  /// **'Save note'**
  String get lessonSaveNote;

  /// No description provided for @lessonDocUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Document unavailable'**
  String get lessonDocUnavailable;

  /// No description provided for @lessonMarkedComplete.
  ///
  /// In en, this message translates to:
  /// **'Lesson marked complete'**
  String get lessonMarkedComplete;

  /// No description provided for @lessonReadOnlyKeepReading.
  ///
  /// In en, this message translates to:
  /// **'Read-only preview • Keep reading to complete this lesson'**
  String get lessonReadOnlyKeepReading;

  /// No description provided for @lessonReadOnlyPdf.
  ///
  /// In en, this message translates to:
  /// **'Read-only PDF preview'**
  String get lessonReadOnlyPdf;

  /// No description provided for @lessonMediaUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Lesson media unavailable'**
  String get lessonMediaUnavailable;

  /// No description provided for @lessonOpenLinkTitle.
  ///
  /// In en, this message translates to:
  /// **'Open the lesson link'**
  String get lessonOpenLinkTitle;

  /// No description provided for @lessonOpenLink.
  ///
  /// In en, this message translates to:
  /// **'Open link'**
  String get lessonOpenLink;

  /// No description provided for @lessonPdfFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t load this document. Check your connection and try again.'**
  String get lessonPdfFailed;

  /// No description provided for @lessonReloadPdf.
  ///
  /// In en, this message translates to:
  /// **'Reload PDF'**
  String get lessonReloadPdf;

  /// No description provided for @videoCheckConnection.
  ///
  /// In en, this message translates to:
  /// **'Check your connection, then try again.'**
  String get videoCheckConnection;

  /// No description provided for @videoCouldNotPlay.
  ///
  /// In en, this message translates to:
  /// **'Video could not be played. {reason}'**
  String videoCouldNotPlay(String reason);

  /// No description provided for @videoInterrupted.
  ///
  /// In en, this message translates to:
  /// **'Playback was interrupted. Please try again.'**
  String get videoInterrupted;

  /// No description provided for @videoBack10.
  ///
  /// In en, this message translates to:
  /// **'Back 10 seconds'**
  String get videoBack10;

  /// No description provided for @videoForward10.
  ///
  /// In en, this message translates to:
  /// **'Forward 10 seconds'**
  String get videoForward10;

  /// No description provided for @videoSpeed.
  ///
  /// In en, this message translates to:
  /// **'Playback speed'**
  String get videoSpeed;

  /// No description provided for @videoNormal.
  ///
  /// In en, this message translates to:
  /// **'Normal'**
  String get videoNormal;

  /// No description provided for @videoFullScreen.
  ///
  /// In en, this message translates to:
  /// **'Full screen'**
  String get videoFullScreen;

  /// No description provided for @videoExitFullScreen.
  ///
  /// In en, this message translates to:
  /// **'Exit full screen'**
  String get videoExitFullScreen;

  /// No description provided for @videoPause.
  ///
  /// In en, this message translates to:
  /// **'Pause'**
  String get videoPause;

  /// No description provided for @videoPlay.
  ///
  /// In en, this message translates to:
  /// **'Play'**
  String get videoPlay;

  /// No description provided for @lessonCourseExam.
  ///
  /// In en, this message translates to:
  /// **'Course exam'**
  String get lessonCourseExam;

  /// No description provided for @lessonExamUnlocked.
  ///
  /// In en, this message translates to:
  /// **'You have completed 90% of the course — you can now sit the exam.'**
  String get lessonExamUnlocked;

  /// No description provided for @lessonExamLocked.
  ///
  /// In en, this message translates to:
  /// **'Complete 90% of the course to unlock the exam. You are at {progress}%.'**
  String lessonExamLocked(int progress);

  /// No description provided for @lessonCourseProgress.
  ///
  /// In en, this message translates to:
  /// **'Course progress'**
  String get lessonCourseProgress;

  /// No description provided for @lessonExamUnlockedShort.
  ///
  /// In en, this message translates to:
  /// **'Exam unlocked — good luck!'**
  String get lessonExamUnlockedShort;

  /// No description provided for @lessonExamUnlockHint.
  ///
  /// In en, this message translates to:
  /// **'The exam unlocks automatically once you reach 90% course completion.'**
  String get lessonExamUnlockHint;

  /// No description provided for @lessonTakeExam.
  ///
  /// In en, this message translates to:
  /// **'Take exam'**
  String get lessonTakeExam;

  /// No description provided for @lessonLocked.
  ///
  /// In en, this message translates to:
  /// **'Locked'**
  String get lessonLocked;

  /// No description provided for @lessonCertificateFailed.
  ///
  /// In en, this message translates to:
  /// **'We could not generate your certificate. Please try again.'**
  String get lessonCertificateFailed;

  /// No description provided for @lessonCourseCertificate.
  ///
  /// In en, this message translates to:
  /// **'Course certificate'**
  String get lessonCourseCertificate;

  /// No description provided for @lessonCertificateHint.
  ///
  /// In en, this message translates to:
  /// **'Generate a certificate showing your course progress and last exam score. This can only be done once.'**
  String get lessonCertificateHint;

  /// No description provided for @lessonCertificateLocked.
  ///
  /// In en, this message translates to:
  /// **'Take the exam at least once to unlock your certificate.'**
  String get lessonCertificateLocked;

  /// No description provided for @lessonGenerating.
  ///
  /// In en, this message translates to:
  /// **'Generating...'**
  String get lessonGenerating;

  /// No description provided for @lessonGenerateCertificate.
  ///
  /// In en, this message translates to:
  /// **'Generate certificate'**
  String get lessonGenerateCertificate;

  /// No description provided for @lessonPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get lessonPending;

  /// No description provided for @lessonCertificateGenerated.
  ///
  /// In en, this message translates to:
  /// **'Certificate generated'**
  String get lessonCertificateGenerated;

  /// No description provided for @lessonIssuedOn.
  ///
  /// In en, this message translates to:
  /// **'Issued on {date}'**
  String lessonIssuedOn(String date);

  /// No description provided for @lessonLastExamScore.
  ///
  /// In en, this message translates to:
  /// **'Last exam score'**
  String get lessonLastExamScore;

  /// No description provided for @lessonLatestAttempt.
  ///
  /// In en, this message translates to:
  /// **'Latest attempt: {title}'**
  String lessonLatestAttempt(String title);

  /// No description provided for @lessonAttemptNumber.
  ///
  /// In en, this message translates to:
  /// **'Attempt #{number}'**
  String lessonAttemptNumber(int number);

  /// No description provided for @lessonVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Verification code:'**
  String get lessonVerificationCode;

  /// No description provided for @lessonDownloadPdf.
  ///
  /// In en, this message translates to:
  /// **'Download PDF'**
  String get lessonDownloadPdf;

  /// No description provided for @commonCheckConnection.
  ///
  /// In en, this message translates to:
  /// **'Check your connection and try again.'**
  String get commonCheckConnection;

  /// No description provided for @commonNoCoursesYet.
  ///
  /// In en, this message translates to:
  /// **'No courses enrolled yet'**
  String get commonNoCoursesYet;

  /// No description provided for @commonOnlineClassSuffix.
  ///
  /// In en, this message translates to:
  /// **' • Online class'**
  String get commonOnlineClassSuffix;

  /// No description provided for @assignSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view assignments.'**
  String get assignSelectProfile;

  /// No description provided for @assignTitle.
  ///
  /// In en, this message translates to:
  /// **'Assignments'**
  String get assignTitle;

  /// No description provided for @assignSelectCourse.
  ///
  /// In en, this message translates to:
  /// **'Select a course to view its assignments.'**
  String get assignSelectCourse;

  /// No description provided for @assignNoCoursesBody.
  ///
  /// In en, this message translates to:
  /// **'Browse courses and enroll to see assignments here.'**
  String get assignNoCoursesBody;

  /// No description provided for @assignSubmitted.
  ///
  /// In en, this message translates to:
  /// **'Assignment submitted'**
  String get assignSubmitted;

  /// No description provided for @assignSubmitFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit assignment'**
  String get assignSubmitFailed;

  /// No description provided for @assignLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load assignments'**
  String get assignLoadFailed;

  /// No description provided for @assignBack.
  ///
  /// In en, this message translates to:
  /// **'Back to assignments'**
  String get assignBack;

  /// No description provided for @assignCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} assignment for this course} other {{count} assignments for this course}}'**
  String assignCount(int count);

  /// No description provided for @assignNone.
  ///
  /// In en, this message translates to:
  /// **'No assignments yet'**
  String get assignNone;

  /// No description provided for @assignNoneBody.
  ///
  /// In en, this message translates to:
  /// **'No assignments for this course yet.'**
  String get assignNoneBody;

  /// No description provided for @assignNoDeadline.
  ///
  /// In en, this message translates to:
  /// **'No deadline'**
  String get assignNoDeadline;

  /// No description provided for @assignDue.
  ///
  /// In en, this message translates to:
  /// **'Due: {date}'**
  String assignDue(String date);

  /// No description provided for @assignMarks.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} mark} other {{count} marks}}'**
  String assignMarks(int count);

  /// No description provided for @assignYourSubmission.
  ///
  /// In en, this message translates to:
  /// **'YOUR SUBMISSION'**
  String get assignYourSubmission;

  /// No description provided for @assignOpenFile.
  ///
  /// In en, this message translates to:
  /// **'Open attached file'**
  String get assignOpenFile;

  /// No description provided for @assignMarksAwarded.
  ///
  /// In en, this message translates to:
  /// **'Marks: {awarded}/{total}'**
  String assignMarksAwarded(String awarded, int total);

  /// No description provided for @assignFeedback.
  ///
  /// In en, this message translates to:
  /// **'Feedback: {feedback}'**
  String assignFeedback(String feedback);

  /// No description provided for @assignAnswerHint.
  ///
  /// In en, this message translates to:
  /// **'Write your answer...'**
  String get assignAnswerHint;

  /// No description provided for @assignSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get assignSubmitting;

  /// No description provided for @assignSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit assignment'**
  String get assignSubmit;

  /// No description provided for @assignFileFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not open the attached file.'**
  String get assignFileFailed;

  /// No description provided for @assignGraded.
  ///
  /// In en, this message translates to:
  /// **'GRADED'**
  String get assignGraded;

  /// No description provided for @assignSubmittedBadge.
  ///
  /// In en, this message translates to:
  /// **'SUBMITTED'**
  String get assignSubmittedBadge;

  /// No description provided for @examsSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view exams.'**
  String get examsSelectProfile;

  /// No description provided for @examsSelectProfileFirst.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile first.'**
  String get examsSelectProfileFirst;

  /// No description provided for @examsTitle.
  ///
  /// In en, this message translates to:
  /// **'Exams'**
  String get examsTitle;

  /// No description provided for @examsSelectCourse.
  ///
  /// In en, this message translates to:
  /// **'Select a course to view and take its exams.'**
  String get examsSelectCourse;

  /// No description provided for @examsNoCoursesBody.
  ///
  /// In en, this message translates to:
  /// **'Browse courses and enroll to see course exams here.'**
  String get examsNoCoursesBody;

  /// No description provided for @examsLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load exams'**
  String get examsLoadFailed;

  /// No description provided for @examsBackOnline.
  ///
  /// In en, this message translates to:
  /// **'Back to Online Classes'**
  String get examsBackOnline;

  /// No description provided for @examsBackRegular.
  ///
  /// In en, this message translates to:
  /// **'Back to Regular Courses'**
  String get examsBackRegular;

  /// No description provided for @examsAvailable.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} exam available} other {{count} exams available}}'**
  String examsAvailable(int count);

  /// No description provided for @examsNone.
  ///
  /// In en, this message translates to:
  /// **'No exams available'**
  String get examsNone;

  /// No description provided for @examsNoneBody.
  ///
  /// In en, this message translates to:
  /// **'There are no exams for this course yet.'**
  String get examsNoneBody;

  /// No description provided for @examsTypePractice.
  ///
  /// In en, this message translates to:
  /// **'PRACTICE'**
  String get examsTypePractice;

  /// No description provided for @examsTypeFinal.
  ///
  /// In en, this message translates to:
  /// **'FINAL'**
  String get examsTypeFinal;

  /// No description provided for @examsPassed.
  ///
  /// In en, this message translates to:
  /// **'PASSED'**
  String get examsPassed;

  /// No description provided for @examsInProgress.
  ///
  /// In en, this message translates to:
  /// **'IN PROGRESS'**
  String get examsInProgress;

  /// No description provided for @examsRandomQuestions.
  ///
  /// In en, this message translates to:
  /// **'Random questions'**
  String get examsRandomQuestions;

  /// No description provided for @examsQuestions.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} question} other {{count} questions}}'**
  String examsQuestions(int count);

  /// No description provided for @examsPassMark.
  ///
  /// In en, this message translates to:
  /// **'Pass: {mark}%'**
  String examsPassMark(int mark);

  /// No description provided for @examsAttempts.
  ///
  /// In en, this message translates to:
  /// **'Attempts: {value}'**
  String examsAttempts(String value);

  /// No description provided for @examsBestScore.
  ///
  /// In en, this message translates to:
  /// **'Best score: {score}/{total}'**
  String examsBestScore(String score, int total);

  /// No description provided for @examsTimeLeft.
  ///
  /// In en, this message translates to:
  /// **'Time left in your attempt'**
  String get examsTimeLeft;

  /// No description provided for @examsTimesUp.
  ///
  /// In en, this message translates to:
  /// **'Time\'s up'**
  String get examsTimesUp;

  /// No description provided for @examsTimerRunning.
  ///
  /// In en, this message translates to:
  /// **'The timer keeps running — resume to continue.'**
  String get examsTimerRunning;

  /// No description provided for @examsOpenToSubmit.
  ///
  /// In en, this message translates to:
  /// **'Open the exam to submit your saved answers.'**
  String get examsOpenToSubmit;

  /// No description provided for @examsStartsIn.
  ///
  /// In en, this message translates to:
  /// **'Starts in'**
  String get examsStartsIn;

  /// No description provided for @examsOpens.
  ///
  /// In en, this message translates to:
  /// **'Opens {date}'**
  String examsOpens(String date);

  /// No description provided for @examsWindowClosesIn.
  ///
  /// In en, this message translates to:
  /// **'Start window closes in'**
  String get examsWindowClosesIn;

  /// No description provided for @examsStartBefore.
  ///
  /// In en, this message translates to:
  /// **'Start before {date}'**
  String examsStartBefore(String date);

  /// No description provided for @examsViewResult.
  ///
  /// In en, this message translates to:
  /// **'View result'**
  String get examsViewResult;

  /// No description provided for @examsResume.
  ///
  /// In en, this message translates to:
  /// **'Resume exam'**
  String get examsResume;

  /// No description provided for @examsSubmitAnswers.
  ///
  /// In en, this message translates to:
  /// **'Submit answers'**
  String get examsSubmitAnswers;

  /// No description provided for @examsMaxAttempts.
  ///
  /// In en, this message translates to:
  /// **'Max attempts reached'**
  String get examsMaxAttempts;

  /// No description provided for @examsNotStartedYet.
  ///
  /// In en, this message translates to:
  /// **'Not started yet'**
  String get examsNotStartedYet;

  /// No description provided for @examsWindowClosed.
  ///
  /// In en, this message translates to:
  /// **'Start window closed'**
  String get examsWindowClosed;

  /// No description provided for @examsTake.
  ///
  /// In en, this message translates to:
  /// **'Take exam'**
  String get examsTake;

  /// No description provided for @examsBack.
  ///
  /// In en, this message translates to:
  /// **'Back to exams'**
  String get examsBack;

  /// No description provided for @examsCountdownDays.
  ///
  /// In en, this message translates to:
  /// **'{d}d {h}h {m}m'**
  String examsCountdownDays(int d, String h, String m);

  /// No description provided for @takeMinutesLeft.
  ///
  /// In en, this message translates to:
  /// **'{count} minutes left'**
  String takeMinutesLeft(int count);

  /// No description provided for @takeOneMinuteLeft.
  ///
  /// In en, this message translates to:
  /// **'1 minute left — your exam will be submitted automatically'**
  String get takeOneMinuteLeft;

  /// No description provided for @takeNotStartedToast.
  ///
  /// In en, this message translates to:
  /// **'This exam hasn\'t started yet'**
  String get takeNotStartedToast;

  /// No description provided for @takeWindowClosedToast.
  ///
  /// In en, this message translates to:
  /// **'The start window for this exam has closed'**
  String get takeWindowClosedToast;

  /// No description provided for @takeSubmittedToast.
  ///
  /// In en, this message translates to:
  /// **'Exam submitted'**
  String get takeSubmittedToast;

  /// No description provided for @takeSubmitError.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t submit your exam. Please try again.'**
  String get takeSubmitError;

  /// No description provided for @takeStartFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t start the exam. Please try again.'**
  String get takeStartFailed;

  /// No description provided for @takeConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Submit your exam?'**
  String get takeConfirmTitle;

  /// No description provided for @takeConfirmUnanswered.
  ///
  /// In en, this message translates to:
  /// **'You have {count, plural, one {{count} unanswered question} other {{count} unanswered questions}}. You can\'t change your answers after submitting.'**
  String takeConfirmUnanswered(int count);

  /// No description provided for @takeConfirmAll.
  ///
  /// In en, this message translates to:
  /// **'You\'ve answered every question. You can\'t change your answers after submitting.'**
  String get takeConfirmAll;

  /// No description provided for @takeAnswered.
  ///
  /// In en, this message translates to:
  /// **'Answered'**
  String get takeAnswered;

  /// No description provided for @takeUnanswered.
  ///
  /// In en, this message translates to:
  /// **'Unanswered'**
  String get takeUnanswered;

  /// No description provided for @takeNotAnswered.
  ///
  /// In en, this message translates to:
  /// **'Not answered'**
  String get takeNotAnswered;

  /// No description provided for @takeFlagged.
  ///
  /// In en, this message translates to:
  /// **'Flagged'**
  String get takeFlagged;

  /// No description provided for @takeFlag.
  ///
  /// In en, this message translates to:
  /// **'Flag'**
  String get takeFlag;

  /// No description provided for @takeKeepWorking.
  ///
  /// In en, this message translates to:
  /// **'Keep working'**
  String get takeKeepWorking;

  /// No description provided for @takeSubmitExam.
  ///
  /// In en, this message translates to:
  /// **'Submit exam'**
  String get takeSubmitExam;

  /// No description provided for @takeLeaveTitle.
  ///
  /// In en, this message translates to:
  /// **'Leave the exam?'**
  String get takeLeaveTitle;

  /// No description provided for @takeLeaveBody.
  ///
  /// In en, this message translates to:
  /// **'Your answers are saved, but the timer keeps running. You can resume from the exam list.'**
  String get takeLeaveBody;

  /// No description provided for @takeStay.
  ///
  /// In en, this message translates to:
  /// **'Stay'**
  String get takeStay;

  /// No description provided for @takeLeave.
  ///
  /// In en, this message translates to:
  /// **'Leave'**
  String get takeLeave;

  /// No description provided for @takeQuestions.
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get takeQuestions;

  /// No description provided for @takeAnsweredOf.
  ///
  /// In en, this message translates to:
  /// **'{answered} of {total} answered'**
  String takeAnsweredOf(int answered, int total);

  /// No description provided for @takeFlaggedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} flagged'**
  String takeFlaggedCount(int count);

  /// No description provided for @takeSubmittedTitle.
  ///
  /// In en, this message translates to:
  /// **'Exam submitted'**
  String get takeSubmittedTitle;

  /// No description provided for @takeTakingToResult.
  ///
  /// In en, this message translates to:
  /// **'Taking you to your result…'**
  String get takeTakingToResult;

  /// No description provided for @takeLoadFailedTitle.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load exam'**
  String get takeLoadFailedTitle;

  /// No description provided for @takeNotStartedTitle.
  ///
  /// In en, this message translates to:
  /// **'Exam not started yet'**
  String get takeNotStartedTitle;

  /// No description provided for @takeNotStartedBody.
  ///
  /// In en, this message translates to:
  /// **'This exam starts on {date}. You can start it any time after the start time until 50% of the exam duration has elapsed.'**
  String takeNotStartedBody(String date);

  /// No description provided for @takeClosedTitle.
  ///
  /// In en, this message translates to:
  /// **'Start window closed'**
  String get takeClosedTitle;

  /// No description provided for @takeClosedBody.
  ///
  /// In en, this message translates to:
  /// **'This exam could be started until {date}. The start window has now passed.'**
  String takeClosedBody(String date);

  /// No description provided for @takeNoQuestionsTitle.
  ///
  /// In en, this message translates to:
  /// **'No questions available'**
  String get takeNoQuestionsTitle;

  /// No description provided for @takeNoQuestionsBody.
  ///
  /// In en, this message translates to:
  /// **'This exam doesn\'t have any questions yet.'**
  String get takeNoQuestionsBody;

  /// No description provided for @takeAllQuestions.
  ///
  /// In en, this message translates to:
  /// **'Show all questions'**
  String get takeAllQuestions;

  /// No description provided for @takeQuestionOf.
  ///
  /// In en, this message translates to:
  /// **'Question {n} of {total}'**
  String takeQuestionOf(int n, int total);

  /// No description provided for @takeMarks.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} mark} other {{count} marks}}'**
  String takeMarks(int count);

  /// No description provided for @takeSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Submitting...'**
  String get takeSubmitting;

  /// No description provided for @takeReviewSubmit.
  ///
  /// In en, this message translates to:
  /// **'Review & submit'**
  String get takeReviewSubmit;

  /// No description provided for @takeNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get takeNext;

  /// No description provided for @takeAnswerHint.
  ///
  /// In en, this message translates to:
  /// **'Type your answer...'**
  String get takeAnswerHint;

  /// No description provided for @takeWords.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} word} other {{count} words}}'**
  String takeWords(int count);

  /// No description provided for @takeNoOptions.
  ///
  /// In en, this message translates to:
  /// **'No options available for this question.'**
  String get takeNoOptions;

  /// No description provided for @takeSelectAll.
  ///
  /// In en, this message translates to:
  /// **'Select all that apply'**
  String get takeSelectAll;

  /// No description provided for @takeTimesUp.
  ///
  /// In en, this message translates to:
  /// **'Time\'s up'**
  String get takeTimesUp;

  /// No description provided for @takeSubmittingAnswers.
  ///
  /// In en, this message translates to:
  /// **'Submitting your answers…'**
  String get takeSubmittingAnswers;

  /// No description provided for @takeSubmissionFailed.
  ///
  /// In en, this message translates to:
  /// **'Submission failed'**
  String get takeSubmissionFailed;

  /// No description provided for @takeSavedOnDevice.
  ///
  /// In en, this message translates to:
  /// **'Your answers are saved on this device. Check your connection and try again.'**
  String get takeSavedOnDevice;

  /// No description provided for @takeRetrySubmit.
  ///
  /// In en, this message translates to:
  /// **'Retry submit'**
  String get takeRetrySubmit;

  /// No description provided for @takeDiscardLeave.
  ///
  /// In en, this message translates to:
  /// **'Discard & leave'**
  String get takeDiscardLeave;

  /// No description provided for @takeTimeRemaining.
  ///
  /// In en, this message translates to:
  /// **'Time remaining {time}'**
  String takeTimeRemaining(String time);

  /// No description provided for @takeDuration.
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get takeDuration;

  /// No description provided for @takeTotalMarks.
  ///
  /// In en, this message translates to:
  /// **'Total marks'**
  String get takeTotalMarks;

  /// No description provided for @takePassMarkLabel.
  ///
  /// In en, this message translates to:
  /// **'Pass mark'**
  String get takePassMarkLabel;

  /// No description provided for @takeRule1.
  ///
  /// In en, this message translates to:
  /// **'The timer starts as soon as you press Start and runs for {minutes} minutes — it keeps running even if you leave or close the app.'**
  String takeRule1(int minutes);

  /// No description provided for @takeRule2.
  ///
  /// In en, this message translates to:
  /// **'Your answers are saved automatically on this device. If you come back, you\'ll continue where you left off.'**
  String get takeRule2;

  /// No description provided for @takeRule3.
  ///
  /// In en, this message translates to:
  /// **'Use the same device for the whole exam.'**
  String get takeRule3;

  /// No description provided for @takeRule4.
  ///
  /// In en, this message translates to:
  /// **'When the time runs out, your answers are submitted automatically.'**
  String get takeRule4;

  /// No description provided for @takeStartBeforeFull.
  ///
  /// In en, this message translates to:
  /// **'Start before {date}. Once started, you get the full duration.'**
  String takeStartBeforeFull(String date);

  /// No description provided for @takeBeforeYouBegin.
  ///
  /// In en, this message translates to:
  /// **'Before you begin'**
  String get takeBeforeYouBegin;

  /// No description provided for @takeStart.
  ///
  /// In en, this message translates to:
  /// **'Start exam'**
  String get takeStart;

  /// No description provided for @resultPassed.
  ///
  /// In en, this message translates to:
  /// **'Congratulations! You passed.'**
  String get resultPassed;

  /// No description provided for @resultGrading.
  ///
  /// In en, this message translates to:
  /// **'Your written answers are being graded.'**
  String get resultGrading;

  /// No description provided for @resultFailed.
  ///
  /// In en, this message translates to:
  /// **'You did not pass. Review your answers and try again.'**
  String get resultFailed;

  /// No description provided for @resultPassDuration.
  ///
  /// In en, this message translates to:
  /// **'Pass mark: {mark}% • Duration: {minutes} mins'**
  String resultPassDuration(int mark, int minutes);

  /// No description provided for @resultScore.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get resultScore;

  /// No description provided for @resultAttempts.
  ///
  /// In en, this message translates to:
  /// **'Attempts'**
  String get resultAttempts;

  /// No description provided for @resultTimeTaken.
  ///
  /// In en, this message translates to:
  /// **'Time taken'**
  String get resultTimeTaken;

  /// No description provided for @resultMinutesShort.
  ///
  /// In en, this message translates to:
  /// **'{count}m'**
  String resultMinutesShort(int count);

  /// No description provided for @resultHistory.
  ///
  /// In en, this message translates to:
  /// **'Attempt history'**
  String get resultHistory;

  /// No description provided for @resultShowHistory.
  ///
  /// In en, this message translates to:
  /// **'Show attempt history ({count})'**
  String resultShowHistory(int count);

  /// No description provided for @resultHideHistory.
  ///
  /// In en, this message translates to:
  /// **'Hide attempt history'**
  String get resultHideHistory;

  /// No description provided for @resultReview.
  ///
  /// In en, this message translates to:
  /// **'Question review'**
  String get resultReview;

  /// No description provided for @resultReviewHint.
  ///
  /// In en, this message translates to:
  /// **'Review your answers and the correct answers.'**
  String get resultReviewHint;

  /// No description provided for @resultNoAttempts.
  ///
  /// In en, this message translates to:
  /// **'No attempts found.'**
  String get resultNoAttempts;

  /// No description provided for @resultShowingAttempt.
  ///
  /// In en, this message translates to:
  /// **'Showing answers from attempt #{number}.'**
  String resultShowingAttempt(int number);

  /// No description provided for @resultBestScore.
  ///
  /// In en, this message translates to:
  /// **'Best score: {score}/{total} (attempt #{number})'**
  String resultBestScore(String score, int total, int number);

  /// No description provided for @resultPassedEarlier.
  ///
  /// In en, this message translates to:
  /// **'You didn\'t pass this attempt, but you already passed in attempt #{number}.'**
  String resultPassedEarlier(int number);

  /// No description provided for @resultSummaryTitle.
  ///
  /// In en, this message translates to:
  /// **'Attempt #{number} summary'**
  String resultSummaryTitle(int number);

  /// No description provided for @resultTotalQuestions.
  ///
  /// In en, this message translates to:
  /// **'Questions'**
  String get resultTotalQuestions;

  /// No description provided for @resultAnswered.
  ///
  /// In en, this message translates to:
  /// **'Answered'**
  String get resultAnswered;

  /// No description provided for @resultUnanswered.
  ///
  /// In en, this message translates to:
  /// **'Unanswered'**
  String get resultUnanswered;

  /// No description provided for @resultMarksDeducted.
  ///
  /// In en, this message translates to:
  /// **'Negative marks'**
  String get resultMarksDeducted;

  /// No description provided for @resultRetake.
  ///
  /// In en, this message translates to:
  /// **'Retake exam'**
  String get resultRetake;

  /// No description provided for @resultAwarded.
  ///
  /// In en, this message translates to:
  /// **'{awarded} of {total} awarded'**
  String resultAwarded(String awarded, int total);

  /// No description provided for @resultAwaitingGrading.
  ///
  /// In en, this message translates to:
  /// **'Awaiting grading'**
  String get resultAwaitingGrading;

  /// No description provided for @resultCorrect.
  ///
  /// In en, this message translates to:
  /// **'Correct'**
  String get resultCorrect;

  /// No description provided for @resultPartial.
  ///
  /// In en, this message translates to:
  /// **'Partially correct'**
  String get resultPartial;

  /// No description provided for @resultIncorrect.
  ///
  /// In en, this message translates to:
  /// **'Incorrect'**
  String get resultIncorrect;

  /// No description provided for @resultYourAnswer.
  ///
  /// In en, this message translates to:
  /// **'Your answer'**
  String get resultYourAnswer;

  /// No description provided for @resultSuggestedAnswer.
  ///
  /// In en, this message translates to:
  /// **'Suggested answer'**
  String get resultSuggestedAnswer;

  /// No description provided for @resultCorrectAnswer.
  ///
  /// In en, this message translates to:
  /// **'Correct answer'**
  String get resultCorrectAnswer;

  /// No description provided for @resultExplanation.
  ///
  /// In en, this message translates to:
  /// **'Explanation'**
  String get resultExplanation;

  /// No description provided for @resultAttempt.
  ///
  /// In en, this message translates to:
  /// **'Attempt #{number}'**
  String resultAttempt(int number);

  /// No description provided for @resultLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load result.'**
  String get resultLoadFailed;

  /// No description provided for @resultPending.
  ///
  /// In en, this message translates to:
  /// **'PENDING'**
  String get resultPending;

  /// No description provided for @resultPassedBadge.
  ///
  /// In en, this message translates to:
  /// **'PASSED'**
  String get resultPassedBadge;

  /// No description provided for @resultFailedBadge.
  ///
  /// In en, this message translates to:
  /// **'FAILED'**
  String get resultFailedBadge;

  /// No description provided for @certSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view certificates.'**
  String get certSelectProfile;

  /// No description provided for @certLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load your certificates.'**
  String get certLoadFailed;

  /// No description provided for @certEyebrow.
  ///
  /// In en, this message translates to:
  /// **'YOUR ACHIEVEMENTS'**
  String get certEyebrow;

  /// No description provided for @certTitle.
  ///
  /// In en, this message translates to:
  /// **'My Certificates'**
  String get certTitle;

  /// No description provided for @certSubtitle.
  ///
  /// In en, this message translates to:
  /// **'View, verify, and save certificates from your courses.'**
  String get certSubtitle;

  /// No description provided for @certSearch.
  ///
  /// In en, this message translates to:
  /// **'Search course, exam, or verification code...'**
  String get certSearch;

  /// No description provided for @certEmpty.
  ///
  /// In en, this message translates to:
  /// **'No certificates yet'**
  String get certEmpty;

  /// No description provided for @certNoMatch.
  ///
  /// In en, this message translates to:
  /// **'No certificates match your search'**
  String get certNoMatch;

  /// No description provided for @certEmptyHint.
  ///
  /// In en, this message translates to:
  /// **'Certificates you earn will appear here.'**
  String get certEmptyHint;

  /// No description provided for @certNoMatchHint.
  ///
  /// In en, this message translates to:
  /// **'Try a different search or certificate type.'**
  String get certNoMatchHint;

  /// No description provided for @certShowing.
  ///
  /// In en, this message translates to:
  /// **'Showing {shown} of {total} certificates'**
  String certShowing(int shown, int total);

  /// No description provided for @certDateUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Date unavailable'**
  String get certDateUnavailable;

  /// No description provided for @certValid.
  ///
  /// In en, this message translates to:
  /// **'Valid'**
  String get certValid;

  /// No description provided for @certIssued.
  ///
  /// In en, this message translates to:
  /// **'Issued {date}'**
  String certIssued(String date);

  /// No description provided for @certResult.
  ///
  /// In en, this message translates to:
  /// **'Result: {score} / {total}'**
  String certResult(String score, int total);

  /// No description provided for @certPassed.
  ///
  /// In en, this message translates to:
  /// **'Passed'**
  String get certPassed;

  /// No description provided for @certNotPassed.
  ///
  /// In en, this message translates to:
  /// **'Not passed'**
  String get certNotPassed;

  /// No description provided for @certHide.
  ///
  /// In en, this message translates to:
  /// **'Hide'**
  String get certHide;

  /// No description provided for @certPreview.
  ///
  /// In en, this message translates to:
  /// **'Preview'**
  String get certPreview;

  /// No description provided for @certSavePdf.
  ///
  /// In en, this message translates to:
  /// **'Save PDF'**
  String get certSavePdf;

  /// No description provided for @certAchievement.
  ///
  /// In en, this message translates to:
  /// **'CERTIFICATE OF ACHIEVEMENT'**
  String get certAchievement;

  /// No description provided for @certPresentedTo.
  ///
  /// In en, this message translates to:
  /// **'Presented to'**
  String get certPresentedTo;

  /// No description provided for @certFor.
  ///
  /// In en, this message translates to:
  /// **'For'**
  String get certFor;

  /// No description provided for @certProgress.
  ///
  /// In en, this message translates to:
  /// **'Course progress {progress}%'**
  String certProgress(int progress);

  /// No description provided for @certId.
  ///
  /// In en, this message translates to:
  /// **'Certificate ID: {id}'**
  String certId(String id);

  /// No description provided for @certCode.
  ///
  /// In en, this message translates to:
  /// **'Verification code: {code}'**
  String certCode(String code);

  /// No description provided for @certCodeCopied.
  ///
  /// In en, this message translates to:
  /// **'Verification code copied'**
  String get certCodeCopied;

  /// No description provided for @certCopyCode.
  ///
  /// In en, this message translates to:
  /// **'Copy code'**
  String get certCopyCode;

  /// No description provided for @certPdfFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not open PDF preview.'**
  String get certPdfFailed;

  /// No description provided for @certAllTypes.
  ///
  /// In en, this message translates to:
  /// **'All types'**
  String get certAllTypes;

  /// No description provided for @certTypeAttendance.
  ///
  /// In en, this message translates to:
  /// **'Attendance'**
  String get certTypeAttendance;

  /// No description provided for @certTypeCompletion.
  ///
  /// In en, this message translates to:
  /// **'Completion'**
  String get certTypeCompletion;

  /// No description provided for @certTypeCourseCompletion.
  ///
  /// In en, this message translates to:
  /// **'Course Completion'**
  String get certTypeCourseCompletion;

  /// No description provided for @certTypeExam.
  ///
  /// In en, this message translates to:
  /// **'Exam'**
  String get certTypeExam;

  /// No description provided for @wishlistRemoved.
  ///
  /// In en, this message translates to:
  /// **'Removed from wishlist'**
  String get wishlistRemoved;

  /// No description provided for @wishlistRemoveFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to remove from wishlist'**
  String get wishlistRemoveFailed;

  /// No description provided for @wishlistSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to view your wishlist.'**
  String get wishlistSelectProfile;

  /// No description provided for @wishlistLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load wishlist'**
  String get wishlistLoadFailed;

  /// No description provided for @wishlistTitle.
  ///
  /// In en, this message translates to:
  /// **'Wishlist'**
  String get wishlistTitle;

  /// No description provided for @wishlistCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, one {{count} course saved for later} other {{count} courses saved for later}}'**
  String wishlistCount(int count);

  /// No description provided for @wishlistEmpty.
  ///
  /// In en, this message translates to:
  /// **'Your wishlist is empty'**
  String get wishlistEmpty;

  /// No description provided for @wishlistEmptyBody.
  ///
  /// In en, this message translates to:
  /// **'Save courses you like and come back to them here.'**
  String get wishlistEmptyBody;

  /// No description provided for @wishlistCourse.
  ///
  /// In en, this message translates to:
  /// **'Course'**
  String get wishlistCourse;

  /// No description provided for @wishlistViewDetails.
  ///
  /// In en, this message translates to:
  /// **'View course details'**
  String get wishlistViewDetails;

  /// No description provided for @formatSelfPaced.
  ///
  /// In en, this message translates to:
  /// **'Self-paced'**
  String get formatSelfPaced;

  /// No description provided for @formatLive.
  ///
  /// In en, this message translates to:
  /// **'Live class'**
  String get formatLive;

  /// No description provided for @notifTitle.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifTitle;

  /// No description provided for @notifMarkReadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not mark as read'**
  String get notifMarkReadFailed;

  /// No description provided for @notifMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get notifMarkAllRead;

  /// No description provided for @notifUnread.
  ///
  /// In en, this message translates to:
  /// **'{count} unread'**
  String notifUnread(int count);

  /// No description provided for @notifLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load notifications.'**
  String get notifLoadFailed;

  /// No description provided for @notifTapRetry.
  ///
  /// In en, this message translates to:
  /// **'Tap to retry'**
  String get notifTapRetry;

  /// No description provided for @notifCaughtUp.
  ///
  /// In en, this message translates to:
  /// **'You\'re all caught up.'**
  String get notifCaughtUp;

  /// No description provided for @notifRemoveFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not remove notification'**
  String get notifRemoveFailed;

  /// No description provided for @notifJustNow.
  ///
  /// In en, this message translates to:
  /// **'Just now'**
  String get notifJustNow;

  /// No description provided for @notifMinutesAgo.
  ///
  /// In en, this message translates to:
  /// **'{count}m ago'**
  String notifMinutesAgo(int count);

  /// No description provided for @notifHoursAgo.
  ///
  /// In en, this message translates to:
  /// **'{count}h ago'**
  String notifHoursAgo(int count);

  /// No description provided for @notifDaysAgo.
  ///
  /// In en, this message translates to:
  /// **'{count}d ago'**
  String notifDaysAgo(int count);

  /// No description provided for @notifView.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get notifView;

  /// No description provided for @notifBellUnread.
  ///
  /// In en, this message translates to:
  /// **'Notifications, {count} unread'**
  String notifBellUnread(int count);

  /// No description provided for @chatNoCourse.
  ///
  /// In en, this message translates to:
  /// **'Course not specified.'**
  String get chatNoCourse;

  /// No description provided for @chatSelectProfile.
  ///
  /// In en, this message translates to:
  /// **'Select a learner profile to join this class chat.'**
  String get chatSelectProfile;

  /// No description provided for @chatConnectFailed.
  ///
  /// In en, this message translates to:
  /// **'Unable to connect to class chat. Please try again.'**
  String get chatConnectFailed;

  /// No description provided for @chatTooLong.
  ///
  /// In en, this message translates to:
  /// **'Messages can be up to 2,000 characters.'**
  String get chatTooLong;

  /// No description provided for @chatReportTitle.
  ///
  /// In en, this message translates to:
  /// **'Report message'**
  String get chatReportTitle;

  /// No description provided for @chatReportWhy.
  ///
  /// In en, this message translates to:
  /// **'Why should this message be reviewed?'**
  String get chatReportWhy;

  /// No description provided for @chatReportHint.
  ///
  /// In en, this message translates to:
  /// **'Explain the issue...'**
  String get chatReportHint;

  /// No description provided for @chatSubmitReport.
  ///
  /// In en, this message translates to:
  /// **'Submit report'**
  String get chatSubmitReport;

  /// No description provided for @chatReported.
  ///
  /// In en, this message translates to:
  /// **'Message reported for review.'**
  String get chatReported;

  /// No description provided for @chatReportFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not report the message. Please try again.'**
  String get chatReportFailed;

  /// No description provided for @chatClassChat.
  ///
  /// In en, this message translates to:
  /// **'{batch} • Class chat'**
  String chatClassChat(String batch);

  /// No description provided for @chatDismiss.
  ///
  /// In en, this message translates to:
  /// **'Dismiss'**
  String get chatDismiss;

  /// No description provided for @chatRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get chatRetry;

  /// No description provided for @chatPlaceholder.
  ///
  /// In en, this message translates to:
  /// **'Type a message...'**
  String get chatPlaceholder;

  /// No description provided for @chatConnecting.
  ///
  /// In en, this message translates to:
  /// **'Connecting...'**
  String get chatConnecting;

  /// No description provided for @chatSend.
  ///
  /// In en, this message translates to:
  /// **'Send message'**
  String get chatSend;

  /// No description provided for @chatLive.
  ///
  /// In en, this message translates to:
  /// **'Live'**
  String get chatLive;

  /// No description provided for @chatOffline.
  ///
  /// In en, this message translates to:
  /// **'Offline'**
  String get chatOffline;

  /// No description provided for @chatNextClass.
  ///
  /// In en, this message translates to:
  /// **'Next Live Class'**
  String get chatNextClass;

  /// No description provided for @chatJoinClass.
  ///
  /// In en, this message translates to:
  /// **'Join class'**
  String get chatJoinClass;

  /// No description provided for @chatEmpty.
  ///
  /// In en, this message translates to:
  /// **'No messages yet. Say hello to your classmates!'**
  String get chatEmpty;

  /// No description provided for @chatInstructor.
  ///
  /// In en, this message translates to:
  /// **'INSTRUCTOR'**
  String get chatInstructor;

  /// No description provided for @chatMessageActions.
  ///
  /// In en, this message translates to:
  /// **'Message actions'**
  String get chatMessageActions;

  /// No description provided for @chatTimeTba.
  ///
  /// In en, this message translates to:
  /// **'Time to be announced'**
  String get chatTimeTba;

  /// No description provided for @chatDateAt.
  ///
  /// In en, this message translates to:
  /// **'{date} at {time}'**
  String chatDateAt(String date, String time);

  /// No description provided for @familyTitle.
  ///
  /// In en, this message translates to:
  /// **'Your learners\' profiles'**
  String get familyTitle;

  /// No description provided for @familyAddProfile.
  ///
  /// In en, this message translates to:
  /// **'Add profile'**
  String get familyAddProfile;

  /// No description provided for @familyEmpty.
  ///
  /// In en, this message translates to:
  /// **'No learner profiles yet. Add a profile to get started.'**
  String get familyEmpty;

  /// No description provided for @familySubscribed.
  ///
  /// In en, this message translates to:
  /// **'Subscribed'**
  String get familySubscribed;

  /// No description provided for @familySubscription.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get familySubscription;

  /// No description provided for @familySubscribe.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get familySubscribe;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @pinReset.
  ///
  /// In en, this message translates to:
  /// **'Reset PIN'**
  String get pinReset;

  /// No description provided for @pinSet.
  ///
  /// In en, this message translates to:
  /// **'Set PIN'**
  String get pinSet;

  /// No description provided for @imageInvalidType.
  ///
  /// In en, this message translates to:
  /// **'Choose a JPEG, PNG, WebP, or GIF image.'**
  String get imageInvalidType;

  /// No description provided for @imageTooLarge.
  ///
  /// In en, this message translates to:
  /// **'Image must be 5 MB or smaller'**
  String get imageTooLarge;

  /// No description provided for @imagePickerFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not open your photo library.'**
  String get imagePickerFailed;

  /// No description provided for @learnerChooseDob.
  ///
  /// In en, this message translates to:
  /// **'Choose a date of birth.'**
  String get learnerChooseDob;

  /// No description provided for @learnerPhotoUploadFailed.
  ///
  /// In en, this message translates to:
  /// **'Learner created, but the photo could not be uploaded. You can add it from profile management.'**
  String get learnerPhotoUploadFailed;

  /// No description provided for @learnerCreateFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to create profile'**
  String get learnerCreateFailed;

  /// No description provided for @learnerAddTitle.
  ///
  /// In en, this message translates to:
  /// **'Add a learner'**
  String get learnerAddTitle;

  /// No description provided for @learnerAddPhoto.
  ///
  /// In en, this message translates to:
  /// **'Add profile picture'**
  String get learnerAddPhoto;

  /// No description provided for @learnerChangePhoto.
  ///
  /// In en, this message translates to:
  /// **'Change profile picture'**
  String get learnerChangePhoto;

  /// No description provided for @learnerRemovePhoto.
  ///
  /// In en, this message translates to:
  /// **'Remove photo'**
  String get learnerRemovePhoto;

  /// No description provided for @learnerAddPhotoOptional.
  ///
  /// In en, this message translates to:
  /// **'Add a profile photo (optional)'**
  String get learnerAddPhotoOptional;

  /// No description provided for @learnerName.
  ///
  /// In en, this message translates to:
  /// **'Learner\'s name'**
  String get learnerName;

  /// No description provided for @learnerNameRequired.
  ///
  /// In en, this message translates to:
  /// **'Name is required'**
  String get learnerNameRequired;

  /// No description provided for @learnerNameTooLong.
  ///
  /// In en, this message translates to:
  /// **'Enter a name up to 100 characters.'**
  String get learnerNameTooLong;

  /// No description provided for @learnerDob.
  ///
  /// In en, this message translates to:
  /// **'Date of birth'**
  String get learnerDob;

  /// No description provided for @learnerPinOptional.
  ///
  /// In en, this message translates to:
  /// **'4-digit PIN (optional)'**
  String get learnerPinOptional;

  /// No description provided for @learnerPinFormat.
  ///
  /// In en, this message translates to:
  /// **'PIN must be exactly 4 digits'**
  String get learnerPinFormat;

  /// No description provided for @learnerPinMismatch.
  ///
  /// In en, this message translates to:
  /// **'PINs do not match'**
  String get learnerPinMismatch;

  /// No description provided for @learnerCreate.
  ///
  /// In en, this message translates to:
  /// **'Add learner'**
  String get learnerCreate;

  /// No description provided for @learnerLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Could not load learner profile.'**
  String get learnerLoadFailed;

  /// No description provided for @learnerUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to update profile'**
  String get learnerUpdateFailed;

  /// No description provided for @learnerNotFound.
  ///
  /// In en, this message translates to:
  /// **'Profile not found'**
  String get learnerNotFound;

  /// No description provided for @learnerEditTitle.
  ///
  /// In en, this message translates to:
  /// **'Edit {name}\'s profile'**
  String learnerEditTitle(String name);

  /// No description provided for @learnerNameLocked.
  ///
  /// In en, this message translates to:
  /// **'Name is locked because a certificate has been issued.'**
  String get learnerNameLocked;

  /// No description provided for @learnerCancelPinChange.
  ///
  /// In en, this message translates to:
  /// **'Cancel PIN change'**
  String get learnerCancelPinChange;

  /// No description provided for @learnerNewPin.
  ///
  /// In en, this message translates to:
  /// **'New 4-digit PIN'**
  String get learnerNewPin;

  /// No description provided for @learnerConfirmNewPin.
  ///
  /// In en, this message translates to:
  /// **'Confirm new PIN'**
  String get learnerConfirmNewPin;

  /// No description provided for @commonSaving.
  ///
  /// In en, this message translates to:
  /// **'Saving...'**
  String get commonSaving;

  /// No description provided for @learnerSaveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get learnerSaveChanges;

  /// No description provided for @deleteFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete profile'**
  String get deleteFailed;

  /// No description provided for @deleteTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete {name}\'s profile?'**
  String deleteTitle(String name);

  /// No description provided for @deleteDestroyed.
  ///
  /// In en, this message translates to:
  /// **'This will be destroyed:'**
  String get deleteDestroyed;

  /// No description provided for @deleteDestroyedItems.
  ///
  /// In en, this message translates to:
  /// **'Progress, enrolments, exam results, and chat messages.'**
  String get deleteDestroyedItems;

  /// No description provided for @deleteSurvives.
  ///
  /// In en, this message translates to:
  /// **'This will be kept:'**
  String get deleteSurvives;

  /// No description provided for @deleteSurvivesItems.
  ///
  /// In en, this message translates to:
  /// **'Certificates and moderation records.'**
  String get deleteSurvivesItems;

  /// No description provided for @deleteTypeName.
  ///
  /// In en, this message translates to:
  /// **'Type {name} to confirm'**
  String deleteTypeName(String name);

  /// No description provided for @deleteDeleting.
  ///
  /// In en, this message translates to:
  /// **'Deleting…'**
  String get deleteDeleting;

  /// No description provided for @deleteConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete profile'**
  String get deleteConfirm;

  /// No description provided for @deleteGoBack.
  ///
  /// In en, this message translates to:
  /// **'No, go back'**
  String get deleteGoBack;

  /// No description provided for @avatarLabel.
  ///
  /// In en, this message translates to:
  /// **'Learner avatar'**
  String get avatarLabel;

  /// No description provided for @secServerUnreachable.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t reach the server. Check your internet connection and try again.'**
  String get secServerUnreachable;

  /// No description provided for @secTooManyAttempts.
  ///
  /// In en, this message translates to:
  /// **'Too many attempts. Please wait a moment and try again.'**
  String get secTooManyAttempts;

  /// No description provided for @secTitle.
  ///
  /// In en, this message translates to:
  /// **'Login & security'**
  String get secTitle;

  /// No description provided for @secEmailRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your new email address.'**
  String get secEmailRequired;

  /// No description provided for @secEmailInvalid.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email address, like name@example.com.'**
  String get secEmailInvalid;

  /// No description provided for @secEmailSame.
  ///
  /// In en, this message translates to:
  /// **'This is already your email address.'**
  String get secEmailSame;

  /// No description provided for @secConfirmWithPassword.
  ///
  /// In en, this message translates to:
  /// **'Enter your current password to confirm.'**
  String get secConfirmWithPassword;

  /// No description provided for @secEmailUpdated.
  ///
  /// In en, this message translates to:
  /// **'Email updated. Check your new inbox for a verification link.'**
  String get secEmailUpdated;

  /// No description provided for @secEmailUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t update your email. Please try again.'**
  String get secEmailUpdateFailed;

  /// No description provided for @secEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get secEmail;

  /// No description provided for @secEmailLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Couldn\'t load your email.'**
  String get secEmailLoadFailed;

  /// No description provided for @secRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get secRetry;

  /// No description provided for @secLoadingEmail.
  ///
  /// In en, this message translates to:
  /// **'Loading account email…'**
  String get secLoadingEmail;

  /// No description provided for @secUnverified.
  ///
  /// In en, this message translates to:
  /// **'Unverified — check your email for a verification link'**
  String get secUnverified;

  /// No description provided for @secVerified.
  ///
  /// In en, this message translates to:
  /// **'Verified ✓'**
  String get secVerified;

  /// No description provided for @secChangeEmail.
  ///
  /// In en, this message translates to:
  /// **'Change email'**
  String get secChangeEmail;

  /// No description provided for @secNewEmail.
  ///
  /// In en, this message translates to:
  /// **'New email'**
  String get secNewEmail;

  /// No description provided for @secCurrentPassword.
  ///
  /// In en, this message translates to:
  /// **'Current password'**
  String get secCurrentPassword;

  /// No description provided for @secPasswordConfirmHint.
  ///
  /// In en, this message translates to:
  /// **'We ask for your password to confirm it\'s you.'**
  String get secPasswordConfirmHint;

  /// No description provided for @secSaveEmail.
  ///
  /// In en, this message translates to:
  /// **'Save email'**
  String get secSaveEmail;

  /// No description provided for @secEmailChangeNote.
  ///
  /// In en, this message translates to:
  /// **'You\'ll need to verify your new email before it takes effect. Your account stays fully active in the meantime.'**
  String get secEmailChangeNote;

  /// No description provided for @secCurrentRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter your current password.'**
  String get secCurrentRequired;

  /// No description provided for @secNewRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter a new password.'**
  String get secNewRequired;

  /// No description provided for @secTooShort.
  ///
  /// In en, this message translates to:
  /// **'Use at least {min} characters ({remaining} more).'**
  String secTooShort(String min, int remaining);

  /// No description provided for @secTooLong.
  ///
  /// In en, this message translates to:
  /// **'Use {max} characters or fewer.'**
  String secTooLong(String max);

  /// No description provided for @secSameAsCurrent.
  ///
  /// In en, this message translates to:
  /// **'Choose a password different from your current one.'**
  String get secSameAsCurrent;

  /// No description provided for @secConfirmRequired.
  ///
  /// In en, this message translates to:
  /// **'Re-enter your new password.'**
  String get secConfirmRequired;

  /// No description provided for @secMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords don\'t match.'**
  String get secMismatch;

  /// No description provided for @secPasswordUpdated.
  ///
  /// In en, this message translates to:
  /// **'Password updated. Use your new password the next time you log in.'**
  String get secPasswordUpdated;

  /// No description provided for @secPasswordUpdateFailed.
  ///
  /// In en, this message translates to:
  /// **'We couldn\'t update your password. Please try again.'**
  String get secPasswordUpdateFailed;

  /// No description provided for @secPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get secPassword;

  /// No description provided for @secChangePassword.
  ///
  /// In en, this message translates to:
  /// **'Change password'**
  String get secChangePassword;

  /// No description provided for @secNewPassword.
  ///
  /// In en, this message translates to:
  /// **'New password'**
  String get secNewPassword;

  /// No description provided for @secReqLength.
  ///
  /// In en, this message translates to:
  /// **'At least {min} characters'**
  String secReqLength(String min);

  /// No description provided for @secReqDifferent.
  ///
  /// In en, this message translates to:
  /// **'Different from your current password'**
  String get secReqDifferent;

  /// No description provided for @secConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm new password'**
  String get secConfirmPassword;

  /// No description provided for @secPasswordsMatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords match'**
  String get secPasswordsMatch;

  /// No description provided for @secPasswordsDontMatchYet.
  ///
  /// In en, this message translates to:
  /// **'Passwords don\'t match yet'**
  String get secPasswordsDontMatchYet;

  /// No description provided for @secSavePassword.
  ///
  /// In en, this message translates to:
  /// **'Save password'**
  String get secSavePassword;

  /// No description provided for @commonOptional.
  ///
  /// In en, this message translates to:
  /// **'optional'**
  String get commonOptional;

  /// No description provided for @commonCopied.
  ///
  /// In en, this message translates to:
  /// **'Copied'**
  String get commonCopied;

  /// No description provided for @commonAge.
  ///
  /// In en, this message translates to:
  /// **'Age {age}'**
  String commonAge(String age);

  /// No description provided for @commonImageUploadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to upload the image'**
  String get commonImageUploadFailed;

  /// No description provided for @commonRemoveImage.
  ///
  /// In en, this message translates to:
  /// **'Remove image'**
  String get commonRemoveImage;

  /// No description provided for @commonAddImage.
  ///
  /// In en, this message translates to:
  /// **'Add image'**
  String get commonAddImage;

  /// No description provided for @commonUploading.
  ///
  /// In en, this message translates to:
  /// **'Uploading...'**
  String get commonUploading;

  /// No description provided for @commonSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get commonSubmit;

  /// No description provided for @subTitle.
  ///
  /// In en, this message translates to:
  /// **'Subscription'**
  String get subTitle;

  /// No description provided for @subIntro.
  ///
  /// In en, this message translates to:
  /// **'Each learner profile needs its own subscription to enrol in courses. A subscription lasts one month from approval.'**
  String get subIntro;

  /// No description provided for @subLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load your subscription'**
  String get subLoadFailed;

  /// No description provided for @subHowToPay.
  ///
  /// In en, this message translates to:
  /// **'How to pay'**
  String get subHowToPay;

  /// No description provided for @subHowToPayBody.
  ///
  /// In en, this message translates to:
  /// **'Send the payment to one of these accounts, then apply for each profile with your transaction details.'**
  String get subHowToPayBody;

  /// No description provided for @subPerProfileMonth.
  ///
  /// In en, this message translates to:
  /// **'per profile · one month'**
  String get subPerProfileMonth;

  /// No description provided for @subNoPaymentDetails.
  ///
  /// In en, this message translates to:
  /// **'Payment details haven\'t been added yet. Please contact support.'**
  String get subNoPaymentDetails;

  /// No description provided for @subCopyAccountNumber.
  ///
  /// In en, this message translates to:
  /// **'Copy account number'**
  String get subCopyAccountNumber;

  /// No description provided for @subTypeBank.
  ///
  /// In en, this message translates to:
  /// **'Bank transfer'**
  String get subTypeBank;

  /// No description provided for @subTypeMobile.
  ///
  /// In en, this message translates to:
  /// **'Mobile banking'**
  String get subTypeMobile;

  /// No description provided for @subTypeOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get subTypeOther;

  /// No description provided for @subBadgeSubscribed.
  ///
  /// In en, this message translates to:
  /// **'SUBSCRIBED'**
  String get subBadgeSubscribed;

  /// No description provided for @subBadgeUnderReview.
  ///
  /// In en, this message translates to:
  /// **'UNDER REVIEW'**
  String get subBadgeUnderReview;

  /// No description provided for @subBadgeNotSubscribed.
  ///
  /// In en, this message translates to:
  /// **'NOT SUBSCRIBED'**
  String get subBadgeNotSubscribed;

  /// No description provided for @subSubscribedUntil.
  ///
  /// In en, this message translates to:
  /// **'Subscribed until {date}'**
  String subSubscribedUntil(String date);

  /// No description provided for @subRenewalUnderReview.
  ///
  /// In en, this message translates to:
  /// **'Renewal payment under review'**
  String get subRenewalUnderReview;

  /// No description provided for @subPaymentUnderReview.
  ///
  /// In en, this message translates to:
  /// **'Payment under review — usually within a day'**
  String get subPaymentUnderReview;

  /// No description provided for @subSubscribeToEnrol.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to enrol in courses'**
  String get subSubscribeToEnrol;

  /// No description provided for @subLastRejected.
  ///
  /// In en, this message translates to:
  /// **'Last payment wasn\'t approved.'**
  String get subLastRejected;

  /// No description provided for @subLastRejectedReason.
  ///
  /// In en, this message translates to:
  /// **'Last payment wasn\'t approved: {reason}'**
  String subLastRejectedReason(String reason);

  /// No description provided for @subWaiverReady.
  ///
  /// In en, this message translates to:
  /// **'{percent}% fee waiver ready'**
  String subWaiverReady(int percent);

  /// No description provided for @subWaiverReadyUseBy.
  ///
  /// In en, this message translates to:
  /// **'{percent}% fee waiver ready — use by {date}'**
  String subWaiverReadyUseBy(int percent, String date);

  /// No description provided for @subWaiverUnderReview.
  ///
  /// In en, this message translates to:
  /// **'Fee waiver request under review'**
  String get subWaiverUnderReview;

  /// No description provided for @subWaiverRejected.
  ///
  /// In en, this message translates to:
  /// **'Waiver not approved: {reason}.'**
  String subWaiverRejected(String reason);

  /// No description provided for @subRequestWaiver.
  ///
  /// In en, this message translates to:
  /// **'Need help with the fee? Request a waiver'**
  String get subRequestWaiver;

  /// No description provided for @subWaiverLimit.
  ///
  /// In en, this message translates to:
  /// **'Waiver limit reached for this year'**
  String get subWaiverLimit;

  /// No description provided for @subWaiverLimitNext.
  ///
  /// In en, this message translates to:
  /// **'Waiver limit reached for this year (next on {date})'**
  String subWaiverLimitNext(String date);

  /// No description provided for @subCancelRequest.
  ///
  /// In en, this message translates to:
  /// **'Cancel request'**
  String get subCancelRequest;

  /// No description provided for @subRenew.
  ///
  /// In en, this message translates to:
  /// **'Renew'**
  String get subRenew;

  /// No description provided for @subApply.
  ///
  /// In en, this message translates to:
  /// **'Apply for subscription'**
  String get subApply;

  /// No description provided for @subLearnerProfiles.
  ///
  /// In en, this message translates to:
  /// **'Learner profiles'**
  String get subLearnerProfiles;

  /// No description provided for @subSubscribedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} of {total} subscribed'**
  String subSubscribedCount(int count, int total);

  /// No description provided for @subUnderReviewCount.
  ///
  /// In en, this message translates to:
  /// **'{count} under review'**
  String subUnderReviewCount(int count);

  /// No description provided for @subAddProfileToSubscribe.
  ///
  /// In en, this message translates to:
  /// **'Add a learner profile to subscribe.'**
  String get subAddProfileToSubscribe;

  /// No description provided for @subCancelTitle.
  ///
  /// In en, this message translates to:
  /// **'Cancel this request?'**
  String get subCancelTitle;

  /// No description provided for @subCancelBody.
  ///
  /// In en, this message translates to:
  /// **'The payment for {name} won\'t be reviewed. You can submit it again later.'**
  String subCancelBody(String name);

  /// No description provided for @subKeepIt.
  ///
  /// In en, this message translates to:
  /// **'Keep it'**
  String get subKeepIt;

  /// No description provided for @subCancelled.
  ///
  /// In en, this message translates to:
  /// **'Request cancelled'**
  String get subCancelled;

  /// No description provided for @subCancelFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to cancel the request'**
  String get subCancelFailed;

  /// No description provided for @subPaymentHistory.
  ///
  /// In en, this message translates to:
  /// **'Payment history'**
  String get subPaymentHistory;

  /// No description provided for @subFeeWaivers.
  ///
  /// In en, this message translates to:
  /// **'Fee waivers'**
  String get subFeeWaivers;

  /// No description provided for @subWaiverPercent.
  ///
  /// In en, this message translates to:
  /// **'{percent}% waiver'**
  String subWaiverPercent(int percent);

  /// No description provided for @subSubmittedOn.
  ///
  /// In en, this message translates to:
  /// **'Submitted {date}'**
  String subSubmittedOn(String date);

  /// No description provided for @subUntil.
  ///
  /// In en, this message translates to:
  /// **'Until {date}'**
  String subUntil(String date);

  /// No description provided for @subReqUnderReview.
  ///
  /// In en, this message translates to:
  /// **'Under review'**
  String get subReqUnderReview;

  /// No description provided for @subReqApproved.
  ///
  /// In en, this message translates to:
  /// **'Approved'**
  String get subReqApproved;

  /// No description provided for @subReqRejected.
  ///
  /// In en, this message translates to:
  /// **'Rejected'**
  String get subReqRejected;

  /// No description provided for @subReqCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get subReqCancelled;

  /// No description provided for @subWaiverOff.
  ///
  /// In en, this message translates to:
  /// **'{percent}% off one month'**
  String subWaiverOff(int percent);

  /// No description provided for @subRequestedOn.
  ///
  /// In en, this message translates to:
  /// **'Requested {date}'**
  String subRequestedOn(String date);

  /// No description provided for @subUseBy.
  ///
  /// In en, this message translates to:
  /// **'Use by {date}'**
  String subUseBy(String date);

  /// No description provided for @subUsedOn.
  ///
  /// In en, this message translates to:
  /// **'Used {date}'**
  String subUsedOn(String date);

  /// No description provided for @subWaiverReadyToUse.
  ///
  /// In en, this message translates to:
  /// **'Ready to use'**
  String get subWaiverReadyToUse;

  /// No description provided for @subWaiverUsed.
  ///
  /// In en, this message translates to:
  /// **'Used'**
  String get subWaiverUsed;

  /// No description provided for @subWaiverNotApproved.
  ///
  /// In en, this message translates to:
  /// **'Not approved'**
  String get subWaiverNotApproved;

  /// No description provided for @subWaiverExpired.
  ///
  /// In en, this message translates to:
  /// **'Expired'**
  String get subWaiverExpired;

  /// No description provided for @subWaiverWithdrawn.
  ///
  /// In en, this message translates to:
  /// **'Withdrawn'**
  String get subWaiverWithdrawn;

  /// No description provided for @subSubmittedPayment.
  ///
  /// In en, this message translates to:
  /// **'Payment submitted. We\'ll subscribe {name} once it\'s verified.'**
  String subSubmittedPayment(String name);

  /// No description provided for @subWaiverSent.
  ///
  /// In en, this message translates to:
  /// **'Waiver request sent. We\'ll email you once it\'s reviewed.'**
  String get subWaiverSent;

  /// No description provided for @applyRenewTitle.
  ///
  /// In en, this message translates to:
  /// **'Renew {name}\'s subscription'**
  String applyRenewTitle(String name);

  /// No description provided for @applyApplyTitle.
  ///
  /// In en, this message translates to:
  /// **'Apply for {name}\'s subscription'**
  String applyApplyTitle(String name);

  /// No description provided for @applyFullyWaivedBody.
  ///
  /// In en, this message translates to:
  /// **'{name}\'s fee waiver covers the whole month, so no payment is needed. An admin will approve it and subscribe {name} for one month.'**
  String applyFullyWaivedBody(String name);

  /// No description provided for @applyPaymentBody.
  ///
  /// In en, this message translates to:
  /// **'Enter the details of your {amount} payment. An admin will check it and subscribe {name} for one month.'**
  String applyPaymentBody(String amount, String name);

  /// No description provided for @applyWaiverApplied.
  ///
  /// In en, this message translates to:
  /// **'{percent}% fee waiver applied'**
  String applyWaiverApplied(int percent);

  /// No description provided for @applyNothingToPay.
  ///
  /// In en, this message translates to:
  /// **'Nothing to pay this month.'**
  String get applyNothingToPay;

  /// No description provided for @applyWaiverUsedNote.
  ///
  /// In en, this message translates to:
  /// **'The waiver is used once this subscription is approved.'**
  String get applyWaiverUsedNote;

  /// No description provided for @applyPaidTo.
  ///
  /// In en, this message translates to:
  /// **'Paid to'**
  String get applyPaidTo;

  /// No description provided for @applyAmount.
  ///
  /// In en, this message translates to:
  /// **'Amount ({currency})'**
  String applyAmount(String currency);

  /// No description provided for @applyAmountRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter the amount paid'**
  String get applyAmountRequired;

  /// No description provided for @applyPaymentDate.
  ///
  /// In en, this message translates to:
  /// **'Payment date'**
  String get applyPaymentDate;

  /// No description provided for @applyTransactionId.
  ///
  /// In en, this message translates to:
  /// **'Transaction ID / reference'**
  String get applyTransactionId;

  /// No description provided for @applyTransactionIdHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. 9KD7X2LQ1P'**
  String get applyTransactionIdHint;

  /// No description provided for @applyTransactionIdRequired.
  ///
  /// In en, this message translates to:
  /// **'Enter the transaction ID'**
  String get applyTransactionIdRequired;

  /// No description provided for @applyPaidFrom.
  ///
  /// In en, this message translates to:
  /// **'Paid from'**
  String get applyPaidFrom;

  /// No description provided for @applyPaidFromHint.
  ///
  /// In en, this message translates to:
  /// **'Your account or mobile number'**
  String get applyPaidFromHint;

  /// No description provided for @applyNote.
  ///
  /// In en, this message translates to:
  /// **'Note'**
  String get applyNote;

  /// No description provided for @applyProof.
  ///
  /// In en, this message translates to:
  /// **'Payment screenshot / receipt'**
  String get applyProof;

  /// No description provided for @applySubmitPayment.
  ///
  /// In en, this message translates to:
  /// **'Submit payment'**
  String get applySubmitPayment;

  /// No description provided for @applySubmitFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit your payment'**
  String get applySubmitFailed;

  /// No description provided for @waiverTitle.
  ///
  /// In en, this message translates to:
  /// **'Request a fee waiver for {name}'**
  String waiverTitle(String name);

  /// No description provided for @waiverBody.
  ///
  /// In en, this message translates to:
  /// **'If paying the full fee is difficult, tell us about your situation. If approved, you\'ll get 25–100% off {name}\'s next one-month subscription, to use within 30 days.'**
  String waiverBody(String name);

  /// No description provided for @waiverSituation.
  ///
  /// In en, this message translates to:
  /// **'Your situation'**
  String get waiverSituation;

  /// No description provided for @waiverSituationHint.
  ///
  /// In en, this message translates to:
  /// **'e.g. family income, number of children studying, recent changes in circumstances…'**
  String get waiverSituationHint;

  /// No description provided for @waiverMinChars.
  ///
  /// In en, this message translates to:
  /// **'Please write at least {min} characters'**
  String waiverMinChars(String min);

  /// No description provided for @waiverDocuments.
  ///
  /// In en, this message translates to:
  /// **'Supporting documents (optional, up to {max} images)'**
  String waiverDocuments(String max);

  /// No description provided for @waiverRemaining.
  ///
  /// In en, this message translates to:
  /// **'You can request {count, plural, one {{count} more time} other {{count} more times}} for {name} in the next 12 months.'**
  String waiverRemaining(int count, String name);

  /// No description provided for @waiverSend.
  ///
  /// In en, this message translates to:
  /// **'Send request'**
  String get waiverSend;

  /// No description provided for @waiverFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to submit the waiver request'**
  String get waiverFailed;

  /// No description provided for @dashChooseProfile.
  ///
  /// In en, this message translates to:
  /// **'Choose a learner profile to view this dashboard.'**
  String get dashChooseProfile;

  /// No description provided for @dashChooseProfileButton.
  ///
  /// In en, this message translates to:
  /// **'Choose profile'**
  String get dashChooseProfileButton;

  /// No description provided for @dashLoadFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to load dashboard'**
  String get dashLoadFailed;

  /// No description provided for @dashGreetingMorning.
  ///
  /// In en, this message translates to:
  /// **'Good morning, {name}'**
  String dashGreetingMorning(String name);

  /// No description provided for @dashGreetingAfternoon.
  ///
  /// In en, this message translates to:
  /// **'Good afternoon, {name}'**
  String dashGreetingAfternoon(String name);

  /// No description provided for @dashGreetingEvening.
  ///
  /// In en, this message translates to:
  /// **'Good evening, {name}'**
  String dashGreetingEvening(String name);

  /// No description provided for @dashFindFirstCourse.
  ///
  /// In en, this message translates to:
  /// **'Find your first course to start learning.'**
  String get dashFindFirstCourse;

  /// No description provided for @dashNiceWork.
  ///
  /// In en, this message translates to:
  /// **'Nice work today — keep the momentum going.'**
  String get dashNiceWork;

  /// No description provided for @dashPickUp.
  ///
  /// In en, this message translates to:
  /// **'Pick up where you left off.'**
  String get dashPickUp;

  /// No description provided for @dashClassLiveNow.
  ///
  /// In en, this message translates to:
  /// **'Your class is live now'**
  String get dashClassLiveNow;

  /// No description provided for @dashClassStartsAt.
  ///
  /// In en, this message translates to:
  /// **'Your class starts at {time}'**
  String dashClassStartsAt(String time);

  /// No description provided for @dashJoin.
  ///
  /// In en, this message translates to:
  /// **'Join'**
  String get dashJoin;

  /// No description provided for @dashView.
  ///
  /// In en, this message translates to:
  /// **'View'**
  String get dashView;

  /// No description provided for @dashStatInProgress.
  ///
  /// In en, this message translates to:
  /// **'Courses in progress'**
  String get dashStatInProgress;

  /// No description provided for @dashStatCompletedCount.
  ///
  /// In en, this message translates to:
  /// **'{count} completed'**
  String dashStatCompletedCount(int count);

  /// No description provided for @dashStatLessons.
  ///
  /// In en, this message translates to:
  /// **'Lessons completed'**
  String get dashStatLessons;

  /// No description provided for @dashStatThisWeek.
  ///
  /// In en, this message translates to:
  /// **'{count} this week'**
  String dashStatThisWeek(int count);

  /// No description provided for @dashStatCertificates.
  ///
  /// In en, this message translates to:
  /// **'Certificates earned'**
  String get dashStatCertificates;

  /// No description provided for @dashStatViewCertificates.
  ///
  /// In en, this message translates to:
  /// **'View certificates'**
  String get dashStatViewCertificates;

  /// No description provided for @dashStatStreak.
  ///
  /// In en, this message translates to:
  /// **'Day streak'**
  String get dashStatStreak;

  /// No description provided for @dashStatKeepStreak.
  ///
  /// In en, this message translates to:
  /// **'Study today to keep it going'**
  String get dashStatKeepStreak;

  /// No description provided for @dashStatBest.
  ///
  /// In en, this message translates to:
  /// **'Best: {count, plural, one {{count} day} other {{count} days}}'**
  String dashStatBest(int count);

  /// No description provided for @dashContinueTitle.
  ///
  /// In en, this message translates to:
  /// **'Continue learning'**
  String get dashContinueTitle;

  /// No description provided for @dashViewAll.
  ///
  /// In en, this message translates to:
  /// **'View all'**
  String get dashViewAll;

  /// No description provided for @dashAllFinished.
  ///
  /// In en, this message translates to:
  /// **'You\'ve finished all your courses!'**
  String get dashAllFinished;

  /// No description provided for @dashNotStarted.
  ///
  /// In en, this message translates to:
  /// **'You haven\'t started a course yet'**
  String get dashNotStarted;

  /// No description provided for @dashBrowseCourses.
  ///
  /// In en, this message translates to:
  /// **'Browse courses'**
  String get dashBrowseCourses;

  /// No description provided for @dashNext.
  ///
  /// In en, this message translates to:
  /// **'Next: {title}'**
  String dashNext(String title);

  /// No description provided for @dashLiveOnline.
  ///
  /// In en, this message translates to:
  /// **'Live online class'**
  String get dashLiveOnline;

  /// No description provided for @dashNoLessons.
  ///
  /// In en, this message translates to:
  /// **'No lessons yet'**
  String get dashNoLessons;

  /// No description provided for @dashSchedule.
  ///
  /// In en, this message translates to:
  /// **'Schedule'**
  String get dashSchedule;

  /// No description provided for @dashResume.
  ///
  /// In en, this message translates to:
  /// **'Resume'**
  String get dashResume;

  /// No description provided for @dashStart.
  ///
  /// In en, this message translates to:
  /// **'Start'**
  String get dashStart;

  /// No description provided for @dashLiveTitle.
  ///
  /// In en, this message translates to:
  /// **'Upcoming live classes'**
  String get dashLiveTitle;

  /// No description provided for @dashLiveNone.
  ///
  /// In en, this message translates to:
  /// **'No upcoming live classes.'**
  String get dashLiveNone;

  /// No description provided for @dashLiveNow.
  ///
  /// In en, this message translates to:
  /// **'Live now'**
  String get dashLiveNow;

  /// No description provided for @dashDeadlinesTitle.
  ///
  /// In en, this message translates to:
  /// **'Deadlines'**
  String get dashDeadlinesTitle;

  /// No description provided for @dashDeadlinesNone.
  ///
  /// In en, this message translates to:
  /// **'Nothing due — you\'re all set.'**
  String get dashDeadlinesNone;

  /// No description provided for @dashDueToday.
  ///
  /// In en, this message translates to:
  /// **'Due today'**
  String get dashDueToday;

  /// No description provided for @dashDueTomorrow.
  ///
  /// In en, this message translates to:
  /// **'Due tomorrow'**
  String get dashDueTomorrow;

  /// No description provided for @dashDueIn.
  ///
  /// In en, this message translates to:
  /// **'Due in {count, plural, one {{count} day} other {{count} days}}'**
  String dashDueIn(int count);

  /// No description provided for @dashExam.
  ///
  /// In en, this message translates to:
  /// **'Exam'**
  String get dashExam;

  /// No description provided for @dashAssignment.
  ///
  /// In en, this message translates to:
  /// **'Assignment'**
  String get dashAssignment;

  /// No description provided for @dashActivityTitle.
  ///
  /// In en, this message translates to:
  /// **'Your activity'**
  String get dashActivityTitle;

  /// No description provided for @dashActivitySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Lessons completed per week · {total} in the last {weeks} weeks'**
  String dashActivitySubtitle(int total, int weeks);

  /// No description provided for @dashThisWeekShort.
  ///
  /// In en, this message translates to:
  /// **'This wk'**
  String get dashThisWeekShort;

  /// No description provided for @dashResultsTitle.
  ///
  /// In en, this message translates to:
  /// **'Recent results'**
  String get dashResultsTitle;

  /// No description provided for @dashResultsNone.
  ///
  /// In en, this message translates to:
  /// **'Your exam and assignment results will appear here.'**
  String get dashResultsNone;

  /// No description provided for @dashResultPassed.
  ///
  /// In en, this message translates to:
  /// **'Passed'**
  String get dashResultPassed;

  /// No description provided for @dashResultFailed.
  ///
  /// In en, this message translates to:
  /// **'Not passed'**
  String get dashResultFailed;

  /// No description provided for @dashResultGraded.
  ///
  /// In en, this message translates to:
  /// **'Graded'**
  String get dashResultGraded;

  /// No description provided for @dashResultAwaiting.
  ///
  /// In en, this message translates to:
  /// **'Awaiting grade'**
  String get dashResultAwaiting;

  /// No description provided for @dashNotesTitle.
  ///
  /// In en, this message translates to:
  /// **'Recent notes'**
  String get dashNotesTitle;

  /// No description provided for @dashRecommended.
  ///
  /// In en, this message translates to:
  /// **'Recommended for you'**
  String get dashRecommended;

  /// No description provided for @dashBrowseAll.
  ///
  /// In en, this message translates to:
  /// **'Browse all'**
  String get dashBrowseAll;

  /// No description provided for @dashLiveBadge.
  ///
  /// In en, this message translates to:
  /// **'LIVE'**
  String get dashLiveBadge;

  /// No description provided for @dashSwitchProfile.
  ///
  /// In en, this message translates to:
  /// **'Switch Profile'**
  String get dashSwitchProfile;

  /// No description provided for @dashTimeTba.
  ///
  /// In en, this message translates to:
  /// **'Time TBA'**
  String get dashTimeTba;

  /// No description provided for @helpTitle.
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get helpTitle;

  /// No description provided for @helpFaq.
  ///
  /// In en, this message translates to:
  /// **'Frequently asked questions'**
  String get helpFaq;

  /// No description provided for @helpSearch.
  ///
  /// In en, this message translates to:
  /// **'Search questions…'**
  String get helpSearch;

  /// No description provided for @helpNoMatch.
  ///
  /// In en, this message translates to:
  /// **'No questions match “{query}”.'**
  String helpNoMatch(String query);

  /// No description provided for @helpNone.
  ///
  /// In en, this message translates to:
  /// **'No questions have been published yet.'**
  String get helpNone;

  /// No description provided for @helpContactUs.
  ///
  /// In en, this message translates to:
  /// **'Contact us'**
  String get helpContactUs;

  /// No description provided for @helpPolicies.
  ///
  /// In en, this message translates to:
  /// **'Policies'**
  String get helpPolicies;

  /// No description provided for @pageUnavailable.
  ///
  /// In en, this message translates to:
  /// **'This page isn\'t available right now.'**
  String get pageUnavailable;

  /// No description provided for @pageUpdated.
  ///
  /// In en, this message translates to:
  /// **'Last updated {date}'**
  String pageUpdated(String date);

  /// No description provided for @languageChangeTo.
  ///
  /// In en, this message translates to:
  /// **'Change language'**
  String get languageChangeTo;

  /// No description provided for @accessEndedTitle.
  ///
  /// In en, this message translates to:
  /// **'{name}\'s subscription has ended'**
  String accessEndedTitle(String name);

  /// No description provided for @accessGraceBody.
  ///
  /// In en, this message translates to:
  /// **'Lessons and live classes stay open until {date}. Renew now so learning isn\'t interrupted.'**
  String accessGraceBody(String date);

  /// No description provided for @accessExpiredBody.
  ///
  /// In en, this message translates to:
  /// **'Lessons, live classes, assignments and chat are locked. Exams, results and certificates stay open.'**
  String get accessExpiredBody;

  /// No description provided for @accessNoneTitle.
  ///
  /// In en, this message translates to:
  /// **'{name} doesn\'t have a subscription'**
  String accessNoneTitle(String name);

  /// No description provided for @accessNoneBody.
  ///
  /// In en, this message translates to:
  /// **'Subscribe to open lessons, live classes, assignments and chat.'**
  String get accessNoneBody;

  /// No description provided for @accessRenew.
  ///
  /// In en, this message translates to:
  /// **'Renew subscription'**
  String get accessRenew;

  /// No description provided for @accessSubscribe.
  ///
  /// In en, this message translates to:
  /// **'Subscribe'**
  String get accessSubscribe;

  /// No description provided for @accessRenewToJoin.
  ///
  /// In en, this message translates to:
  /// **'Renew to join'**
  String get accessRenewToJoin;

  /// No description provided for @accessLessonLockedTitle.
  ///
  /// In en, this message translates to:
  /// **'This lesson is locked'**
  String get accessLessonLockedTitle;

  /// No description provided for @accessLessonLockedBody.
  ///
  /// In en, this message translates to:
  /// **'{name}\'s subscription has ended. Renew it to continue — progress is saved. Exams stay open.'**
  String accessLessonLockedBody(String name);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'bn', 'en', 'hi', 'ur'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'bn':
      return AppLocalizationsBn();
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
    case 'ur':
      return AppLocalizationsUr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
