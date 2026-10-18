// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonContinue => 'Continue';

  @override
  String get commonTryAgain => 'Try again';

  @override
  String get commonSending => 'Sending...';

  @override
  String get commonClose => 'Close';

  @override
  String get commonSave => 'Save';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonOr => 'or';

  @override
  String get commonLearner => 'Learner';

  @override
  String get commonAdult => 'Adult';

  @override
  String commonAgeRange(String min, String max) {
    return 'Ages $min–$max';
  }

  @override
  String commonAgeUnder(String max) {
    return 'Ages $max and under';
  }

  @override
  String get commonNotSubscribed => 'Not subscribed';

  @override
  String get commonConnectionError =>
      'Unable to connect. Check your internet connection.';

  @override
  String get commonLogoLabel => '3i International Islamic Institute logo';

  @override
  String get commonInstituteName => 'International Islamic Institute';

  @override
  String get languageLabel => 'Language';

  @override
  String get languageSettingBody =>
      'The language used on the website, in the app and in emails';

  @override
  String get languageSaveFailed =>
      'Couldn\'t save your language on your account. It will reset the next time you sign in.';

  @override
  String get authEmailLabel => 'Email address';

  @override
  String get authPasswordLabel => 'Password';

  @override
  String get authShowPassword => 'Show password';

  @override
  String get authHidePassword => 'Hide password';

  @override
  String get authEmailInvalid => 'Enter a valid email address';

  @override
  String get authPasswordRequired => 'Password is required';

  @override
  String get authPasswordMin => 'Password must be at least 10 characters';

  @override
  String get authPasswordMax => 'Password must be 128 characters or fewer';

  @override
  String get authBackToLogin => 'Back to log in';

  @override
  String get authGoToLogin => 'Go to log in';

  @override
  String get authSelectDate => 'Select date';

  @override
  String get authSelectDob => 'Select your date of birth';

  @override
  String get loginTitle => 'Welcome back';

  @override
  String get loginSubtitle => 'Please enter your credentials to log in.';

  @override
  String get loginForgotPassword => 'Forgot password?';

  @override
  String get loginSubmit => 'Log in';

  @override
  String get loginFailed => 'Login failed. Please try again.';

  @override
  String get loginNewHere => 'New to 3i?';

  @override
  String get loginCreateAccount => 'Create an account';

  @override
  String get loginInstructorPortal => 'Instructor portal';

  @override
  String get registerTitle => 'Start your journey';

  @override
  String get registerSubtitle =>
      'One account. Add your children whenever you\'re ready.';

  @override
  String get registerFirstName => 'First name';

  @override
  String get registerFirstNameHint => 'e.g. Sarah';

  @override
  String get registerLastName => 'Last name';

  @override
  String get registerLastNameHint => 'e.g. Ahmed';

  @override
  String get registerFirstNameRequired => 'First name is required';

  @override
  String get registerLastNameRequired => 'Last name is required';

  @override
  String get registerNameTooLong => 'Must be 100 characters or fewer';

  @override
  String get registerPasswordHint => 'At least 10 characters';

  @override
  String get registerDateOfBirth => 'Date of birth';

  @override
  String get registerDateOfBirthHint => 'Must be 18 or older';

  @override
  String get registerDobRequired =>
      'Select your date of birth. You must be at least 18.';

  @override
  String get registerLanguage => 'Preferred language';

  @override
  String get registerLanguageHint =>
      'The language the app uses. You can change it anytime.';

  @override
  String get registerSubmit => 'Create account';

  @override
  String get registerFailed => 'Registration failed. Please try again.';

  @override
  String get registerHaveAccount => 'Already have an account?';

  @override
  String get registerLogIn => 'Log in';

  @override
  String get forgotTitle => 'Reset your password';

  @override
  String get forgotSubtitle =>
      'Enter the email on your account and we\'ll send you a link.';

  @override
  String get forgotSubmit => 'Send reset link';

  @override
  String get forgotSentTitle => 'Check your email';

  @override
  String get forgotSentBody =>
      'If an account with that email exists, we\'ve sent a password reset link.';

  @override
  String get forgotFailed => 'Failed to send reset link';

  @override
  String get resetTitle => 'Choose a new password';

  @override
  String get resetSubtitle =>
      'Choose a secure password with at least 10 characters.';

  @override
  String get resetNewPassword => 'New password';

  @override
  String get resetConfirm => 'Confirm new password';

  @override
  String get resetSubmit => 'Update password';

  @override
  String get resetMismatch => 'Passwords do not match';

  @override
  String get resetInvalidLink =>
      'This password reset link is invalid or incomplete. Request a new link.';

  @override
  String get resetFailed => 'Failed to reset password';

  @override
  String get resetDoneTitle => 'Password updated';

  @override
  String get resetDoneBody =>
      'Your password has been updated. Log in with your new password.';

  @override
  String get checkEmailTitle => 'Check your email';

  @override
  String checkEmailSentTo(String email) {
    return 'We\'ve sent a verification link to $email';
  }

  @override
  String get checkEmailResend => 'Resend email';

  @override
  String get checkEmailCanResendNow => 'You can resend now';

  @override
  String checkEmailResendIn(int seconds) {
    return 'You can resend in $seconds seconds';
  }

  @override
  String get checkEmailResendFailed => 'Failed to resend email';

  @override
  String get checkEmailWrongEmail => 'Wrong email? Go back';

  @override
  String get checkEmailBackInstructor => 'Back to instructor sign in';

  @override
  String get verifyVerifying => 'Verifying your email...';

  @override
  String get verifyPleaseWait => 'Please wait while we verify your email.';

  @override
  String get verifyVerifiedTitle => 'Email verified!';

  @override
  String get verifyVerifiedBody =>
      'Your email is verified. You can now log in.';

  @override
  String get verifyExpiredTitle => 'This link has expired';

  @override
  String get verifyExpiredBody =>
      'Verification links are valid for 24 hours. We can send a new one to the same email address.';

  @override
  String get verifyFailedTitle => 'Verification failed';

  @override
  String get verifyFailed => 'Verification failed';

  @override
  String get verifyInvalidLink => 'Invalid verification link';

  @override
  String get verifyNewLinkTitle => 'New link sent';

  @override
  String get verifyNewLinkBody =>
      'We\'ve sent a new verification link to your email. Open it within 24 hours to finish setting up your account.';

  @override
  String get verifySendNewLink => 'Send me a new link';

  @override
  String get verifyNewLinkFailed => 'Failed to send a new link';

  @override
  String get unverifiedTitle => 'Please verify your email first';

  @override
  String unverifiedBody(String email) {
    return 'We sent a verification link to $email. If it has expired or you can\'t find it, we can send a new one.';
  }

  @override
  String get unverifiedResend => 'Resend verification email';

  @override
  String get socialContinueGoogle => 'Continue with Google';

  @override
  String get socialContinueApple => 'Continue with Apple';

  @override
  String get socialSignUpGoogle => 'Sign up with Google';

  @override
  String get socialSignUpApple => 'Sign up with Apple';

  @override
  String get socialGoogleFailed => 'Google sign-in failed';

  @override
  String get socialAppleFailed => 'Apple sign-in failed';

  @override
  String get socialAppleNoToken => 'No identity token received from Apple';

  @override
  String socialDobRequired(String provider) {
    return 'Your date of birth is required to create an account with $provider.';
  }

  @override
  String get socialCreateTitle => 'Create your account';

  @override
  String socialCreateBody(String provider) {
    return 'There\'s no 3i account for this $provider email yet. To create one, enter your date of birth. You must be at least 13 years old.';
  }

  @override
  String get profilesWhoIsLearning => 'Who\'s learning today?';

  @override
  String get profilesEmpty => 'Add a learner profile to get started.';

  @override
  String get profilesLoadFailed => 'Failed to load profiles';

  @override
  String get profilesAddLearner => 'Add learner';

  @override
  String get profilesLogOut => 'Log out';

  @override
  String get pinEnter => 'Enter your 4-digit PIN';

  @override
  String get pinIncorrect => 'That PIN doesn\'t match. Try again.';

  @override
  String pinTriesLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count tries',
      one: '$count try',
    );
    return 'Incorrect PIN. $_temp0 left.';
  }

  @override
  String get pinCheckFailed =>
      'Couldn\'t check the PIN. Check your connection.';

  @override
  String pinTooMany(int seconds) {
    return 'Too many attempts. Try again in ${seconds}s.';
  }

  @override
  String get pinForgot =>
      'Forgot your PIN? Ask the account holder to reset it from Manage profiles.';

  @override
  String pinProgress(int filled, int length) {
    return 'PIN, $filled of $length digits entered';
  }

  @override
  String get settingsTitle => 'Account settings';

  @override
  String get settingsFamilyTitle => 'Family & profiles';

  @override
  String get settingsFamilyBody => 'Manage learner profiles and PINs';

  @override
  String get settingsDevicesTitle => 'Devices';

  @override
  String get settingsDevicesBody =>
      'Device management is available on the website';

  @override
  String get settingsSubscriptionTitle => 'Subscription & billing';

  @override
  String get settingsSubscriptionBody =>
      'Pay for and renew each learner\'s subscription';

  @override
  String get settingsSecurityTitle => 'Login & security';

  @override
  String get settingsSecurityBody => 'Update your email and password';

  @override
  String get menuAccount => 'User menu';

  @override
  String get menuSwitchLearner => 'Switch learner profile';

  @override
  String get menuFamily => 'Family & profiles';

  @override
  String get menuSubscription => 'Subscription';

  @override
  String get menuManageAccount => 'Manage account';

  @override
  String get menuLogOut => 'Log out';

  @override
  String get menuCourses => 'Courses';

  @override
  String get menuHelp => 'Help & Support';

  @override
  String get menuLearnerProfile => 'Learner profile';

  @override
  String dashboardGreeting(String name) {
    return 'Assalamu alaikum, $name';
  }

  @override
  String get dashboardWelcomeBack => 'Welcome back to your dashboard';

  @override
  String get dashboardSearchCourses => 'Search courses';

  @override
  String get dashboardExploreCourses => 'Explore courses';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navRegularCourses => 'Regular Courses';

  @override
  String get navOnlineClasses => 'Online Classes';

  @override
  String get navAssignments => 'Assignments';

  @override
  String get navExams => 'Exams';

  @override
  String get navCertificates => 'Certificates';

  @override
  String get navWishlist => 'Wishlist';

  @override
  String get coursesTitle => 'Courses';

  @override
  String get coursesSearch => 'Search courses, instructors, topics...';

  @override
  String get coursesClearSearch => 'Clear search';

  @override
  String get coursesLoading => 'Loading courses...';

  @override
  String get coursesLoadFailed => 'Courses could not be loaded.';

  @override
  String coursesCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count courses',
      one: '$count course',
    );
    return '$_temp0';
  }

  @override
  String get coursesCategory => 'Category';

  @override
  String get coursesAllCategories => 'All categories';

  @override
  String get coursesType => 'Type';

  @override
  String get coursesAllTypes => 'All types';

  @override
  String get coursesTypeRegular => 'Regular';

  @override
  String get coursesTypeLive => 'Online Class';

  @override
  String get coursesTypeHybrid => 'Hybrid';

  @override
  String get coursesLanguage => 'Language';

  @override
  String get coursesAllLanguages => 'All languages';

  @override
  String get coursesAge => 'Age';

  @override
  String get coursesSort => 'Sort';

  @override
  String get coursesSortPopularity => 'Relevance';

  @override
  String get coursesSortNewest => 'Newest';

  @override
  String get coursesSortRating => 'Highest Rated';

  @override
  String get coursesSortTitle => 'Title A-Z';

  @override
  String get coursesClearFilters => 'Clear filters';

  @override
  String get coursesClearAllFilters => 'Clear all filters';

  @override
  String get coursesNoResults => 'No courses found matching your filters.';

  @override
  String coursesPageOf(int page, int total) {
    return 'Page $page of $total';
  }

  @override
  String get commonAllAges => 'All ages';

  @override
  String commonAgesFrom(String min) {
    return 'Ages $min+';
  }

  @override
  String get commonNewRating => 'New';

  @override
  String get commonRecommendedAge => 'Recommended age group';

  @override
  String get commonPrevious => 'Previous';

  @override
  String get commonNext => 'Next';

  @override
  String get courseCardPreview => 'Course Preview';

  @override
  String get wishlistAdd => 'Add to wishlist';

  @override
  String get wishlistRemove => 'Remove from wishlist';

  @override
  String get wishlistUpdateFailed => 'Could not update wishlist.';

  @override
  String get landingHomeLabel => '3i International Islamic Institute home';

  @override
  String get landingAccountMenu => 'Account and learner menu';

  @override
  String get landingAccount => 'Account';

  @override
  String get menuDashboard => 'Dashboard';

  @override
  String get menuMyCourses => 'My Courses';

  @override
  String get footerTagline =>
      'Rigorous teaching. Global classrooms. One institute.';

  @override
  String get footerAbout =>
      'Structured, accredited programs across the sciences, humanities, and professional fields, taught to students in 40 countries.';

  @override
  String footerRights(String year) {
    return '© $year 3i International Islamic Institute. All rights reserved.';
  }

  @override
  String get homeWelcome => 'Welcome';

  @override
  String homeWelcomeName(String name) {
    return 'Welcome, $name';
  }

  @override
  String get homeSignedIn => 'You are signed in.';

  @override
  String shareText(String title) {
    return 'Check out \"$title\" at 3i International Islamic Institute';
  }

  @override
  String get shareDetailsCopied => 'Course details copied';

  @override
  String get shareLinkCopied => 'Link copied';

  @override
  String get levelBeginner => 'Beginner';

  @override
  String get levelIntermediate => 'Intermediate';

  @override
  String get levelAdvanced => 'Advanced';

  @override
  String get levelAll => 'All levels';

  @override
  String commonMinutes(int count) {
    return '$count min';
  }

  @override
  String get commonBackToCourses => 'Back to courses';

  @override
  String get detailLearn => 'What you\'ll learn';

  @override
  String get detailRequirements => 'Requirements';

  @override
  String get detailAbout => 'About this course';

  @override
  String get detailStudentsAlsoTook => 'Students also took';

  @override
  String detailBreadcrumb(String category) {
    return 'Courses  ›  $category';
  }

  @override
  String detailRatingMeta(String rating, int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count reviews',
      one: '$count review',
    );
    return '$rating · $_temp0';
  }

  @override
  String get detailInstructedBy => 'Instructed by ';

  @override
  String get detailLoadFailed => 'Failed to load course';

  @override
  String get enrolWaitlisted =>
      'Added to waitlist. You\'ll be notified when a seat opens.';

  @override
  String get enrolSuccess => 'Enrolled successfully';

  @override
  String get enrolFailed => 'Enrolment failed';

  @override
  String get enrolSubscribe => 'Subscribe';

  @override
  String get enrolNoBatches => 'There are no available batches right now.';

  @override
  String get cardIncluded => 'INCLUDED WITH MEMBERSHIP';

  @override
  String get cardEnrolledTitle => 'You\'re enrolled';

  @override
  String get cardStartToday => 'Start learning today';

  @override
  String cardNotAvailable(String name, String message, String age) {
    return 'Not available for $name. $message ($name is $age).';
  }

  @override
  String get cardEnrolNow => 'Enrol Now';

  @override
  String cardNeedsSubscription(String name) {
    return '$name needs a subscription to enrol in courses.';
  }

  @override
  String get cardSubscribeToEnrol => 'Subscribe to Enrol';

  @override
  String get cardChooseBatch => 'Choose a class batch';

  @override
  String get cardManageSubscription => 'Manage subscription';

  @override
  String get cardWhatsIncluded => 'What\'s included';

  @override
  String get batchChoose => 'Choose Your Batch';

  @override
  String get batchChooseBody =>
      'Select a class group to continue with enrolment.';

  @override
  String get batchSubtitleBody =>
      'View the schedule and sessions for each available batch.';

  @override
  String batchSessions(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count sessions',
      one: '$count session',
    );
    return '$_temp0';
  }

  @override
  String batchSeats(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count seats',
      one: '$count seat',
    );
    return '$_temp0';
  }

  @override
  String get batchActive => 'Active';

  @override
  String get batchUpcoming => 'Upcoming';

  @override
  String get batchSessionNotes => 'Session notes';

  @override
  String get detailSyllabus => 'DETAILED SYLLABUS';

  @override
  String get detailCurriculum => 'Curriculum';

  @override
  String detailLessons(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count lessons',
      one: '$count lesson',
    );
    return '$_temp0';
  }

  @override
  String get detailYourInstructor => 'YOUR INSTRUCTOR';

  @override
  String detailInstructorStats(int courses, int learners) {
    String _temp0 = intl.Intl.pluralLogic(
      courses,
      locale: localeName,
      other: '$courses courses',
      one: '$courses course',
    );
    String _temp1 = intl.Intl.pluralLogic(
      learners,
      locale: localeName,
      other: '$learners learners',
      one: '$learners learner',
    );
    return '$_temp0 · $_temp1';
  }

  @override
  String get detailReviews => 'Learner reviews';

  @override
  String detailReviewCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count reviews',
      one: '$count review',
    );
    return '$_temp0';
  }

  @override
  String get detailEnrolledShare =>
      'You\'re enrolled in this course. Share how it\'s going.';

  @override
  String get detailRateReview => 'Rate & review';

  @override
  String get detailNoReviews => 'No reviews yet.';

  @override
  String get reviewParent => 'Parent';

  @override
  String get reviewThanks => 'Thanks! Your review has been submitted.';

  @override
  String get reviewSelectRating => 'Please select a rating.';

  @override
  String get reviewSubmitFailed => 'Could not submit your review.';

  @override
  String get reviewTitle => 'Rate this course';

  @override
  String reviewSubmittingAs(String name) {
    return 'Submitting as $name';
  }

  @override
  String get reviewYourRating => 'Your rating';

  @override
  String reviewStars(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count stars',
      one: '$count star',
    );
    return '$_temp0';
  }

  @override
  String get reviewWrite => 'Write a review (optional)';

  @override
  String get reviewHint => 'Share your experience with this course...';

  @override
  String get reviewSubmit => 'Submit review';

  @override
  String get cardReviewCourse => 'Review Course';

  @override
  String get cardContinue => 'Continue Learning';

  @override
  String get cardStart => 'Start Learning';

  @override
  String get cardComingSoon => 'Lessons coming soon';

  @override
  String get cardClassSchedule => 'Class Schedule';

  @override
  String get cardChatRoom => 'Chat Room';

  @override
  String get cardYourBatch => 'Your Batch';

  @override
  String get cardDashboard => 'Go to Dashboard';

  @override
  String get cardEnrolled => 'Enrolled';

  @override
  String get detailFaq => 'Common questions';

  @override
  String get membershipTitle => 'One membership. Every course.';

  @override
  String get membershipAllCourses => 'All courses';

  @override
  String get membershipAllCoursesBody =>
      'Learn across Islamic studies, languages, sciences and more.';

  @override
  String get membershipLive => 'Live classes included';

  @override
  String get membershipLiveBody => 'Join interactive seminars and live Q&As.';

  @override
  String get membershipCertificates => 'Certificates included';

  @override
  String get membershipCertificatesBody =>
      'Earn certificates as you complete your learning.';

  @override
  String get detailShare => 'Share this course';

  @override
  String get learnSelectProfileCourses =>
      'Select a learner profile to view courses.';

  @override
  String get learnCoursesLoadFailed => 'Could not load your courses';

  @override
  String get learnRegularTitle => 'Regular Courses';

  @override
  String learnRegularCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count self-paced courses',
      one: '$count self-paced course',
    );
    return '$_temp0';
  }

  @override
  String get learnSearch => 'Search by course or instructor...';

  @override
  String get learnNoRegular => 'No regular courses yet';

  @override
  String get learnNoRegularBody =>
      'Browse the course catalogue to find your next lesson.';

  @override
  String get learnBrowse => 'Browse courses';

  @override
  String get learnNoMatch => 'No matching courses';

  @override
  String get learnNoMatchBody => 'Try a different course or instructor name.';

  @override
  String learnLessonsProgress(int done, int total) {
    return '$done/$total lessons';
  }

  @override
  String get learnNoLessons => 'No lessons';

  @override
  String get learnResume => 'Resume';

  @override
  String get learnStart => 'Start Learning';

  @override
  String get learnExams => 'Exams';

  @override
  String get levelAllCaps => 'ALL LEVELS';

  @override
  String get levelBeginnerCaps => 'BEGINNER';

  @override
  String get levelIntermediateCaps => 'INTERMEDIATE';

  @override
  String get levelAdvancedCaps => 'ADVANCED';

  @override
  String get classesSelectProfile =>
      'Select a learner profile to view your live classes.';

  @override
  String get classesLoadFailed => 'Could not load online classes';

  @override
  String get classesTitle => 'Online Classes';

  @override
  String classesCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count live courses',
      one: '$count live course',
    );
    return '$_temp0';
  }

  @override
  String get classesNone => 'No live classes yet';

  @override
  String get classesNoneBody => 'Browse the course catalogue to find a class.';

  @override
  String get classesNoMatch => 'No matching classes';

  @override
  String get classesNoMatchBody => 'Try another course or instructor name.';

  @override
  String get classesNoUpcoming => 'No upcoming session';

  @override
  String get classesBatch => 'Batch';

  @override
  String get classesChat => 'Chat';

  @override
  String get classesMoreActions => 'More actions';

  @override
  String get classesDetails => 'Details';

  @override
  String get classesSessions => 'Sessions';

  @override
  String get classesExams => 'Exams';

  @override
  String get classesCertificate => 'Certificate';

  @override
  String get classesDateTba => 'Date to be announced';

  @override
  String get scheduleStatusLive => 'Live now';

  @override
  String get scheduleStatusSoon => 'Starting soon';

  @override
  String get scheduleStatusUpcoming => 'Upcoming';

  @override
  String get scheduleStatusCompleted => 'Completed';

  @override
  String get scheduleSectionUpcoming => 'Upcoming sessions';

  @override
  String get scheduleSectionCompleted => 'Previous sessions';

  @override
  String get scheduleSelectProfile =>
      'Select a learner profile to view this class schedule.';

  @override
  String get scheduleTitle => 'Class schedule';

  @override
  String get scheduleUnavailable => 'Class schedule unavailable';

  @override
  String get scheduleUnavailableBody =>
      'We could not load this batch. You may no longer be enrolled in this batch, or the batch may no longer be available.';

  @override
  String scheduleScheduled(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count sessions scheduled',
      one: '$count session scheduled',
    );
    return '$_temp0';
  }

  @override
  String get scheduleNone => 'No sessions scheduled yet.';

  @override
  String get scheduleNoneHint =>
      'Your instructor has not added any sessions to this batch.';

  @override
  String get scheduleBack => 'Back to Online Classes';

  @override
  String scheduleEnrolledOn(String date) {
    return 'Enrolled $date';
  }

  @override
  String scheduleSessionNumber(int number) {
    return 'Session $number';
  }

  @override
  String get scheduleJoin => 'Join class';

  @override
  String get scheduleJoinSoon => 'Join soon';

  @override
  String get scheduleNoLink => 'No link yet';

  @override
  String get scheduleCompleted => 'Completed';

  @override
  String get scheduleNotStarted => 'Not started';

  @override
  String get scheduleLinkFailed => 'Could not open the meeting link.';

  @override
  String get lessonReloadFailed => 'Could not reload. Check your connection.';

  @override
  String get lessonProgressSaveFailed =>
      'Progress could not be saved. It will retry next time.';

  @override
  String get lessonNoteEmpty => 'Note cannot be empty';

  @override
  String get lessonNoteSaveFailed => 'Could not save note. Please try again.';

  @override
  String get lessonSelectProfile => 'Select a learner profile to continue.';

  @override
  String get lessonTitle => 'Lesson';

  @override
  String get lessonLoadFailed => 'Could not load course lessons.';

  @override
  String get lessonNotInCourse => 'This lesson is not part of the course.';

  @override
  String get lessonReload => 'Reload';

  @override
  String get lessonCourseContent => 'Course content';

  @override
  String get lessonPrevious => 'Previous';

  @override
  String get lessonNext => 'Next';

  @override
  String lessonCourseName(String title) {
    return 'Course: $title';
  }

  @override
  String get lessonOverview => 'Overview';

  @override
  String get lessonNotes => 'Notes';

  @override
  String get lessonDefaultOverview =>
      'Continue through this lesson, then use the course content button to move between topics.';

  @override
  String get lessonNotesHint => 'Write your notes for this lesson...';

  @override
  String get lessonSaved => 'Saved';

  @override
  String get lessonSaveNote => 'Save note';

  @override
  String get lessonDocUnavailable => 'Document unavailable';

  @override
  String get lessonMarkedComplete => 'Lesson marked complete';

  @override
  String get lessonReadOnlyKeepReading =>
      'Read-only preview • Keep reading to complete this lesson';

  @override
  String get lessonReadOnlyPdf => 'Read-only PDF preview';

  @override
  String get lessonMediaUnavailable => 'Lesson media unavailable';

  @override
  String get lessonOpenLinkTitle => 'Open the lesson link';

  @override
  String get lessonOpenLink => 'Open link';

  @override
  String get lessonPdfFailed =>
      'We couldn\'t load this document. Check your connection and try again.';

  @override
  String get lessonReloadPdf => 'Reload PDF';

  @override
  String get videoCheckConnection => 'Check your connection, then try again.';

  @override
  String videoCouldNotPlay(String reason) {
    return 'Video could not be played. $reason';
  }

  @override
  String get videoInterrupted => 'Playback was interrupted. Please try again.';

  @override
  String get videoBack10 => 'Back 10 seconds';

  @override
  String get videoForward10 => 'Forward 10 seconds';

  @override
  String get videoSpeed => 'Playback speed';

  @override
  String get videoNormal => 'Normal';

  @override
  String get videoFullScreen => 'Full screen';

  @override
  String get videoExitFullScreen => 'Exit full screen';

  @override
  String get videoPause => 'Pause';

  @override
  String get videoPlay => 'Play';

  @override
  String get lessonCourseExam => 'Course exam';

  @override
  String get lessonExamUnlocked =>
      'You have completed 90% of the course — you can now sit the exam.';

  @override
  String lessonExamLocked(int progress) {
    return 'Complete 90% of the course to unlock the exam. You are at $progress%.';
  }

  @override
  String get lessonCourseProgress => 'Course progress';

  @override
  String get lessonExamUnlockedShort => 'Exam unlocked — good luck!';

  @override
  String get lessonExamUnlockHint =>
      'The exam unlocks automatically once you reach 90% course completion.';

  @override
  String get lessonTakeExam => 'Take exam';

  @override
  String get lessonLocked => 'Locked';

  @override
  String get lessonCertificateFailed =>
      'We could not generate your certificate. Please try again.';

  @override
  String get lessonCourseCertificate => 'Course certificate';

  @override
  String get lessonCertificateHint =>
      'Generate a certificate showing your course progress and last exam score. This can only be done once.';

  @override
  String get lessonCertificateLocked =>
      'Take the exam at least once to unlock your certificate.';

  @override
  String get lessonGenerating => 'Generating...';

  @override
  String get lessonGenerateCertificate => 'Generate certificate';

  @override
  String get lessonPending => 'Pending';

  @override
  String get lessonCertificateGenerated => 'Certificate generated';

  @override
  String lessonIssuedOn(String date) {
    return 'Issued on $date';
  }

  @override
  String get lessonLastExamScore => 'Last exam score';

  @override
  String lessonLatestAttempt(String title) {
    return 'Latest attempt: $title';
  }

  @override
  String lessonAttemptNumber(int number) {
    return 'Attempt #$number';
  }

  @override
  String get lessonVerificationCode => 'Verification code:';

  @override
  String get lessonDownloadPdf => 'Download PDF';

  @override
  String get commonCheckConnection => 'Check your connection and try again.';

  @override
  String get commonNoCoursesYet => 'No courses enrolled yet';

  @override
  String get commonOnlineClassSuffix => ' • Online class';

  @override
  String get assignSelectProfile =>
      'Select a learner profile to view assignments.';

  @override
  String get assignTitle => 'Assignments';

  @override
  String get assignSelectCourse => 'Select a course to view its assignments.';

  @override
  String get assignNoCoursesBody =>
      'Browse courses and enroll to see assignments here.';

  @override
  String get assignSubmitted => 'Assignment submitted';

  @override
  String get assignSubmitFailed => 'Failed to submit assignment';

  @override
  String get assignLoadFailed => 'Could not load assignments';

  @override
  String get assignBack => 'Back to assignments';

  @override
  String assignCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count assignments for this course',
      one: '$count assignment for this course',
    );
    return '$_temp0';
  }

  @override
  String get assignNone => 'No assignments yet';

  @override
  String get assignNoneBody => 'No assignments for this course yet.';

  @override
  String get assignNoDeadline => 'No deadline';

  @override
  String assignDue(String date) {
    return 'Due: $date';
  }

  @override
  String assignMarks(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count marks',
      one: '$count mark',
    );
    return '$_temp0';
  }

  @override
  String get assignYourSubmission => 'YOUR SUBMISSION';

  @override
  String get assignOpenFile => 'Open attached file';

  @override
  String assignMarksAwarded(String awarded, int total) {
    return 'Marks: $awarded/$total';
  }

  @override
  String assignFeedback(String feedback) {
    return 'Feedback: $feedback';
  }

  @override
  String get assignAnswerHint => 'Write your answer...';

  @override
  String get assignSubmitting => 'Submitting...';

  @override
  String get assignSubmit => 'Submit assignment';

  @override
  String get assignFileFailed => 'Could not open the attached file.';

  @override
  String get assignGraded => 'GRADED';

  @override
  String get assignSubmittedBadge => 'SUBMITTED';

  @override
  String get examsSelectProfile => 'Select a learner profile to view exams.';

  @override
  String get examsSelectProfileFirst => 'Select a learner profile first.';

  @override
  String get examsTitle => 'Exams';

  @override
  String get examsSelectCourse => 'Select a course to view and take its exams.';

  @override
  String get examsNoCoursesBody =>
      'Browse courses and enroll to see course exams here.';

  @override
  String get examsLoadFailed => 'Could not load exams';

  @override
  String get examsBackOnline => 'Back to Online Classes';

  @override
  String get examsBackRegular => 'Back to Regular Courses';

  @override
  String examsAvailable(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count exams available',
      one: '$count exam available',
    );
    return '$_temp0';
  }

  @override
  String get examsNone => 'No exams available';

  @override
  String get examsNoneBody => 'There are no exams for this course yet.';

  @override
  String get examsTypePractice => 'PRACTICE';

  @override
  String get examsTypeFinal => 'FINAL';

  @override
  String get examsPassed => 'PASSED';

  @override
  String get examsInProgress => 'IN PROGRESS';

  @override
  String get examsRandomQuestions => 'Random questions';

  @override
  String examsQuestions(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count questions',
      one: '$count question',
    );
    return '$_temp0';
  }

  @override
  String examsPassMark(int mark) {
    return 'Pass: $mark%';
  }

  @override
  String examsAttempts(String value) {
    return 'Attempts: $value';
  }

  @override
  String examsBestScore(String score, int total) {
    return 'Best score: $score/$total';
  }

  @override
  String get examsTimeLeft => 'Time left in your attempt';

  @override
  String get examsTimesUp => 'Time\'s up';

  @override
  String get examsTimerRunning =>
      'The timer keeps running — resume to continue.';

  @override
  String get examsOpenToSubmit => 'Open the exam to submit your saved answers.';

  @override
  String get examsStartsIn => 'Starts in';

  @override
  String examsOpens(String date) {
    return 'Opens $date';
  }

  @override
  String get examsWindowClosesIn => 'Start window closes in';

  @override
  String examsStartBefore(String date) {
    return 'Start before $date';
  }

  @override
  String get examsViewResult => 'View result';

  @override
  String get examsResume => 'Resume exam';

  @override
  String get examsSubmitAnswers => 'Submit answers';

  @override
  String get examsMaxAttempts => 'Max attempts reached';

  @override
  String get examsNotStartedYet => 'Not started yet';

  @override
  String get examsWindowClosed => 'Start window closed';

  @override
  String get examsTake => 'Take exam';

  @override
  String get examsBack => 'Back to exams';

  @override
  String examsCountdownDays(int d, String h, String m) {
    return '${d}d ${h}h ${m}m';
  }

  @override
  String takeMinutesLeft(int count) {
    return '$count minutes left';
  }

  @override
  String get takeOneMinuteLeft =>
      '1 minute left — your exam will be submitted automatically';

  @override
  String get takeNotStartedToast => 'This exam hasn\'t started yet';

  @override
  String get takeWindowClosedToast =>
      'The start window for this exam has closed';

  @override
  String get takeSubmittedToast => 'Exam submitted';

  @override
  String get takeSubmitError =>
      'We couldn\'t submit your exam. Please try again.';

  @override
  String get takeStartFailed =>
      'We couldn\'t start the exam. Please try again.';

  @override
  String get takeConfirmTitle => 'Submit your exam?';

  @override
  String takeConfirmUnanswered(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count unanswered questions',
      one: '$count unanswered question',
    );
    return 'You have $_temp0. You can\'t change your answers after submitting.';
  }

  @override
  String get takeConfirmAll =>
      'You\'ve answered every question. You can\'t change your answers after submitting.';

  @override
  String get takeAnswered => 'Answered';

  @override
  String get takeUnanswered => 'Unanswered';

  @override
  String get takeNotAnswered => 'Not answered';

  @override
  String get takeFlagged => 'Flagged';

  @override
  String get takeFlag => 'Flag';

  @override
  String get takeKeepWorking => 'Keep working';

  @override
  String get takeSubmitExam => 'Submit exam';

  @override
  String get takeLeaveTitle => 'Leave the exam?';

  @override
  String get takeLeaveBody =>
      'Your answers are saved, but the timer keeps running. You can resume from the exam list.';

  @override
  String get takeStay => 'Stay';

  @override
  String get takeLeave => 'Leave';

  @override
  String get takeQuestions => 'Questions';

  @override
  String takeAnsweredOf(int answered, int total) {
    return '$answered of $total answered';
  }

  @override
  String takeFlaggedCount(int count) {
    return '$count flagged';
  }

  @override
  String get takeSubmittedTitle => 'Exam submitted';

  @override
  String get takeTakingToResult => 'Taking you to your result…';

  @override
  String get takeLoadFailedTitle => 'Couldn\'t load exam';

  @override
  String get takeNotStartedTitle => 'Exam not started yet';

  @override
  String takeNotStartedBody(String date) {
    return 'This exam starts on $date. You can start it any time after the start time until 50% of the exam duration has elapsed.';
  }

  @override
  String get takeClosedTitle => 'Start window closed';

  @override
  String takeClosedBody(String date) {
    return 'This exam could be started until $date. The start window has now passed.';
  }

  @override
  String get takeNoQuestionsTitle => 'No questions available';

  @override
  String get takeNoQuestionsBody =>
      'This exam doesn\'t have any questions yet.';

  @override
  String get takeAllQuestions => 'Show all questions';

  @override
  String takeQuestionOf(int n, int total) {
    return 'Question $n of $total';
  }

  @override
  String takeMarks(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count marks',
      one: '$count mark',
    );
    return '$_temp0';
  }

  @override
  String get takeSubmitting => 'Submitting...';

  @override
  String get takeReviewSubmit => 'Review & submit';

  @override
  String get takeNext => 'Next';

  @override
  String get takeAnswerHint => 'Type your answer...';

  @override
  String takeWords(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count words',
      one: '$count word',
    );
    return '$_temp0';
  }

  @override
  String get takeNoOptions => 'No options available for this question.';

  @override
  String get takeSelectAll => 'Select all that apply';

  @override
  String get takeTimesUp => 'Time\'s up';

  @override
  String get takeSubmittingAnswers => 'Submitting your answers…';

  @override
  String get takeSubmissionFailed => 'Submission failed';

  @override
  String get takeSavedOnDevice =>
      'Your answers are saved on this device. Check your connection and try again.';

  @override
  String get takeRetrySubmit => 'Retry submit';

  @override
  String get takeDiscardLeave => 'Discard & leave';

  @override
  String takeTimeRemaining(String time) {
    return 'Time remaining $time';
  }

  @override
  String get takeDuration => 'Duration';

  @override
  String get takeTotalMarks => 'Total marks';

  @override
  String get takePassMarkLabel => 'Pass mark';

  @override
  String takeRule1(int minutes) {
    return 'The timer starts as soon as you press Start and runs for $minutes minutes — it keeps running even if you leave or close the app.';
  }

  @override
  String get takeRule2 =>
      'Your answers are saved automatically on this device. If you come back, you\'ll continue where you left off.';

  @override
  String get takeRule3 => 'Use the same device for the whole exam.';

  @override
  String get takeRule4 =>
      'When the time runs out, your answers are submitted automatically.';

  @override
  String takeStartBeforeFull(String date) {
    return 'Start before $date. Once started, you get the full duration.';
  }

  @override
  String get takeBeforeYouBegin => 'Before you begin';

  @override
  String get takeStart => 'Start exam';

  @override
  String get resultPassed => 'Congratulations! You passed.';

  @override
  String get resultGrading => 'Your written answers are being graded.';

  @override
  String get resultFailed =>
      'You did not pass. Review your answers and try again.';

  @override
  String resultPassDuration(int mark, int minutes) {
    return 'Pass mark: $mark% • Duration: $minutes mins';
  }

  @override
  String get resultScore => 'Score';

  @override
  String get resultAttempts => 'Attempts';

  @override
  String get resultTimeTaken => 'Time taken';

  @override
  String resultMinutesShort(int count) {
    return '${count}m';
  }

  @override
  String get resultHistory => 'Attempt history';

  @override
  String resultShowHistory(int count) {
    return 'Show attempt history ($count)';
  }

  @override
  String get resultHideHistory => 'Hide attempt history';

  @override
  String get resultReview => 'Question review';

  @override
  String get resultReviewHint => 'Review your answers and the correct answers.';

  @override
  String get resultNoAttempts => 'No attempts found.';

  @override
  String resultShowingAttempt(int number) {
    return 'Showing answers from attempt #$number.';
  }

  @override
  String resultBestScore(String score, int total, int number) {
    return 'Best score: $score/$total (attempt #$number)';
  }

  @override
  String resultPassedEarlier(int number) {
    return 'You didn\'t pass this attempt, but you already passed in attempt #$number.';
  }

  @override
  String resultSummaryTitle(int number) {
    return 'Attempt #$number summary';
  }

  @override
  String get resultTotalQuestions => 'Questions';

  @override
  String get resultAnswered => 'Answered';

  @override
  String get resultUnanswered => 'Unanswered';

  @override
  String get resultMarksDeducted => 'Negative marks';

  @override
  String get resultRetake => 'Retake exam';

  @override
  String resultAwarded(String awarded, int total) {
    return '$awarded of $total awarded';
  }

  @override
  String get resultAwaitingGrading => 'Awaiting grading';

  @override
  String get resultCorrect => 'Correct';

  @override
  String get resultPartial => 'Partially correct';

  @override
  String get resultIncorrect => 'Incorrect';

  @override
  String get resultYourAnswer => 'Your answer';

  @override
  String get resultSuggestedAnswer => 'Suggested answer';

  @override
  String get resultCorrectAnswer => 'Correct answer';

  @override
  String get resultExplanation => 'Explanation';

  @override
  String resultAttempt(int number) {
    return 'Attempt #$number';
  }

  @override
  String get resultLoadFailed => 'Failed to load result.';

  @override
  String get resultPending => 'PENDING';

  @override
  String get resultPassedBadge => 'PASSED';

  @override
  String get resultFailedBadge => 'FAILED';

  @override
  String get certSelectProfile =>
      'Select a learner profile to view certificates.';

  @override
  String get certLoadFailed => 'Could not load your certificates.';

  @override
  String get certEyebrow => 'YOUR ACHIEVEMENTS';

  @override
  String get certTitle => 'My Certificates';

  @override
  String get certSubtitle =>
      'View, verify, and save certificates from your courses.';

  @override
  String get certSearch => 'Search course, exam, or verification code...';

  @override
  String get certEmpty => 'No certificates yet';

  @override
  String get certNoMatch => 'No certificates match your search';

  @override
  String get certEmptyHint => 'Certificates you earn will appear here.';

  @override
  String get certNoMatchHint => 'Try a different search or certificate type.';

  @override
  String certShowing(int shown, int total) {
    return 'Showing $shown of $total certificates';
  }

  @override
  String get certDateUnavailable => 'Date unavailable';

  @override
  String get certValid => 'Valid';

  @override
  String certIssued(String date) {
    return 'Issued $date';
  }

  @override
  String certResult(String score, int total) {
    return 'Result: $score / $total';
  }

  @override
  String get certPassed => 'Passed';

  @override
  String get certNotPassed => 'Not passed';

  @override
  String get certHide => 'Hide';

  @override
  String get certPreview => 'Preview';

  @override
  String get certSavePdf => 'Save PDF';

  @override
  String get certAchievement => 'CERTIFICATE OF ACHIEVEMENT';

  @override
  String get certPresentedTo => 'Presented to';

  @override
  String get certFor => 'For';

  @override
  String certProgress(int progress) {
    return 'Course progress $progress%';
  }

  @override
  String certId(String id) {
    return 'Certificate ID: $id';
  }

  @override
  String certCode(String code) {
    return 'Verification code: $code';
  }

  @override
  String get certCodeCopied => 'Verification code copied';

  @override
  String get certCopyCode => 'Copy code';

  @override
  String get certPdfFailed => 'Could not open PDF preview.';

  @override
  String get certAllTypes => 'All types';

  @override
  String get certTypeAttendance => 'Attendance';

  @override
  String get certTypeCompletion => 'Completion';

  @override
  String get certTypeCourseCompletion => 'Course Completion';

  @override
  String get certTypeExam => 'Exam';

  @override
  String get wishlistRemoved => 'Removed from wishlist';

  @override
  String get wishlistRemoveFailed => 'Failed to remove from wishlist';

  @override
  String get wishlistSelectProfile =>
      'Select a learner profile to view your wishlist.';

  @override
  String get wishlistLoadFailed => 'Failed to load wishlist';

  @override
  String get wishlistTitle => 'Wishlist';

  @override
  String wishlistCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count courses saved for later',
      one: '$count course saved for later',
    );
    return '$_temp0';
  }

  @override
  String get wishlistEmpty => 'Your wishlist is empty';

  @override
  String get wishlistEmptyBody =>
      'Save courses you like and come back to them here.';

  @override
  String get wishlistCourse => 'Course';

  @override
  String get wishlistViewDetails => 'View course details';

  @override
  String get formatSelfPaced => 'Self-paced';

  @override
  String get formatLive => 'Live class';

  @override
  String get notifTitle => 'Notifications';

  @override
  String get notifMarkReadFailed => 'Could not mark as read';

  @override
  String get notifMarkAllRead => 'Mark all read';

  @override
  String notifUnread(int count) {
    return '$count unread';
  }

  @override
  String get notifLoadFailed => 'Could not load notifications.';

  @override
  String get notifTapRetry => 'Tap to retry';

  @override
  String get notifCaughtUp => 'You\'re all caught up.';

  @override
  String get notifRemoveFailed => 'Could not remove notification';

  @override
  String get notifJustNow => 'Just now';

  @override
  String notifMinutesAgo(int count) {
    return '${count}m ago';
  }

  @override
  String notifHoursAgo(int count) {
    return '${count}h ago';
  }

  @override
  String notifDaysAgo(int count) {
    return '${count}d ago';
  }

  @override
  String get notifView => 'View';

  @override
  String notifBellUnread(int count) {
    return 'Notifications, $count unread';
  }

  @override
  String get chatNoCourse => 'Course not specified.';

  @override
  String get chatSelectProfile =>
      'Select a learner profile to join this class chat.';

  @override
  String get chatConnectFailed =>
      'Unable to connect to class chat. Please try again.';

  @override
  String get chatTooLong => 'Messages can be up to 2,000 characters.';

  @override
  String get chatReportTitle => 'Report message';

  @override
  String get chatReportWhy => 'Why should this message be reviewed?';

  @override
  String get chatReportHint => 'Explain the issue...';

  @override
  String get chatSubmitReport => 'Submit report';

  @override
  String get chatReported => 'Message reported for review.';

  @override
  String get chatReportFailed =>
      'Could not report the message. Please try again.';

  @override
  String chatClassChat(String batch) {
    return '$batch • Class chat';
  }

  @override
  String get chatDismiss => 'Dismiss';

  @override
  String get chatRetry => 'Retry';

  @override
  String get chatPlaceholder => 'Type a message...';

  @override
  String get chatConnecting => 'Connecting...';

  @override
  String get chatSend => 'Send message';

  @override
  String get chatLive => 'Live';

  @override
  String get chatOffline => 'Offline';

  @override
  String get chatNextClass => 'Next Live Class';

  @override
  String get chatJoinClass => 'Join class';

  @override
  String get chatEmpty => 'No messages yet. Say hello to your classmates!';

  @override
  String get chatInstructor => 'INSTRUCTOR';

  @override
  String get chatMessageActions => 'Message actions';

  @override
  String get chatTimeTba => 'Time to be announced';

  @override
  String chatDateAt(String date, String time) {
    return '$date at $time';
  }

  @override
  String get familyTitle => 'Your learners\' profiles';

  @override
  String get familyAddProfile => 'Add profile';

  @override
  String get familyEmpty =>
      'No learner profiles yet. Add a profile to get started.';

  @override
  String get familySubscribed => 'Subscribed';

  @override
  String get familySubscription => 'Subscription';

  @override
  String get familySubscribe => 'Subscribe';

  @override
  String get commonEdit => 'Edit';

  @override
  String get pinReset => 'Reset PIN';

  @override
  String get pinSet => 'Set PIN';

  @override
  String get imageInvalidType => 'Choose a JPEG, PNG, WebP, or GIF image.';

  @override
  String get imageTooLarge => 'Image must be 5 MB or smaller';

  @override
  String get imagePickerFailed => 'Could not open your photo library.';

  @override
  String get learnerChooseDob => 'Choose a date of birth.';

  @override
  String get learnerPhotoUploadFailed =>
      'Learner created, but the photo could not be uploaded. You can add it from profile management.';

  @override
  String get learnerCreateFailed => 'Failed to create profile';

  @override
  String get learnerAddTitle => 'Add a learner';

  @override
  String get learnerAddPhoto => 'Add profile picture';

  @override
  String get learnerChangePhoto => 'Change profile picture';

  @override
  String get learnerRemovePhoto => 'Remove photo';

  @override
  String get learnerAddPhotoOptional => 'Add a profile photo (optional)';

  @override
  String get learnerName => 'Learner\'s name';

  @override
  String get learnerNameRequired => 'Name is required';

  @override
  String get learnerNameTooLong => 'Enter a name up to 100 characters.';

  @override
  String get learnerDob => 'Date of birth';

  @override
  String get learnerPinOptional => '4-digit PIN (optional)';

  @override
  String get learnerPinFormat => 'PIN must be exactly 4 digits';

  @override
  String get learnerPinMismatch => 'PINs do not match';

  @override
  String get learnerCreate => 'Add learner';

  @override
  String get learnerLoadFailed => 'Could not load learner profile.';

  @override
  String get learnerUpdateFailed => 'Failed to update profile';

  @override
  String get learnerNotFound => 'Profile not found';

  @override
  String learnerEditTitle(String name) {
    return 'Edit $name\'s profile';
  }

  @override
  String get learnerNameLocked =>
      'Name is locked because a certificate has been issued.';

  @override
  String get learnerCancelPinChange => 'Cancel PIN change';

  @override
  String get learnerNewPin => 'New 4-digit PIN';

  @override
  String get learnerConfirmNewPin => 'Confirm new PIN';

  @override
  String get commonSaving => 'Saving...';

  @override
  String get learnerSaveChanges => 'Save changes';

  @override
  String get deleteFailed => 'Failed to delete profile';

  @override
  String deleteTitle(String name) {
    return 'Delete $name\'s profile?';
  }

  @override
  String get deleteDestroyed => 'This will be destroyed:';

  @override
  String get deleteDestroyedItems =>
      'Progress, enrolments, exam results, and chat messages.';

  @override
  String get deleteSurvives => 'This will be kept:';

  @override
  String get deleteSurvivesItems => 'Certificates and moderation records.';

  @override
  String deleteTypeName(String name) {
    return 'Type $name to confirm';
  }

  @override
  String get deleteDeleting => 'Deleting…';

  @override
  String get deleteConfirm => 'Delete profile';

  @override
  String get deleteGoBack => 'No, go back';

  @override
  String get avatarLabel => 'Learner avatar';

  @override
  String get secServerUnreachable =>
      'Couldn\'t reach the server. Check your internet connection and try again.';

  @override
  String get secTooManyAttempts =>
      'Too many attempts. Please wait a moment and try again.';

  @override
  String get secTitle => 'Login & security';

  @override
  String get secEmailRequired => 'Enter your new email address.';

  @override
  String get secEmailInvalid =>
      'Enter a valid email address, like name@example.com.';

  @override
  String get secEmailSame => 'This is already your email address.';

  @override
  String get secConfirmWithPassword =>
      'Enter your current password to confirm.';

  @override
  String get secEmailUpdated =>
      'Email updated. Check your new inbox for a verification link.';

  @override
  String get secEmailUpdateFailed =>
      'We couldn\'t update your email. Please try again.';

  @override
  String get secEmail => 'Email';

  @override
  String get secEmailLoadFailed => 'Couldn\'t load your email.';

  @override
  String get secRetry => 'Retry';

  @override
  String get secLoadingEmail => 'Loading account email…';

  @override
  String get secUnverified =>
      'Unverified — check your email for a verification link';

  @override
  String get secVerified => 'Verified ✓';

  @override
  String get secChangeEmail => 'Change email';

  @override
  String get secNewEmail => 'New email';

  @override
  String get secCurrentPassword => 'Current password';

  @override
  String get secPasswordConfirmHint =>
      'We ask for your password to confirm it\'s you.';

  @override
  String get secSaveEmail => 'Save email';

  @override
  String get secEmailChangeNote =>
      'You\'ll need to verify your new email before it takes effect. Your account stays fully active in the meantime.';

  @override
  String get secCurrentRequired => 'Enter your current password.';

  @override
  String get secNewRequired => 'Enter a new password.';

  @override
  String secTooShort(String min, int remaining) {
    return 'Use at least $min characters ($remaining more).';
  }

  @override
  String secTooLong(String max) {
    return 'Use $max characters or fewer.';
  }

  @override
  String get secSameAsCurrent =>
      'Choose a password different from your current one.';

  @override
  String get secConfirmRequired => 'Re-enter your new password.';

  @override
  String get secMismatch => 'Passwords don\'t match.';

  @override
  String get secPasswordUpdated =>
      'Password updated. Use your new password the next time you log in.';

  @override
  String get secPasswordUpdateFailed =>
      'We couldn\'t update your password. Please try again.';

  @override
  String get secPassword => 'Password';

  @override
  String get secChangePassword => 'Change password';

  @override
  String get secNewPassword => 'New password';

  @override
  String secReqLength(String min) {
    return 'At least $min characters';
  }

  @override
  String get secReqDifferent => 'Different from your current password';

  @override
  String get secConfirmPassword => 'Confirm new password';

  @override
  String get secPasswordsMatch => 'Passwords match';

  @override
  String get secPasswordsDontMatchYet => 'Passwords don\'t match yet';

  @override
  String get secSavePassword => 'Save password';

  @override
  String get commonOptional => 'optional';

  @override
  String get commonCopied => 'Copied';

  @override
  String commonAge(String age) {
    return 'Age $age';
  }

  @override
  String get commonImageUploadFailed => 'Failed to upload the image';

  @override
  String get commonRemoveImage => 'Remove image';

  @override
  String get commonAddImage => 'Add image';

  @override
  String get commonUploading => 'Uploading...';

  @override
  String get commonSubmit => 'Submit';

  @override
  String get subTitle => 'Subscription';

  @override
  String get subIntro =>
      'Each learner profile needs its own subscription to enrol in courses. A subscription lasts one month from approval.';

  @override
  String get subLoadFailed => 'Failed to load your subscription';

  @override
  String get subHowToPay => 'How to pay';

  @override
  String get subHowToPayBody =>
      'Send the payment to one of these accounts, then apply for each profile with your transaction details.';

  @override
  String get subPerProfileMonth => 'per profile · one month';

  @override
  String get subNoPaymentDetails =>
      'Payment details haven\'t been added yet. Please contact support.';

  @override
  String get subCopyAccountNumber => 'Copy account number';

  @override
  String get subTypeBank => 'Bank transfer';

  @override
  String get subTypeMobile => 'Mobile banking';

  @override
  String get subTypeOther => 'Other';

  @override
  String get subBadgeSubscribed => 'SUBSCRIBED';

  @override
  String get subBadgeUnderReview => 'UNDER REVIEW';

  @override
  String get subBadgeNotSubscribed => 'NOT SUBSCRIBED';

  @override
  String subSubscribedUntil(String date) {
    return 'Subscribed until $date';
  }

  @override
  String get subRenewalUnderReview => 'Renewal payment under review';

  @override
  String get subPaymentUnderReview =>
      'Payment under review — usually within a day';

  @override
  String get subSubscribeToEnrol => 'Subscribe to enrol in courses';

  @override
  String get subLastRejected => 'Last payment wasn\'t approved.';

  @override
  String subLastRejectedReason(String reason) {
    return 'Last payment wasn\'t approved: $reason';
  }

  @override
  String subWaiverReady(int percent) {
    return '$percent% fee waiver ready';
  }

  @override
  String subWaiverReadyUseBy(int percent, String date) {
    return '$percent% fee waiver ready — use by $date';
  }

  @override
  String get subWaiverUnderReview => 'Fee waiver request under review';

  @override
  String subWaiverRejected(String reason) {
    return 'Waiver not approved: $reason.';
  }

  @override
  String get subRequestWaiver => 'Need help with the fee? Request a waiver';

  @override
  String get subWaiverLimit => 'Waiver limit reached for this year';

  @override
  String subWaiverLimitNext(String date) {
    return 'Waiver limit reached for this year (next on $date)';
  }

  @override
  String get subCancelRequest => 'Cancel request';

  @override
  String get subRenew => 'Renew';

  @override
  String get subApply => 'Apply for subscription';

  @override
  String get subLearnerProfiles => 'Learner profiles';

  @override
  String subSubscribedCount(int count, int total) {
    return '$count of $total subscribed';
  }

  @override
  String subUnderReviewCount(int count) {
    return '$count under review';
  }

  @override
  String get subAddProfileToSubscribe => 'Add a learner profile to subscribe.';

  @override
  String get subCancelTitle => 'Cancel this request?';

  @override
  String subCancelBody(String name) {
    return 'The payment for $name won\'t be reviewed. You can submit it again later.';
  }

  @override
  String get subKeepIt => 'Keep it';

  @override
  String get subCancelled => 'Request cancelled';

  @override
  String get subCancelFailed => 'Failed to cancel the request';

  @override
  String get subPaymentHistory => 'Payment history';

  @override
  String get subFeeWaivers => 'Fee waivers';

  @override
  String subWaiverPercent(int percent) {
    return '$percent% waiver';
  }

  @override
  String subSubmittedOn(String date) {
    return 'Submitted $date';
  }

  @override
  String subUntil(String date) {
    return 'Until $date';
  }

  @override
  String get subReqUnderReview => 'Under review';

  @override
  String get subReqApproved => 'Approved';

  @override
  String get subReqRejected => 'Rejected';

  @override
  String get subReqCancelled => 'Cancelled';

  @override
  String subWaiverOff(int percent) {
    return '$percent% off one month';
  }

  @override
  String subRequestedOn(String date) {
    return 'Requested $date';
  }

  @override
  String subUseBy(String date) {
    return 'Use by $date';
  }

  @override
  String subUsedOn(String date) {
    return 'Used $date';
  }

  @override
  String get subWaiverReadyToUse => 'Ready to use';

  @override
  String get subWaiverUsed => 'Used';

  @override
  String get subWaiverNotApproved => 'Not approved';

  @override
  String get subWaiverExpired => 'Expired';

  @override
  String get subWaiverWithdrawn => 'Withdrawn';

  @override
  String subSubmittedPayment(String name) {
    return 'Payment submitted. We\'ll subscribe $name once it\'s verified.';
  }

  @override
  String get subWaiverSent =>
      'Waiver request sent. We\'ll email you once it\'s reviewed.';

  @override
  String applyRenewTitle(String name) {
    return 'Renew $name\'s subscription';
  }

  @override
  String applyApplyTitle(String name) {
    return 'Apply for $name\'s subscription';
  }

  @override
  String applyFullyWaivedBody(String name) {
    return '$name\'s fee waiver covers the whole month, so no payment is needed. An admin will approve it and subscribe $name for one month.';
  }

  @override
  String applyPaymentBody(String amount, String name) {
    return 'Enter the details of your $amount payment. An admin will check it and subscribe $name for one month.';
  }

  @override
  String applyWaiverApplied(int percent) {
    return '$percent% fee waiver applied';
  }

  @override
  String get applyNothingToPay => 'Nothing to pay this month.';

  @override
  String get applyWaiverUsedNote =>
      'The waiver is used once this subscription is approved.';

  @override
  String get applyPaidTo => 'Paid to';

  @override
  String applyAmount(String currency) {
    return 'Amount ($currency)';
  }

  @override
  String get applyAmountRequired => 'Enter the amount paid';

  @override
  String get applyPaymentDate => 'Payment date';

  @override
  String get applyTransactionId => 'Transaction ID / reference';

  @override
  String get applyTransactionIdHint => 'e.g. 9KD7X2LQ1P';

  @override
  String get applyTransactionIdRequired => 'Enter the transaction ID';

  @override
  String get applyPaidFrom => 'Paid from';

  @override
  String get applyPaidFromHint => 'Your account or mobile number';

  @override
  String get applyNote => 'Note';

  @override
  String get applyProof => 'Payment screenshot / receipt';

  @override
  String get applySubmitPayment => 'Submit payment';

  @override
  String get applySubmitFailed => 'Failed to submit your payment';

  @override
  String waiverTitle(String name) {
    return 'Request a fee waiver for $name';
  }

  @override
  String waiverBody(String name) {
    return 'If paying the full fee is difficult, tell us about your situation. If approved, you\'ll get 25–100% off $name\'s next one-month subscription, to use within 30 days.';
  }

  @override
  String get waiverSituation => 'Your situation';

  @override
  String get waiverSituationHint =>
      'e.g. family income, number of children studying, recent changes in circumstances…';

  @override
  String waiverMinChars(String min) {
    return 'Please write at least $min characters';
  }

  @override
  String waiverDocuments(String max) {
    return 'Supporting documents (optional, up to $max images)';
  }

  @override
  String waiverRemaining(int count, String name) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count more times',
      one: '$count more time',
    );
    return 'You can request $_temp0 for $name in the next 12 months.';
  }

  @override
  String get waiverSend => 'Send request';

  @override
  String get waiverFailed => 'Failed to submit the waiver request';

  @override
  String get dashChooseProfile =>
      'Choose a learner profile to view this dashboard.';

  @override
  String get dashChooseProfileButton => 'Choose profile';

  @override
  String get dashLoadFailed => 'Failed to load dashboard';

  @override
  String dashGreetingMorning(String name) {
    return 'Good morning, $name';
  }

  @override
  String dashGreetingAfternoon(String name) {
    return 'Good afternoon, $name';
  }

  @override
  String dashGreetingEvening(String name) {
    return 'Good evening, $name';
  }

  @override
  String get dashFindFirstCourse => 'Find your first course to start learning.';

  @override
  String get dashNiceWork => 'Nice work today — keep the momentum going.';

  @override
  String get dashPickUp => 'Pick up where you left off.';

  @override
  String get dashClassLiveNow => 'Your class is live now';

  @override
  String dashClassStartsAt(String time) {
    return 'Your class starts at $time';
  }

  @override
  String get dashJoin => 'Join';

  @override
  String get dashView => 'View';

  @override
  String get dashStatInProgress => 'Courses in progress';

  @override
  String dashStatCompletedCount(int count) {
    return '$count completed';
  }

  @override
  String get dashStatLessons => 'Lessons completed';

  @override
  String dashStatThisWeek(int count) {
    return '$count this week';
  }

  @override
  String get dashStatCertificates => 'Certificates earned';

  @override
  String get dashStatViewCertificates => 'View certificates';

  @override
  String get dashStatStreak => 'Day streak';

  @override
  String get dashStatKeepStreak => 'Study today to keep it going';

  @override
  String dashStatBest(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count days',
      one: '$count day',
    );
    return 'Best: $_temp0';
  }

  @override
  String get dashContinueTitle => 'Continue learning';

  @override
  String get dashViewAll => 'View all';

  @override
  String get dashAllFinished => 'You\'ve finished all your courses!';

  @override
  String get dashNotStarted => 'You haven\'t started a course yet';

  @override
  String get dashBrowseCourses => 'Browse courses';

  @override
  String dashNext(String title) {
    return 'Next: $title';
  }

  @override
  String get dashLiveOnline => 'Live online class';

  @override
  String get dashNoLessons => 'No lessons yet';

  @override
  String get dashSchedule => 'Schedule';

  @override
  String get dashResume => 'Resume';

  @override
  String get dashStart => 'Start';

  @override
  String get dashLiveTitle => 'Upcoming live classes';

  @override
  String get dashLiveNone => 'No upcoming live classes.';

  @override
  String get dashLiveNow => 'Live now';

  @override
  String get dashDeadlinesTitle => 'Deadlines';

  @override
  String get dashDeadlinesNone => 'Nothing due — you\'re all set.';

  @override
  String get dashDueToday => 'Due today';

  @override
  String get dashDueTomorrow => 'Due tomorrow';

  @override
  String dashDueIn(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count days',
      one: '$count day',
    );
    return 'Due in $_temp0';
  }

  @override
  String get dashExam => 'Exam';

  @override
  String get dashAssignment => 'Assignment';

  @override
  String get dashActivityTitle => 'Your activity';

  @override
  String dashActivitySubtitle(int total, int weeks) {
    return 'Lessons completed per week · $total in the last $weeks weeks';
  }

  @override
  String get dashThisWeekShort => 'This wk';

  @override
  String get dashResultsTitle => 'Recent results';

  @override
  String get dashResultsNone =>
      'Your exam and assignment results will appear here.';

  @override
  String get dashResultPassed => 'Passed';

  @override
  String get dashResultFailed => 'Not passed';

  @override
  String get dashResultGraded => 'Graded';

  @override
  String get dashResultAwaiting => 'Awaiting grade';

  @override
  String get dashNotesTitle => 'Recent notes';

  @override
  String get dashRecommended => 'Recommended for you';

  @override
  String get dashBrowseAll => 'Browse all';

  @override
  String get dashLiveBadge => 'LIVE';

  @override
  String get dashSwitchProfile => 'Switch Profile';

  @override
  String get dashTimeTba => 'Time TBA';

  @override
  String get helpTitle => 'Help & Support';

  @override
  String get helpFaq => 'Frequently asked questions';

  @override
  String get helpSearch => 'Search questions…';

  @override
  String helpNoMatch(String query) {
    return 'No questions match “$query”.';
  }

  @override
  String get helpNone => 'No questions have been published yet.';

  @override
  String get helpContactUs => 'Contact us';

  @override
  String get helpPolicies => 'Policies';

  @override
  String get pageUnavailable => 'This page isn\'t available right now.';

  @override
  String pageUpdated(String date) {
    return 'Last updated $date';
  }

  @override
  String get languageChangeTo => 'Change language';
}
