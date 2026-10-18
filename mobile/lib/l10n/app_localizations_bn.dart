// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Bengali Bangla (`bn`).
class AppLocalizationsBn extends AppLocalizations {
  AppLocalizationsBn([String locale = 'bn']) : super(locale);

  @override
  String get commonCancel => 'বাতিল';

  @override
  String get commonContinue => 'চালিয়ে যান';

  @override
  String get commonTryAgain => 'আবার চেষ্টা করুন';

  @override
  String get commonSending => 'পাঠানো হচ্ছে...';

  @override
  String get commonClose => 'বন্ধ করুন';

  @override
  String get commonSave => 'সংরক্ষণ করুন';

  @override
  String get commonDelete => 'মুছে ফেলুন';

  @override
  String get commonOr => 'অথবা';

  @override
  String get commonLearner => 'শিক্ষার্থী';

  @override
  String get commonAdult => 'প্রাপ্তবয়স্ক';

  @override
  String commonAgeRange(String min, String max) {
    return 'বয়স $min–$max';
  }

  @override
  String commonAgeUnder(String max) {
    return '$max বছর বা তার কম';
  }

  @override
  String get commonNotSubscribed => 'সাবস্ক্রাইব করা নেই';

  @override
  String get commonConnectionError =>
      'সংযোগ করা যাচ্ছে না। ইন্টারনেট সংযোগ দেখুন।';

  @override
  String get commonLogoLabel => '3i International Islamic Institute লোগো';

  @override
  String get commonInstituteName => 'ইন্টারন্যাশনাল ইসলামিক ইনস্টিটিউট';

  @override
  String get languageLabel => 'ভাষা';

  @override
  String get languageSettingBody => 'ওয়েবসাইট, অ্যাপ ও ইমেইলে ব্যবহৃত ভাষা';

  @override
  String get languageSaveFailed =>
      'আপনার অ্যাকাউন্টে ভাষা সংরক্ষণ করা যায়নি। পরের বার সাইন ইন করলে এটি আগের অবস্থায় ফিরে যাবে।';

  @override
  String get authEmailLabel => 'ইমেইল ঠিকানা';

  @override
  String get authPasswordLabel => 'পাসওয়ার্ড';

  @override
  String get authShowPassword => 'পাসওয়ার্ড দেখান';

  @override
  String get authHidePassword => 'পাসওয়ার্ড লুকান';

  @override
  String get authEmailInvalid => 'সঠিক ইমেইল ঠিকানা লিখুন';

  @override
  String get authPasswordRequired => 'পাসওয়ার্ড দিন';

  @override
  String get authPasswordMin => 'পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে';

  @override
  String get authPasswordMax => 'পাসওয়ার্ড সর্বোচ্চ ১২৮ অক্ষরের হতে পারে';

  @override
  String get authBackToLogin => 'লগ ইনে ফিরে যান';

  @override
  String get authGoToLogin => 'লগ ইনে যান';

  @override
  String get authSelectDate => 'তারিখ বেছে নিন';

  @override
  String get authSelectDob => 'আপনার জন্মতারিখ বেছে নিন';

  @override
  String get loginTitle => 'আবার স্বাগতম';

  @override
  String get loginSubtitle => 'লগ ইন করতে আপনার তথ্য দিন।';

  @override
  String get loginForgotPassword => 'পাসওয়ার্ড ভুলে গেছেন?';

  @override
  String get loginSubmit => 'লগ ইন';

  @override
  String get loginFailed => 'লগ ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get loginNewHere => '3i-তে নতুন?';

  @override
  String get loginCreateAccount => 'অ্যাকাউন্ট তৈরি করুন';

  @override
  String get loginInstructorPortal => 'শিক্ষক পোর্টাল';

  @override
  String get registerTitle => 'আপনার যাত্রা শুরু করুন';

  @override
  String get registerSubtitle =>
      'একটি অ্যাকাউন্ট। প্রস্তুত হলে যেকোনো সময় আপনার সন্তানদের যোগ করুন।';

  @override
  String get registerFirstName => 'নামের প্রথম অংশ';

  @override
  String get registerFirstNameHint => 'যেমন: সারা';

  @override
  String get registerLastName => 'নামের শেষ অংশ';

  @override
  String get registerLastNameHint => 'যেমন: আহমেদ';

  @override
  String get registerFirstNameRequired => 'নামের প্রথম অংশ দিন';

  @override
  String get registerLastNameRequired => 'নামের শেষ অংশ দিন';

  @override
  String get registerNameTooLong => 'সর্বোচ্চ ১০০ অক্ষর হতে পারে';

  @override
  String get registerPasswordHint => 'কমপক্ষে ১০টি অক্ষর';

  @override
  String get registerDateOfBirth => 'জন্ম তারিখ';

  @override
  String get registerDateOfBirthHint => 'বয়স ১৮ বা তার বেশি হতে হবে';

  @override
  String get registerDobRequired =>
      'আপনার জন্মতারিখ বেছে নিন। বয়স কমপক্ষে ১৮ হতে হবে।';

  @override
  String get registerLanguage => 'পছন্দের ভাষা';

  @override
  String get registerLanguageHint =>
      'অ্যাপে যে ভাষা ব্যবহার হবে। যেকোনো সময় বদলাতে পারবেন।';

  @override
  String get registerSubmit => 'অ্যাকাউন্ট তৈরি করুন';

  @override
  String get registerFailed => 'নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get registerHaveAccount => 'ইতোমধ্যে অ্যাকাউন্ট আছে?';

  @override
  String get registerLogIn => 'লগ ইন';

  @override
  String get forgotTitle => 'আপনার পাসওয়ার্ড রিসেট করুন';

  @override
  String get forgotSubtitle =>
      'আপনার অ্যাকাউন্টের ইমেইল দিন, আমরা একটি লিঙ্ক পাঠাব।';

  @override
  String get forgotSubmit => 'রিসেট লিঙ্ক পাঠান';

  @override
  String get forgotSentTitle => 'আপনার ইমেইল দেখুন';

  @override
  String get forgotSentBody =>
      'এই ইমেইলে কোনো অ্যাকাউন্ট থাকলে আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠিয়েছি।';

  @override
  String get forgotFailed => 'রিসেট লিঙ্ক পাঠানো যায়নি';

  @override
  String get resetTitle => 'নতুন পাসওয়ার্ড বেছে নিন';

  @override
  String get resetSubtitle =>
      'কমপক্ষে ১০ অক্ষরের একটি নিরাপদ পাসওয়ার্ড বেছে নিন।';

  @override
  String get resetNewPassword => 'নতুন পাসওয়ার্ড';

  @override
  String get resetConfirm => 'নতুন পাসওয়ার্ড নিশ্চিত করুন';

  @override
  String get resetSubmit => 'পাসওয়ার্ড আপডেট করুন';

  @override
  String get resetMismatch => 'পাসওয়ার্ড মিলছে না';

  @override
  String get resetInvalidLink =>
      'এই পাসওয়ার্ড রিসেট লিংকটি অবৈধ বা অসম্পূর্ণ। নতুন লিংক চান।';

  @override
  String get resetFailed => 'পাসওয়ার্ড রিসেট করা যায়নি';

  @override
  String get resetDoneTitle => 'পাসওয়ার্ড হালনাগাদ হয়েছে';

  @override
  String get resetDoneBody =>
      'আপনার পাসওয়ার্ড হালনাগাদ হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগ ইন করুন।';

  @override
  String get checkEmailTitle => 'আপনার ইমেইল দেখুন';

  @override
  String checkEmailSentTo(String email) {
    return 'আমরা $email-এ একটি যাচাই লিঙ্ক পাঠিয়েছি';
  }

  @override
  String get checkEmailResend => 'আবার ইমেইল পাঠান';

  @override
  String get checkEmailCanResendNow => 'আপনি এখন আবার পাঠাতে পারেন';

  @override
  String checkEmailResendIn(int seconds) {
    return '$seconds সেকেন্ড পরে আবার পাঠাতে পারবেন';
  }

  @override
  String get checkEmailResendFailed => 'ইমেইল আবার পাঠানো যায়নি';

  @override
  String get checkEmailWrongEmail => 'ভুল ইমেইল? ফিরে যান';

  @override
  String get checkEmailBackInstructor => 'শিক্ষক সাইন ইনে ফিরে যান';

  @override
  String get verifyVerifying => 'আপনার ইমেইল যাচাই করা হচ্ছে...';

  @override
  String get verifyPleaseWait =>
      'আপনার ইমেইল যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন।';

  @override
  String get verifyVerifiedTitle => 'ইমেইল যাচাই হয়েছে!';

  @override
  String get verifyVerifiedBody =>
      'আপনার ইমেইল যাচাই হয়েছে। এখন লগ ইন করতে পারেন।';

  @override
  String get verifyExpiredTitle => 'এই লিঙ্কের মেয়াদ শেষ';

  @override
  String get verifyExpiredBody =>
      'যাচাই লিঙ্ক ২৪ ঘণ্টা কার্যকর থাকে। আমরা একই ইমেইলে নতুন লিঙ্ক পাঠাতে পারি।';

  @override
  String get verifyFailedTitle => 'যাচাই ব্যর্থ হয়েছে';

  @override
  String get verifyFailed => 'যাচাই ব্যর্থ হয়েছে';

  @override
  String get verifyInvalidLink => 'যাচাই লিঙ্কটি সঠিক নয়';

  @override
  String get verifyNewLinkTitle => 'নতুন লিংক পাঠানো হয়েছে';

  @override
  String get verifyNewLinkBody =>
      'আপনার ইমেইলে নতুন যাচাই লিঙ্ক পাঠানো হয়েছে। অ্যাকাউন্ট সেটআপ শেষ করতে ২৪ ঘণ্টার মধ্যে এটি খুলুন।';

  @override
  String get verifySendNewLink => 'আমাকে নতুন লিঙ্ক পাঠান';

  @override
  String get verifyNewLinkFailed => 'নতুন লিঙ্ক পাঠানো যায়নি';

  @override
  String get unverifiedTitle => 'আগে আপনার ইমেইল যাচাই করুন';

  @override
  String unverifiedBody(String email) {
    return 'আমরা $email-এ একটি যাচাই লিঙ্ক পাঠিয়েছি। মেয়াদ শেষ হলে বা খুঁজে না পেলে আমরা নতুন একটি পাঠাতে পারি।';
  }

  @override
  String get unverifiedResend => 'যাচাই ইমেইল আবার পাঠান';

  @override
  String get socialContinueGoogle => 'Google দিয়ে চালিয়ে যান';

  @override
  String get socialContinueApple => 'Apple দিয়ে চালিয়ে যান';

  @override
  String get socialSignUpGoogle => 'Google দিয়ে সাইন আপ করুন';

  @override
  String get socialSignUpApple => 'Apple দিয়ে সাইন আপ করুন';

  @override
  String get socialGoogleFailed => 'Google সাইন ইন ব্যর্থ হয়েছে';

  @override
  String get socialAppleFailed => 'Apple সাইন ইন ব্যর্থ হয়েছে';

  @override
  String get socialAppleNoToken => 'Apple থেকে কোনো পরিচয় টোকেন পাওয়া যায়নি';

  @override
  String socialDobRequired(String provider) {
    return '$provider দিয়ে অ্যাকাউন্ট খুলতে আপনার জন্মতারিখ প্রয়োজন।';
  }

  @override
  String get socialCreateTitle => 'আপনার অ্যাকাউন্ট তৈরি করুন';

  @override
  String socialCreateBody(String provider) {
    return 'এই $provider ইমেইলে এখনো কোনো 3i অ্যাকাউন্ট নেই। অ্যাকাউন্ট খুলতে জন্মতারিখ দিন। বয়স কমপক্ষে ১৩ হতে হবে।';
  }

  @override
  String get profilesWhoIsLearning => 'আজ কে শিখছে?';

  @override
  String get profilesEmpty => 'শুরু করতে একটি শিক্ষার্থী প্রোফাইল যোগ করুন।';

  @override
  String get profilesLoadFailed => 'প্রোফাইল লোড করা যায়নি';

  @override
  String get profilesAddLearner => 'শিক্ষার্থী যোগ করুন';

  @override
  String get profilesLogOut => 'লগ আউট';

  @override
  String get pinEnter => 'আপনার ৪ অঙ্কের পিন দিন';

  @override
  String get pinIncorrect => 'পিন মেলেনি। আবার চেষ্টা করুন।';

  @override
  String pinTriesLeft(int count) {
    return 'ভুল পিন। আর $count বার চেষ্টা করতে পারবেন।';
  }

  @override
  String get pinCheckFailed => 'পিন যাচাই করা যায়নি। সংযোগ দেখুন।';

  @override
  String pinTooMany(int seconds) {
    return 'অনেকবার চেষ্টা হয়েছে। $seconds সেকেন্ড পরে আবার চেষ্টা করুন।';
  }

  @override
  String get pinForgot =>
      'পিন ভুলে গেছেন? অ্যাকাউন্টধারীকে \'প্রোফাইল পরিচালনা\' থেকে রিসেট করতে বলুন।';

  @override
  String pinProgress(int filled, int length) {
    return 'পিন, $lengthটির মধ্যে $filledটি অঙ্ক দেওয়া হয়েছে';
  }

  @override
  String get settingsTitle => 'অ্যাকাউন্ট সেটিংস';

  @override
  String get settingsFamilyTitle => 'পরিবার ও প্রোফাইল';

  @override
  String get settingsFamilyBody => 'শিক্ষার্থীর প্রোফাইল ও পিন পরিচালনা করুন';

  @override
  String get settingsDevicesTitle => 'ডিভাইস';

  @override
  String get settingsDevicesBody => 'ডিভাইস পরিচালনা ওয়েবসাইটে করা যায়';

  @override
  String get settingsSubscriptionTitle => 'সাবস্ক্রিপশন ও পেমেন্ট';

  @override
  String get settingsSubscriptionBody =>
      'প্রতিটি শিক্ষার্থীর সাবস্ক্রিপশনের পেমেন্ট ও নবায়ন করুন';

  @override
  String get settingsSecurityTitle => 'লগ ইন ও নিরাপত্তা';

  @override
  String get settingsSecurityBody => 'আপনার ইমেইল ও পাসওয়ার্ড আপডেট করুন';

  @override
  String get menuAccount => 'ব্যবহারকারী মেনু';

  @override
  String get menuSwitchLearner => 'শিক্ষার্থী প্রোফাইল বদলান';

  @override
  String get menuFamily => 'পরিবার ও প্রোফাইল';

  @override
  String get menuSubscription => 'সাবস্ক্রিপশন';

  @override
  String get menuManageAccount => 'অ্যাকাউন্ট পরিচালনা';

  @override
  String get menuLogOut => 'লগ আউট';

  @override
  String get menuCourses => 'কোর্স';

  @override
  String get menuHelp => 'সাহায্য ও সহায়তা';

  @override
  String get menuLearnerProfile => 'শিক্ষার্থী প্রোফাইল';

  @override
  String dashboardGreeting(String name) {
    return 'আসসালামু আলাইকুম, $name';
  }

  @override
  String get dashboardWelcomeBack => 'আপনার ড্যাশবোর্ডে আবার স্বাগতম';

  @override
  String get dashboardSearchCourses => 'কোর্স খুঁজুন';

  @override
  String get dashboardExploreCourses => 'কোর্স দেখুন';

  @override
  String get navDashboard => 'ড্যাশবোর্ড';

  @override
  String get navRegularCourses => 'নিয়মিত কোর্স';

  @override
  String get navOnlineClasses => 'অনলাইন ক্লাস';

  @override
  String get navAssignments => 'অ্যাসাইনমেন্ট';

  @override
  String get navExams => 'পরীক্ষা';

  @override
  String get navCertificates => 'সার্টিফিকেট';

  @override
  String get navWishlist => 'পছন্দের তালিকা';

  @override
  String get coursesTitle => 'কোর্স';

  @override
  String get coursesSearch => 'কোর্স, শিক্ষক বা বিষয় খুঁজুন...';

  @override
  String get coursesClearSearch => 'খোঁজা মুছুন';

  @override
  String get coursesLoading => 'কোর্স লোড হচ্ছে...';

  @override
  String get coursesLoadFailed => 'কোর্স লোড করা যায়নি।';

  @override
  String coursesCount(int count) {
    return '$countটি কোর্স';
  }

  @override
  String get coursesCategory => 'বিভাগ';

  @override
  String get coursesAllCategories => 'সব বিভাগ';

  @override
  String get coursesType => 'ধরন';

  @override
  String get coursesAllTypes => 'সব ধরন';

  @override
  String get coursesTypeRegular => 'নিয়মিত';

  @override
  String get coursesTypeLive => 'অনলাইন ক্লাস';

  @override
  String get coursesTypeHybrid => 'হাইব্রিড';

  @override
  String get coursesLanguage => 'ভাষা';

  @override
  String get coursesAllLanguages => 'সব ভাষা';

  @override
  String get coursesAge => 'বয়স';

  @override
  String get coursesSort => 'সাজান';

  @override
  String get coursesSortPopularity => 'প্রাসঙ্গিকতা';

  @override
  String get coursesSortNewest => 'সবচেয়ে নতুন';

  @override
  String get coursesSortRating => 'সর্বোচ্চ রেটিং';

  @override
  String get coursesSortTitle => 'শিরোনাম (ক-ঝ)';

  @override
  String get coursesClearFilters => 'ফিল্টার মুছুন';

  @override
  String get coursesClearAllFilters => 'সব ফিল্টার মুছুন';

  @override
  String get coursesNoResults =>
      'আপনার ফিল্টারের সাথে মেলে এমন কোনো কোর্স পাওয়া যায়নি।';

  @override
  String coursesPageOf(int page, int total) {
    return 'পৃষ্ঠা $page / $total';
  }

  @override
  String get commonAllAges => 'সব বয়স';

  @override
  String commonAgesFrom(String min) {
    return '$min+ বছর';
  }

  @override
  String get commonNewRating => 'নতুন';

  @override
  String get commonRecommendedAge => 'প্রস্তাবিত বয়সসীমা';

  @override
  String get commonPrevious => 'আগের';

  @override
  String get commonNext => 'পরের';

  @override
  String get courseCardPreview => 'কোর্সের প্রিভিউ';

  @override
  String get wishlistAdd => 'উইশলিস্টে যোগ করুন';

  @override
  String get wishlistRemove => 'উইশলিস্ট থেকে সরান';

  @override
  String get wishlistUpdateFailed => 'উইশলিস্ট হালনাগাদ করা যায়নি।';

  @override
  String get landingHomeLabel => '3i International Islamic Institute হোম';

  @override
  String get landingAccountMenu => 'অ্যাকাউন্ট ও শিক্ষার্থী মেনু';

  @override
  String get landingAccount => 'অ্যাকাউন্ট';

  @override
  String get menuDashboard => 'ড্যাশবোর্ড';

  @override
  String get menuMyCourses => 'আমার কোর্স';

  @override
  String get footerTagline => 'গভীর শিক্ষা। বৈশ্বিক শ্রেণিকক্ষ। এক প্রতিষ্ঠান।';

  @override
  String get footerAbout =>
      'বিজ্ঞান, মানবিক ও পেশাগত বিষয়ে কাঠামোবদ্ধ, স্বীকৃত প্রোগ্রাম — ৪০টি দেশের শিক্ষার্থীদের জন্য।';

  @override
  String footerRights(String year) {
    return '© $year 3i International Islamic Institute। সর্বস্বত্ব সংরক্ষিত।';
  }

  @override
  String get homeWelcome => 'স্বাগতম';

  @override
  String homeWelcomeName(String name) {
    return 'স্বাগতম, $name';
  }

  @override
  String get homeSignedIn => 'আপনি সাইন ইন করেছেন।';

  @override
  String shareText(String title) {
    return '3i International Islamic Institute-এ \"$title\" দেখুন';
  }

  @override
  String get shareDetailsCopied => 'কোর্সের তথ্য কপি হয়েছে';

  @override
  String get shareLinkCopied => 'লিংক কপি হয়েছে';

  @override
  String get levelBeginner => 'প্রাথমিক';

  @override
  String get levelIntermediate => 'মধ্যম';

  @override
  String get levelAdvanced => 'উচ্চতর';

  @override
  String get levelAll => 'সব স্তর';

  @override
  String commonMinutes(int count) {
    return '$count মিনিট';
  }

  @override
  String get commonBackToCourses => 'কোর্সে ফিরে যান';

  @override
  String get detailLearn => 'আপনি যা শিখবেন';

  @override
  String get detailRequirements => 'প্রয়োজনীয়তা';

  @override
  String get detailAbout => 'এই কোর্স সম্পর্কে';

  @override
  String get detailStudentsAlsoTook => 'শিক্ষার্থীরা আরও নিয়েছেন';

  @override
  String detailBreadcrumb(String category) {
    return 'কোর্স  ›  $category';
  }

  @override
  String detailRatingMeta(String rating, int count) {
    return '$rating · $countটি রিভিউ';
  }

  @override
  String get detailInstructedBy => 'শিক্ষক: ';

  @override
  String get detailLoadFailed => 'কোর্স লোড করা যায়নি';

  @override
  String get enrolWaitlisted =>
      'অপেক্ষমাণ তালিকায় যোগ হয়েছে। আসন খালি হলে জানানো হবে।';

  @override
  String get enrolSuccess => 'সফলভাবে ভর্তি হয়েছে';

  @override
  String get enrolFailed => 'ভর্তি ব্যর্থ হয়েছে';

  @override
  String get enrolSubscribe => 'সাবস্ক্রাইব';

  @override
  String get enrolNoBatches => 'এখন কোনো ব্যাচ উপলব্ধ নেই।';

  @override
  String get cardIncluded => 'সদস্যপদে অন্তর্ভুক্ত';

  @override
  String get cardEnrolledTitle => 'আপনি ভর্তি আছেন';

  @override
  String get cardStartToday => 'আজই শেখা শুরু করুন';

  @override
  String cardNotAvailable(String name, String message, String age) {
    return '$name-এর জন্য উপলব্ধ নয়। $message ($name-এর বয়স $age)।';
  }

  @override
  String get cardEnrolNow => 'এখনই ভর্তি হোন';

  @override
  String cardNeedsSubscription(String name) {
    return 'কোর্সে ভর্তি হতে $name-এর সাবস্ক্রিপশন প্রয়োজন।';
  }

  @override
  String get cardSubscribeToEnrol => 'ভর্তির জন্য সাবস্ক্রাইব করুন';

  @override
  String get cardChooseBatch => 'ক্লাস ব্যাচ বেছে নিন';

  @override
  String get cardManageSubscription => 'সাবস্ক্রিপশন পরিচালনা';

  @override
  String get cardWhatsIncluded => 'যা অন্তর্ভুক্ত';

  @override
  String get batchChoose => 'আপনার ব্যাচ বেছে নিন';

  @override
  String get batchChooseBody => 'ভর্তি চালিয়ে যেতে একটি ক্লাস গ্রুপ বেছে নিন।';

  @override
  String get batchSubtitleBody => 'প্রতিটি ব্যাচের সময়সূচি ও সেশন দেখুন।';

  @override
  String batchSessions(int count) {
    return '$countটি সেশন';
  }

  @override
  String batchSeats(int count) {
    return '$countটি আসন';
  }

  @override
  String get batchActive => 'চলমান';

  @override
  String get batchUpcoming => 'আসন্ন';

  @override
  String get batchSessionNotes => 'সেশনের নোট';

  @override
  String get detailSyllabus => 'বিস্তারিত সিলেবাস';

  @override
  String get detailCurriculum => 'পাঠ্যক্রম';

  @override
  String detailLessons(int count) {
    return '$countটি পাঠ';
  }

  @override
  String get detailYourInstructor => 'আপনার শিক্ষক';

  @override
  String detailInstructorStats(int courses, int learners) {
    return '$coursesটি কোর্স · $learners জন শিক্ষার্থী';
  }

  @override
  String get detailReviews => 'শিক্ষার্থীদের রিভিউ';

  @override
  String detailReviewCount(int count) {
    return '$countটি রিভিউ';
  }

  @override
  String get detailEnrolledShare =>
      'আপনি এই কোর্সে ভর্তি আছেন। কেমন চলছে জানান।';

  @override
  String get detailRateReview => 'রেটিং ও রিভিউ দিন';

  @override
  String get detailNoReviews => 'এখনো কোনো রিভিউ নেই।';

  @override
  String get reviewParent => 'অভিভাবক';

  @override
  String get reviewThanks => 'ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।';

  @override
  String get reviewSelectRating => 'একটি রেটিং বেছে নিন।';

  @override
  String get reviewSubmitFailed => 'আপনার রিভিউ জমা দেওয়া যায়নি।';

  @override
  String get reviewTitle => 'এই কোর্সে রেটিং দিন';

  @override
  String reviewSubmittingAs(String name) {
    return '$name হিসেবে জমা দিচ্ছেন';
  }

  @override
  String get reviewYourRating => 'আপনার রেটিং';

  @override
  String reviewStars(int count) {
    return '$count স্টার';
  }

  @override
  String get reviewWrite => 'রিভিউ লিখুন (ঐচ্ছিক)';

  @override
  String get reviewHint => 'এই কোর্সে আপনার অভিজ্ঞতা জানান...';

  @override
  String get reviewSubmit => 'রিভিউ জমা দিন';

  @override
  String get cardReviewCourse => 'কোর্স পুনরায় দেখুন';

  @override
  String get cardContinue => 'শেখা চালিয়ে যান';

  @override
  String get cardStart => 'শেখা শুরু করুন';

  @override
  String get cardComingSoon => 'পাঠ শীঘ্রই আসছে';

  @override
  String get cardClassSchedule => 'ক্লাসের সময়সূচি';

  @override
  String get cardChatRoom => 'চ্যাট রুম';

  @override
  String get cardYourBatch => 'আপনার ব্যাচ';

  @override
  String get cardDashboard => 'ড্যাশবোর্ডে যান';

  @override
  String get cardEnrolled => 'ভর্তি হয়েছে';

  @override
  String get detailFaq => 'সাধারণ প্রশ্ন';

  @override
  String get membershipTitle => 'এক সদস্যপদ। সব কোর্স।';

  @override
  String get membershipAllCourses => 'সব কোর্স';

  @override
  String get membershipAllCoursesBody =>
      'ইসলামি শিক্ষা, ভাষা, বিজ্ঞানসহ নানা বিষয়ে শিখুন।';

  @override
  String get membershipLive => 'লাইভ ক্লাস অন্তর্ভুক্ত';

  @override
  String get membershipLiveBody =>
      'ইন্টারঅ্যাকটিভ সেমিনার ও লাইভ প্রশ্নোত্তরে যোগ দিন।';

  @override
  String get membershipCertificates => 'সার্টিফিকেট অন্তর্ভুক্ত';

  @override
  String get membershipCertificatesBody =>
      'শেখা সম্পন্ন করে সার্টিফিকেট অর্জন করুন।';

  @override
  String get detailShare => 'কোর্সটি শেয়ার করুন';

  @override
  String get learnSelectProfileCourses =>
      'কোর্স দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get learnCoursesLoadFailed => 'আপনার কোর্স লোড করা যায়নি';

  @override
  String get learnRegularTitle => 'নিয়মিত কোর্স';

  @override
  String learnRegularCount(int count) {
    return '$countটি নিজের গতিতে শেখার কোর্স';
  }

  @override
  String get learnSearch => 'কোর্স বা শিক্ষকের নামে খুঁজুন...';

  @override
  String get learnNoRegular => 'এখনো কোনো নিয়মিত কোর্স নেই';

  @override
  String get learnNoRegularBody => 'পরবর্তী পাঠ খুঁজতে কোর্সের তালিকা দেখুন।';

  @override
  String get learnBrowse => 'কোর্স দেখুন';

  @override
  String get learnNoMatch => 'মিলে যাওয়া কোনো কোর্স নেই';

  @override
  String get learnNoMatchBody =>
      'অন্য কোর্স বা শিক্ষকের নাম দিয়ে চেষ্টা করুন।';

  @override
  String learnLessonsProgress(int done, int total) {
    return '$done/$totalটি পাঠ';
  }

  @override
  String get learnNoLessons => 'কোনো পাঠ নেই';

  @override
  String get learnResume => 'আবার শুরু';

  @override
  String get learnStart => 'শেখা শুরু করুন';

  @override
  String get learnExams => 'পরীক্ষা';

  @override
  String get levelAllCaps => 'সব স্তর';

  @override
  String get levelBeginnerCaps => 'প্রাথমিক';

  @override
  String get levelIntermediateCaps => 'মধ্যম';

  @override
  String get levelAdvancedCaps => 'উচ্চতর';

  @override
  String get classesSelectProfile =>
      'লাইভ ক্লাস দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get classesLoadFailed => 'অনলাইন ক্লাস লোড করা যায়নি';

  @override
  String get classesTitle => 'অনলাইন ক্লাস';

  @override
  String classesCount(int count) {
    return '$countটি লাইভ কোর্স';
  }

  @override
  String get classesNone => 'এখনো কোনো লাইভ ক্লাস নেই';

  @override
  String get classesNoneBody => 'ক্লাস খুঁজতে কোর্সের তালিকা দেখুন।';

  @override
  String get classesNoMatch => 'মিলে যাওয়া কোনো ক্লাস নেই';

  @override
  String get classesNoMatchBody =>
      'অন্য কোর্স বা শিক্ষকের নাম দিয়ে চেষ্টা করুন।';

  @override
  String get classesNoUpcoming => 'কোনো আসন্ন সেশন নেই';

  @override
  String get classesBatch => 'ব্যাচ';

  @override
  String get classesChat => 'চ্যাট';

  @override
  String get classesMoreActions => 'আরও কাজ';

  @override
  String get classesDetails => 'বিস্তারিত';

  @override
  String get classesSessions => 'সেশন';

  @override
  String get classesExams => 'পরীক্ষা';

  @override
  String get classesCertificate => 'সার্টিফিকেট';

  @override
  String get classesDateTba => 'তারিখ পরে জানানো হবে';

  @override
  String get scheduleStatusLive => 'এখন লাইভ';

  @override
  String get scheduleStatusSoon => 'শীঘ্রই শুরু';

  @override
  String get scheduleStatusUpcoming => 'আসন্ন';

  @override
  String get scheduleStatusCompleted => 'সম্পন্ন';

  @override
  String get scheduleSectionUpcoming => 'আসন্ন সেশন';

  @override
  String get scheduleSectionCompleted => 'আগের সেশন';

  @override
  String get scheduleSelectProfile =>
      'এই ক্লাসের সময়সূচি দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get scheduleTitle => 'ক্লাসের সময়সূচি';

  @override
  String get scheduleUnavailable => 'ক্লাসের সময়সূচি পাওয়া যাচ্ছে না';

  @override
  String get scheduleUnavailableBody =>
      'এই ব্যাচ লোড করা যায়নি। আপনি হয়তো আর এই ব্যাচে নেই, বা ব্যাচটি আর পাওয়া যায় না।';

  @override
  String scheduleScheduled(int count) {
    return '$countটি সেশন নির্ধারিত';
  }

  @override
  String get scheduleNone => 'এখনো কোনো সেশন নির্ধারিত হয়নি।';

  @override
  String get scheduleNoneHint =>
      'আপনার শিক্ষক এই ব্যাচে এখনো কোনো সেশন যোগ করেননি।';

  @override
  String get scheduleBack => 'অনলাইন ক্লাসে ফিরে যান';

  @override
  String scheduleEnrolledOn(String date) {
    return 'ভর্তি $date';
  }

  @override
  String scheduleSessionNumber(int number) {
    return 'সেশন $number';
  }

  @override
  String get scheduleJoin => 'ক্লাসে যোগ দিন';

  @override
  String get scheduleJoinSoon => 'শীঘ্রই যোগ দিন';

  @override
  String get scheduleNoLink => 'এখনো লিংক নেই';

  @override
  String get scheduleCompleted => 'সম্পন্ন';

  @override
  String get scheduleNotStarted => 'শুরু হয়নি';

  @override
  String get scheduleLinkFailed => 'মিটিং লিংক খোলা যায়নি।';

  @override
  String get lessonReloadFailed => 'আবার লোড করা যায়নি। সংযোগ দেখুন।';

  @override
  String get lessonProgressSaveFailed =>
      'অগ্রগতি সংরক্ষণ করা যায়নি। পরের বার আবার চেষ্টা করা হবে।';

  @override
  String get lessonNoteEmpty => 'নোট খালি রাখা যাবে না';

  @override
  String get lessonNoteSaveFailed =>
      'নোট সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get lessonSelectProfile =>
      'চালিয়ে যেতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get lessonTitle => 'পাঠ';

  @override
  String get lessonLoadFailed => 'কোর্সের পাঠ লোড করা যায়নি।';

  @override
  String get lessonNotInCourse => 'এই পাঠটি কোর্সের অংশ নয়।';

  @override
  String get lessonReload => 'আবার লোড করুন';

  @override
  String get lessonCourseContent => 'কোর্সের বিষয়বস্তু';

  @override
  String get lessonPrevious => 'আগের';

  @override
  String get lessonNext => 'পরের';

  @override
  String lessonCourseName(String title) {
    return 'কোর্স: $title';
  }

  @override
  String get lessonOverview => 'সংক্ষিপ্ত বিবরণ';

  @override
  String get lessonNotes => 'নোট';

  @override
  String get lessonDefaultOverview =>
      'এই পাঠটি শেষ করুন, তারপর বিষয়গুলোর মধ্যে যেতে কোর্স কনটেন্ট বোতাম ব্যবহার করুন।';

  @override
  String get lessonNotesHint => 'এই পাঠের জন্য আপনার নোট লিখুন...';

  @override
  String get lessonSaved => 'সংরক্ষিত';

  @override
  String get lessonSaveNote => 'নোট সংরক্ষণ করুন';

  @override
  String get lessonDocUnavailable => 'ডকুমেন্ট পাওয়া যাচ্ছে না';

  @override
  String get lessonMarkedComplete => 'পাঠ সম্পন্ন হিসেবে চিহ্নিত';

  @override
  String get lessonReadOnlyKeepReading =>
      'শুধু পড়ার জন্য • পাঠটি সম্পন্ন করতে পড়তে থাকুন';

  @override
  String get lessonReadOnlyPdf => 'শুধু পড়ার জন্য PDF';

  @override
  String get lessonMediaUnavailable => 'পাঠের মিডিয়া পাওয়া যাচ্ছে না';

  @override
  String get lessonOpenLinkTitle => 'পাঠের লিংক খুলুন';

  @override
  String get lessonOpenLink => 'লিংক খুলুন';

  @override
  String get lessonPdfFailed =>
      'নথিটি লোড করা যায়নি। সংযোগ দেখে আবার চেষ্টা করুন।';

  @override
  String get lessonReloadPdf => 'PDF আবার লোড করুন';

  @override
  String get videoCheckConnection => 'সংযোগ দেখে আবার চেষ্টা করুন।';

  @override
  String videoCouldNotPlay(String reason) {
    return 'ভিডিও চালানো যায়নি। $reason';
  }

  @override
  String get videoInterrupted => 'প্লেব্যাক থেমে গেছে। আবার চেষ্টা করুন।';

  @override
  String get videoBack10 => '১০ সেকেন্ড পিছনে';

  @override
  String get videoForward10 => '১০ সেকেন্ড সামনে';

  @override
  String get videoSpeed => 'চালানোর গতি';

  @override
  String get videoNormal => 'স্বাভাবিক';

  @override
  String get videoFullScreen => 'পূর্ণ পর্দা';

  @override
  String get videoExitFullScreen => 'পূর্ণ পর্দা থেকে বের হন';

  @override
  String get videoPause => 'বিরতি';

  @override
  String get videoPlay => 'চালান';

  @override
  String get lessonCourseExam => 'কোর্সের পরীক্ষা';

  @override
  String get lessonExamUnlocked =>
      'আপনি কোর্সের ৯০% শেষ করেছেন — এখন পরীক্ষা দিতে পারবেন।';

  @override
  String lessonExamLocked(int progress) {
    return 'পরীক্ষা খুলতে কোর্সের ৯০% শেষ করুন। আপনি এখন $progress%-এ আছেন।';
  }

  @override
  String get lessonCourseProgress => 'কোর্সের অগ্রগতি';

  @override
  String get lessonExamUnlockedShort => 'পরীক্ষা খোলা হয়েছে — শুভকামনা!';

  @override
  String get lessonExamUnlockHint =>
      'কোর্সের ৯০% শেষ হলে পরীক্ষা নিজে থেকেই খুলে যাবে।';

  @override
  String get lessonTakeExam => 'পরীক্ষা দিন';

  @override
  String get lessonLocked => 'লক করা';

  @override
  String get lessonCertificateFailed =>
      'আপনার সার্টিফিকেট তৈরি করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get lessonCourseCertificate => 'কোর্সের সার্টিফিকেট';

  @override
  String get lessonCertificateHint =>
      'আপনার কোর্সের অগ্রগতি ও শেষ পরীক্ষার নম্বরসহ সার্টিফিকেট তৈরি করুন। এটি একবারই করা যাবে।';

  @override
  String get lessonCertificateLocked =>
      'সার্টিফিকেট পেতে অন্তত একবার পরীক্ষা দিন।';

  @override
  String get lessonGenerating => 'তৈরি হচ্ছে...';

  @override
  String get lessonGenerateCertificate => 'সার্টিফিকেট তৈরি করুন';

  @override
  String get lessonPending => 'অপেক্ষমাণ';

  @override
  String get lessonCertificateGenerated => 'সার্টিফিকেট তৈরি হয়েছে';

  @override
  String lessonIssuedOn(String date) {
    return 'প্রদানের তারিখ $date';
  }

  @override
  String get lessonLastExamScore => 'শেষ পরীক্ষার নম্বর';

  @override
  String lessonLatestAttempt(String title) {
    return 'সর্বশেষ চেষ্টা: $title';
  }

  @override
  String lessonAttemptNumber(int number) {
    return 'চেষ্টা #$number';
  }

  @override
  String get lessonVerificationCode => 'যাচাই কোড:';

  @override
  String get lessonDownloadPdf => 'PDF ডাউনলোড করুন';

  @override
  String get commonCheckConnection => 'সংযোগ দেখে আবার চেষ্টা করুন।';

  @override
  String get commonNoCoursesYet => 'এখনো কোনো কোর্সে ভর্তি হননি';

  @override
  String get commonOnlineClassSuffix => ' • অনলাইন ক্লাস';

  @override
  String get assignSelectProfile =>
      'অ্যাসাইনমেন্ট দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get assignTitle => 'অ্যাসাইনমেন্ট';

  @override
  String get assignSelectCourse => 'অ্যাসাইনমেন্ট দেখতে একটি কোর্স বেছে নিন।';

  @override
  String get assignNoCoursesBody =>
      'কোর্স দেখুন ও ভর্তি হন, তাহলে এখানে অ্যাসাইনমেন্ট দেখা যাবে।';

  @override
  String get assignSubmitted => 'অ্যাসাইনমেন্ট জমা হয়েছে';

  @override
  String get assignSubmitFailed => 'অ্যাসাইনমেন্ট জমা দেওয়া যায়নি';

  @override
  String get assignLoadFailed => 'অ্যাসাইনমেন্ট লোড করা যায়নি';

  @override
  String get assignBack => 'অ্যাসাইনমেন্টে ফিরে যান';

  @override
  String assignCount(int count) {
    return 'এই কোর্সে $countটি অ্যাসাইনমেন্ট';
  }

  @override
  String get assignNone => 'এখনো কোনো অ্যাসাইনমেন্ট নেই';

  @override
  String get assignNoneBody => 'এই কোর্সে এখনো কোনো অ্যাসাইনমেন্ট নেই।';

  @override
  String get assignNoDeadline => 'কোনো শেষ তারিখ নেই';

  @override
  String assignDue(String date) {
    return 'শেষ তারিখ: $date';
  }

  @override
  String assignMarks(int count) {
    return '$count নম্বর';
  }

  @override
  String get assignYourSubmission => 'আপনার জমা';

  @override
  String get assignOpenFile => 'সংযুক্ত ফাইল খুলুন';

  @override
  String assignMarksAwarded(String awarded, int total) {
    return 'নম্বর: $awarded/$total';
  }

  @override
  String assignFeedback(String feedback) {
    return 'মতামত: $feedback';
  }

  @override
  String get assignAnswerHint => 'আপনার উত্তর লিখুন...';

  @override
  String get assignSubmitting => 'জমা দেওয়া হচ্ছে...';

  @override
  String get assignSubmit => 'অ্যাসাইনমেন্ট জমা দিন';

  @override
  String get assignFileFailed => 'সংযুক্ত ফাইল খোলা যায়নি।';

  @override
  String get assignGraded => 'মূল্যায়িত';

  @override
  String get assignSubmittedBadge => 'জমা দেওয়া';

  @override
  String get examsSelectProfile =>
      'পরীক্ষা দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get examsSelectProfileFirst =>
      'আগে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get examsTitle => 'পরীক্ষা';

  @override
  String get examsSelectCourse => 'পরীক্ষা দেখতে ও দিতে একটি কোর্স বেছে নিন।';

  @override
  String get examsNoCoursesBody =>
      'কোর্স দেখুন ও ভর্তি হন, তাহলে এখানে পরীক্ষা দেখা যাবে।';

  @override
  String get examsLoadFailed => 'পরীক্ষা লোড করা যায়নি';

  @override
  String get examsBackOnline => 'অনলাইন ক্লাসে ফিরে যান';

  @override
  String get examsBackRegular => 'নিয়মিত কোর্সে ফিরে যান';

  @override
  String examsAvailable(int count) {
    return '$countটি পরীক্ষা আছে';
  }

  @override
  String get examsNone => 'কোনো পরীক্ষা নেই';

  @override
  String get examsNoneBody => 'এই কোর্সে এখনো কোনো পরীক্ষা নেই।';

  @override
  String get examsTypePractice => 'অনুশীলন';

  @override
  String get examsTypeFinal => 'চূড়ান্ত';

  @override
  String get examsPassed => 'উত্তীর্ণ';

  @override
  String get examsInProgress => 'চলমান';

  @override
  String get examsRandomQuestions => 'এলোমেলো প্রশ্ন';

  @override
  String examsQuestions(int count) {
    return '$countটি প্রশ্ন';
  }

  @override
  String examsPassMark(int mark) {
    return 'পাস: $mark%';
  }

  @override
  String examsAttempts(String value) {
    return 'চেষ্টা: $value';
  }

  @override
  String examsBestScore(String score, int total) {
    return 'সেরা নম্বর: $score/$total';
  }

  @override
  String get examsTimeLeft => 'আপনার চেষ্টায় বাকি সময়';

  @override
  String get examsTimesUp => 'সময় শেষ';

  @override
  String get examsTimerRunning => 'টাইমার চলছে — চালিয়ে যেতে আবার শুরু করুন।';

  @override
  String get examsOpenToSubmit => 'সংরক্ষিত উত্তর জমা দিতে পরীক্ষাটি খুলুন।';

  @override
  String get examsStartsIn => 'শুরু হবে';

  @override
  String examsOpens(String date) {
    return 'খুলবে $date';
  }

  @override
  String get examsWindowClosesIn => 'শুরুর সময় শেষ হবে';

  @override
  String examsStartBefore(String date) {
    return '$date-এর আগে শুরু করুন';
  }

  @override
  String get examsViewResult => 'ফলাফল দেখুন';

  @override
  String get examsResume => 'পরীক্ষা আবার শুরু করুন';

  @override
  String get examsSubmitAnswers => 'উত্তর জমা দিন';

  @override
  String get examsMaxAttempts => 'সর্বোচ্চ চেষ্টা শেষ';

  @override
  String get examsNotStartedYet => 'এখনো শুরু হয়নি';

  @override
  String get examsWindowClosed => 'শুরুর সময় শেষ';

  @override
  String get examsTake => 'পরীক্ষা দিন';

  @override
  String get examsBack => 'পরীক্ষায় ফিরে যান';

  @override
  String examsCountdownDays(int d, String h, String m) {
    return '$dদি $hঘ $mমি';
  }

  @override
  String takeMinutesLeft(int count) {
    return 'আর $count মিনিট বাকি';
  }

  @override
  String get takeOneMinuteLeft =>
      'আর ১ মিনিট — আপনার পরীক্ষা নিজে থেকেই জমা হবে';

  @override
  String get takeNotStartedToast => 'এই পরীক্ষা এখনো শুরু হয়নি';

  @override
  String get takeWindowClosedToast => 'এই পরীক্ষার শুরুর সময় শেষ হয়ে গেছে';

  @override
  String get takeSubmittedToast => 'পরীক্ষা জমা হয়েছে';

  @override
  String get takeSubmitError =>
      'আপনার পরীক্ষা জমা দেওয়া যায়নি। আবার চেষ্টা করুন।';

  @override
  String get takeConfirmTitle => 'পরীক্ষা জমা দেবেন?';

  @override
  String takeConfirmUnanswered(int count) {
    return 'আপনার $countটি প্রশ্নের উত্তর বাকি। জমা দেওয়ার পর উত্তর পরিবর্তন করা যাবে না।';
  }

  @override
  String get takeConfirmAll =>
      'আপনি সব প্রশ্নের উত্তর দিয়েছেন। জমা দেওয়ার পর উত্তর পরিবর্তন করা যাবে না।';

  @override
  String get takeAnswered => 'উত্তর দেওয়া';

  @override
  String get takeUnanswered => 'উত্তর বাকি';

  @override
  String get takeNotAnswered => 'উত্তর দেওয়া হয়নি';

  @override
  String get takeFlagged => 'চিহ্নিত';

  @override
  String get takeFlag => 'চিহ্ন';

  @override
  String get takeKeepWorking => 'চালিয়ে যান';

  @override
  String get takeSubmitExam => 'পরীক্ষা জমা দিন';

  @override
  String get takeLeaveTitle => 'পরীক্ষা ছেড়ে যাবেন?';

  @override
  String get takeLeaveBody =>
      'আপনার উত্তর সংরক্ষিত আছে, তবে টাইমার চলতেই থাকবে। পরীক্ষার তালিকা থেকে আবার শুরু করতে পারবেন।';

  @override
  String get takeStay => 'থাকুন';

  @override
  String get takeLeave => 'ছেড়ে যান';

  @override
  String get takeQuestions => 'প্রশ্ন';

  @override
  String takeAnsweredOf(int answered, int total) {
    return '$totalটির মধ্যে $answeredটির উত্তর দেওয়া হয়েছে';
  }

  @override
  String takeFlaggedCount(int count) {
    return '$countটি চিহ্নিত';
  }

  @override
  String get takeSubmittedTitle => 'পরীক্ষা জমা হয়েছে';

  @override
  String get takeTakingToResult => 'আপনার ফলাফলে নিয়ে যাওয়া হচ্ছে…';

  @override
  String get takeLoadFailedTitle => 'পরীক্ষা লোড করা যায়নি';

  @override
  String get takeNotStartedTitle => 'পরীক্ষা এখনো শুরু হয়নি';

  @override
  String takeNotStartedBody(String date) {
    return 'এই পরীক্ষা $date-এ শুরু হবে। শুরুর পর থেকে পরীক্ষার সময়ের ৫০% পার হওয়া পর্যন্ত যেকোনো সময় শুরু করতে পারবেন।';
  }

  @override
  String get takeClosedTitle => 'শুরুর সময় শেষ';

  @override
  String takeClosedBody(String date) {
    return 'এই পরীক্ষা $date পর্যন্ত শুরু করা যেত। শুরুর সময় এখন পার হয়ে গেছে।';
  }

  @override
  String get takeNoQuestionsTitle => 'কোনো প্রশ্ন নেই';

  @override
  String get takeNoQuestionsBody => 'এই পরীক্ষায় এখনো কোনো প্রশ্ন নেই।';

  @override
  String get takeAllQuestions => 'সব প্রশ্ন দেখুন';

  @override
  String takeQuestionOf(int n, int total) {
    return 'প্রশ্ন $n / $total';
  }

  @override
  String takeMarks(int count) {
    return '$count নম্বর';
  }

  @override
  String get takeSubmitting => 'জমা দেওয়া হচ্ছে...';

  @override
  String get takeReviewSubmit => 'দেখে জমা দিন';

  @override
  String get takeNext => 'পরের';

  @override
  String get takeAnswerHint => 'আপনার উত্তর লিখুন...';

  @override
  String takeWords(int count) {
    return '$countটি শব্দ';
  }

  @override
  String get takeNoOptions => 'এই প্রশ্নের কোনো বিকল্প নেই।';

  @override
  String get takeSelectAll => 'প্রযোজ্য সবগুলো বেছে নিন';

  @override
  String get takeTimesUp => 'সময় শেষ';

  @override
  String get takeSubmittingAnswers => 'আপনার উত্তর জমা হচ্ছে…';

  @override
  String get takeSubmissionFailed => 'জমা দেওয়া ব্যর্থ';

  @override
  String get takeSavedOnDevice =>
      'আপনার উত্তর এই ডিভাইসে সংরক্ষিত। সংযোগ দেখে আবার চেষ্টা করুন।';

  @override
  String get takeRetrySubmit => 'আবার জমা দিন';

  @override
  String get takeDiscardLeave => 'বাতিল করে বের হন';

  @override
  String takeTimeRemaining(String time) {
    return 'বাকি সময় $time';
  }

  @override
  String get takeDuration => 'সময়কাল';

  @override
  String get takeTotalMarks => 'মোট নম্বর';

  @override
  String get takePassMarkLabel => 'পাস নম্বর';

  @override
  String takeRule1(int minutes) {
    return 'শুরু চাপলেই টাইমার চালু হবে এবং $minutes মিনিট চলবে — অ্যাপ ছেড়ে গেলেও বা বন্ধ করলেও চলতে থাকবে।';
  }

  @override
  String get takeRule2 =>
      'আপনার উত্তর এই ডিভাইসে নিজে থেকেই সংরক্ষিত হয়। ফিরে এলে যেখানে ছিলেন সেখান থেকেই চালিয়ে যাবেন।';

  @override
  String get takeRule3 => 'পুরো পরীক্ষায় একই ডিভাইস ব্যবহার করুন।';

  @override
  String get takeRule4 => 'সময় শেষ হলে আপনার উত্তর নিজে থেকেই জমা হবে।';

  @override
  String takeStartBeforeFull(String date) {
    return '$date-এর আগে শুরু করুন। শুরু করলে পুরো সময় পাবেন।';
  }

  @override
  String get takeBeforeYouBegin => 'শুরু করার আগে';

  @override
  String get takeStart => 'পরীক্ষা শুরু করুন';

  @override
  String get resultPassed => 'অভিনন্দন! আপনি উত্তীর্ণ হয়েছেন।';

  @override
  String get resultGrading => 'আপনার লিখিত উত্তর মূল্যায়ন করা হচ্ছে।';

  @override
  String get resultFailed =>
      'আপনি উত্তীর্ণ হননি। উত্তরগুলো দেখে আবার চেষ্টা করুন।';

  @override
  String resultPassDuration(int mark, int minutes) {
    return 'পাস নম্বর: $mark% • সময়: $minutes মিনিট';
  }

  @override
  String get resultScore => 'নম্বর';

  @override
  String get resultAttempts => 'চেষ্টা';

  @override
  String get resultTimeTaken => 'সময় লেগেছে';

  @override
  String resultMinutesShort(int count) {
    return '$countমি';
  }

  @override
  String get resultHistory => 'চেষ্টার ইতিহাস';

  @override
  String get resultReview => 'প্রশ্ন পর্যালোচনা';

  @override
  String get resultReviewHint => 'আপনার উত্তর ও সঠিক উত্তর মিলিয়ে দেখুন।';

  @override
  String get resultNoAttempts => 'কোনো চেষ্টা পাওয়া যায়নি।';

  @override
  String resultShowingAttempt(int number) {
    return 'চেষ্টা #$number-এর উত্তর দেখানো হচ্ছে।';
  }

  @override
  String get resultRetake => 'আবার পরীক্ষা দিন';

  @override
  String resultAwarded(String awarded, int total) {
    return '$totalটির মধ্যে $awarded দেওয়া হয়েছে';
  }

  @override
  String get resultAwaitingGrading => 'মূল্যায়নের অপেক্ষায়';

  @override
  String get resultCorrect => 'সঠিক';

  @override
  String get resultPartial => 'আংশিক সঠিক';

  @override
  String get resultIncorrect => 'ভুল';

  @override
  String get resultYourAnswer => 'আপনার উত্তর';

  @override
  String get resultSuggestedAnswer => 'প্রস্তাবিত উত্তর';

  @override
  String get resultCorrectAnswer => 'সঠিক উত্তর';

  @override
  String get resultExplanation => 'ব্যাখ্যা';

  @override
  String resultAttempt(int number) {
    return 'চেষ্টা #$number';
  }

  @override
  String get resultLoadFailed => 'ফলাফল লোড করা যায়নি।';

  @override
  String get resultPending => 'অপেক্ষমাণ';

  @override
  String get resultPassedBadge => 'উত্তীর্ণ';

  @override
  String get resultFailedBadge => 'অনুত্তীর্ণ';

  @override
  String get certSelectProfile =>
      'সার্টিফিকেট দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get certLoadFailed => 'আপনার সার্টিফিকেট লোড করা যায়নি।';

  @override
  String get certEyebrow => 'আপনার অর্জন';

  @override
  String get certTitle => 'আমার সার্টিফিকেট';

  @override
  String get certSubtitle =>
      'আপনার কোর্সের সার্টিফিকেট দেখুন, যাচাই করুন ও সংরক্ষণ করুন।';

  @override
  String get certSearch => 'কোর্স, পরীক্ষা বা যাচাই কোড খুঁজুন...';

  @override
  String get certEmpty => 'এখনো কোনো সার্টিফিকেট নেই';

  @override
  String get certNoMatch => 'আপনার খোঁজের সাথে কোনো সার্টিফিকেট মেলেনি';

  @override
  String get certEmptyHint => 'আপনার অর্জিত সার্টিফিকেট এখানে দেখা যাবে।';

  @override
  String get certNoMatchHint => 'অন্য কিছু লিখে খুঁজে দেখুন।';

  @override
  String certShowing(int shown, int total) {
    return '$totalটির মধ্যে $shownটি সার্টিফিকেট দেখানো হচ্ছে';
  }

  @override
  String get certDateUnavailable => 'তারিখ পাওয়া যায়নি';

  @override
  String get certValid => 'বৈধ';

  @override
  String certIssued(String date) {
    return 'ইস্যু $date';
  }

  @override
  String certResult(String score, int total) {
    return 'ফল: $score / $total';
  }

  @override
  String get certPassed => 'উত্তীর্ণ';

  @override
  String get certNotPassed => 'অনুত্তীর্ণ';

  @override
  String get certHide => 'লুকান';

  @override
  String get certPreview => 'প্রিভিউ';

  @override
  String get certSavePdf => 'PDF সংরক্ষণ করুন';

  @override
  String get certAchievement => 'কৃতিত্বের সার্টিফিকেট';

  @override
  String get certPresentedTo => 'প্রদান করা হলো';

  @override
  String get certFor => 'যে কারণে';

  @override
  String certProgress(int progress) {
    return 'কোর্সের অগ্রগতি $progress%';
  }

  @override
  String certId(String id) {
    return 'সার্টিফিকেট আইডি: $id';
  }

  @override
  String certCode(String code) {
    return 'যাচাই কোড: $code';
  }

  @override
  String get certCodeCopied => 'যাচাই কোড কপি হয়েছে';

  @override
  String get certCopyCode => 'কোড কপি করুন';

  @override
  String get certPdfFailed => 'PDF প্রিভিউ খোলা যায়নি।';

  @override
  String get certAllTypes => 'সব ধরন';

  @override
  String get certTypeAttendance => 'উপস্থিতি';

  @override
  String get certTypeCompletion => 'সমাপ্তি';

  @override
  String get certTypeCourseCompletion => 'কোর্স সমাপ্তি';

  @override
  String get certTypeExam => 'পরীক্ষা';

  @override
  String get wishlistRemoved => 'উইশলিস্ট থেকে সরানো হয়েছে';

  @override
  String get wishlistRemoveFailed => 'উইশলিস্ট থেকে সরানো যায়নি';

  @override
  String get wishlistSelectProfile =>
      'উইশলিস্ট দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get wishlistLoadFailed => 'উইশলিস্ট লোড করা যায়নি';

  @override
  String get wishlistTitle => 'উইশলিস্ট';

  @override
  String wishlistCount(int count) {
    return 'পরে দেখার জন্য $countটি কোর্স সংরক্ষিত';
  }

  @override
  String get wishlistEmpty => 'আপনার উইশলিস্ট খালি';

  @override
  String get wishlistEmptyBody =>
      'পছন্দের কোর্স সংরক্ষণ করুন এবং এখানে ফিরে আসুন।';

  @override
  String get wishlistCourse => 'কোর্স';

  @override
  String get wishlistViewDetails => 'কোর্সের বিস্তারিত দেখুন';

  @override
  String get formatSelfPaced => 'নিজের গতিতে';

  @override
  String get formatLive => 'লাইভ ক্লাস';

  @override
  String get notifTitle => 'বিজ্ঞপ্তি';

  @override
  String get notifMarkReadFailed => 'পড়া হিসেবে চিহ্নিত করা যায়নি';

  @override
  String get notifMarkAllRead => 'সব পঠিত';

  @override
  String notifUnread(int count) {
    return '$countটি অপঠিত';
  }

  @override
  String get notifLoadFailed => 'নোটিফিকেশন লোড করা যায়নি।';

  @override
  String get notifTapRetry => 'আবার চেষ্টা করতে ট্যাপ করুন';

  @override
  String get notifCaughtUp => 'আপনার সব দেখা হয়ে গেছে।';

  @override
  String get notifRemoveFailed => 'নোটিফিকেশন সরানো যায়নি';

  @override
  String get notifJustNow => 'এইমাত্র';

  @override
  String notifMinutesAgo(int count) {
    return '$count মিনিট আগে';
  }

  @override
  String notifHoursAgo(int count) {
    return '$count ঘণ্টা আগে';
  }

  @override
  String notifDaysAgo(int count) {
    return '$count দিন আগে';
  }

  @override
  String get notifView => 'দেখুন';

  @override
  String notifBellUnread(int count) {
    return 'নোটিফিকেশন, $countটি অপঠিত';
  }

  @override
  String get chatNoCourse => 'কোর্স নির্দিষ্ট করা হয়নি।';

  @override
  String get chatSelectProfile =>
      'এই ক্লাস চ্যাটে যোগ দিতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get chatConnectFailed =>
      'ক্লাস চ্যাটে সংযোগ করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get chatTooLong => 'বার্তা সর্বোচ্চ ২,০০০ অক্ষরের হতে পারে।';

  @override
  String get chatReportTitle => 'বার্তা রিপোর্ট করুন';

  @override
  String get chatReportWhy => 'কেন এই বার্তাটি পর্যালোচনা করা উচিত?';

  @override
  String get chatReportHint => 'সমস্যাটি লিখুন...';

  @override
  String get chatSubmitReport => 'রিপোর্ট জমা দিন';

  @override
  String get chatReported => 'বার্তাটি পর্যালোচনার জন্য রিপোর্ট করা হয়েছে।';

  @override
  String get chatReportFailed =>
      'বার্তাটি রিপোর্ট করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String chatClassChat(String batch) {
    return '$batch • ক্লাস চ্যাট';
  }

  @override
  String get chatDismiss => 'বন্ধ করুন';

  @override
  String get chatRetry => 'আবার চেষ্টা';

  @override
  String get chatPlaceholder => 'বার্তা লিখুন...';

  @override
  String get chatConnecting => 'সংযোগ হচ্ছে...';

  @override
  String get chatSend => 'বার্তা পাঠান';

  @override
  String get chatLive => 'লাইভ';

  @override
  String get chatOffline => 'অফলাইন';

  @override
  String get chatNextClass => 'পরবর্তী লাইভ ক্লাস';

  @override
  String get chatJoinClass => 'ক্লাসে যোগ দিন';

  @override
  String get chatEmpty => 'এখনো কোনো বার্তা নেই। সহপাঠীদের শুভেচ্ছা জানান!';

  @override
  String get chatInstructor => 'শিক্ষক';

  @override
  String get chatMessageActions => 'বার্তার অপশন';

  @override
  String get chatTimeTba => 'সময় পরে জানানো হবে';

  @override
  String chatDateAt(String date, String time) {
    return '$date, $time';
  }

  @override
  String get familyTitle => 'আপনার শিক্ষার্থীদের প্রোফাইল';

  @override
  String get familyAddProfile => 'প্রোফাইল যোগ করুন';

  @override
  String get familyEmpty =>
      'এখনো কোনো শিক্ষার্থী প্রোফাইল নেই। শুরু করতে একটি প্রোফাইল যোগ করুন।';

  @override
  String get familySubscribed => 'সাবস্ক্রাইব করা আছে';

  @override
  String get familySubscription => 'সাবস্ক্রিপশন';

  @override
  String get familySubscribe => 'সাবস্ক্রাইব করুন';

  @override
  String get commonEdit => 'সম্পাদনা';

  @override
  String get pinReset => 'পিন রিসেট করুন';

  @override
  String get pinSet => 'পিন সেট করুন';

  @override
  String get imageInvalidType => 'JPEG, PNG, WebP বা GIF ছবি বেছে নিন।';

  @override
  String get imageTooLarge => 'ছবির আকার ৫ MB বা তার কম হতে হবে';

  @override
  String get imagePickerFailed => 'ফটো লাইব্রেরি খোলা যায়নি।';

  @override
  String get learnerChooseDob => 'জন্মতারিখ বেছে নিন।';

  @override
  String get learnerPhotoUploadFailed =>
      'শিক্ষার্থী তৈরি হয়েছে, তবে ছবি আপলোড করা যায়নি। প্রোফাইল পরিচালনা থেকে যোগ করতে পারবেন।';

  @override
  String get learnerCreateFailed => 'প্রোফাইল তৈরি করা যায়নি';

  @override
  String get learnerAddTitle => 'একজন শিক্ষার্থী যোগ করুন';

  @override
  String get learnerAddPhoto => 'প্রোফাইল ছবি যোগ করুন';

  @override
  String get learnerChangePhoto => 'প্রোফাইল ছবি পরিবর্তন করুন';

  @override
  String get learnerRemovePhoto => 'ছবি সরান';

  @override
  String get learnerAddPhotoOptional => 'প্রোফাইল ছবি যোগ করুন (ঐচ্ছিক)';

  @override
  String get learnerName => 'শিক্ষার্থীর নাম';

  @override
  String get learnerNameRequired => 'নাম দিন';

  @override
  String get learnerNameTooLong => 'সর্বোচ্চ ১০০ অক্ষরের নাম লিখুন।';

  @override
  String get learnerDob => 'জন্ম তারিখ';

  @override
  String get learnerPinOptional => '৪ অঙ্কের পিন (ঐচ্ছিক)';

  @override
  String get learnerPinFormat => 'পিন ঠিক ৪ অঙ্কের হতে হবে';

  @override
  String get learnerPinMismatch => 'পিন মিলছে না';

  @override
  String get learnerCreate => 'শিক্ষার্থী যোগ করুন';

  @override
  String get learnerLoadFailed => 'শিক্ষার্থী প্রোফাইল লোড করা যায়নি।';

  @override
  String get learnerUpdateFailed => 'প্রোফাইল আপডেট করা যায়নি';

  @override
  String get learnerNotFound => 'প্রোফাইল পাওয়া যায়নি';

  @override
  String learnerEditTitle(String name) {
    return '$name-এর প্রোফাইল সম্পাদনা';
  }

  @override
  String get learnerNameLocked =>
      'সার্টিফিকেট দেওয়া হয়েছে বলে নাম পরিবর্তন করা যাবে না।';

  @override
  String get learnerCancelPinChange => 'পিন পরিবর্তন বাতিল করুন';

  @override
  String get learnerNewPin => 'নতুন ৪ অঙ্কের পিন';

  @override
  String get learnerConfirmNewPin => 'নতুন পিন নিশ্চিত করুন';

  @override
  String get commonSaving => 'সংরক্ষণ হচ্ছে...';

  @override
  String get learnerSaveChanges => 'পরিবর্তন সংরক্ষণ করুন';

  @override
  String get deleteFailed => 'প্রোফাইল মুছে ফেলা যায়নি';

  @override
  String deleteTitle(String name) {
    return '$name-এর প্রোফাইল মুছে ফেলবেন?';
  }

  @override
  String get deleteDestroyed => 'যা মুছে যাবে:';

  @override
  String get deleteDestroyedItems =>
      'অগ্রগতি, ভর্তি, পরীক্ষার ফল ও চ্যাট বার্তা।';

  @override
  String get deleteSurvives => 'যা থেকে যাবে:';

  @override
  String get deleteSurvivesItems => 'সার্টিফিকেট ও মডারেশন রেকর্ড।';

  @override
  String deleteTypeName(String name) {
    return 'নিশ্চিত করতে $name লিখুন';
  }

  @override
  String get deleteDeleting => 'মুছে ফেলা হচ্ছে…';

  @override
  String get deleteConfirm => 'প্রোফাইল মুছে ফেলুন';

  @override
  String get deleteGoBack => 'না, ফিরে যান';

  @override
  String get avatarLabel => 'শিক্ষার্থীর অবতার';

  @override
  String get secServerUnreachable =>
      'সার্ভারে পৌঁছানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।';

  @override
  String get secTooManyAttempts =>
      'অনেকবার চেষ্টা হয়েছে। একটু অপেক্ষা করে আবার চেষ্টা করুন।';

  @override
  String get secTitle => 'লগ ইন ও নিরাপত্তা';

  @override
  String get secEmailRequired => 'নতুন ইমেইল ঠিকানা দিন।';

  @override
  String get secEmailInvalid => 'সঠিক ইমেইল ঠিকানা দিন, যেমন name@example.com।';

  @override
  String get secEmailSame => 'এটি ইতিমধ্যে আপনার ইমেইল ঠিকানা।';

  @override
  String get secConfirmWithPassword => 'নিশ্চিত করতে বর্তমান পাসওয়ার্ড দিন।';

  @override
  String get secEmailUpdated =>
      'ইমেইল আপডেট হয়েছে। যাচাই লিঙ্কের জন্য নতুন ইনবক্স দেখুন।';

  @override
  String get secEmailUpdateFailed =>
      'আপনার ইমেইল আপডেট করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get secEmail => 'ইমেইল';

  @override
  String get secEmailLoadFailed => 'আপনার ইমেইল লোড করা যায়নি।';

  @override
  String get secRetry => 'আবার চেষ্টা';

  @override
  String get secLoadingEmail => 'অ্যাকাউন্টের ইমেইল লোড হচ্ছে…';

  @override
  String get secUnverified => 'যাচাই হয়নি — যাচাই লিঙ্কের জন্য ইমেইল দেখুন';

  @override
  String get secVerified => 'যাচাইকৃত ✓';

  @override
  String get secChangeEmail => 'ইমেইল পরিবর্তন করুন';

  @override
  String get secNewEmail => 'নতুন ইমেইল';

  @override
  String get secCurrentPassword => 'বর্তমান পাসওয়ার্ড';

  @override
  String get secPasswordConfirmHint =>
      'এটি আপনিই কিনা নিশ্চিত করতে আমরা পাসওয়ার্ড চাই।';

  @override
  String get secSaveEmail => 'ইমেইল সংরক্ষণ করুন';

  @override
  String get secEmailChangeNote =>
      'নতুন ইমেইল কার্যকর হওয়ার আগে এটি যাচাই করতে হবে। এর মধ্যে আপনার অ্যাকাউন্ট পুরোপুরি সক্রিয় থাকবে।';

  @override
  String get secCurrentRequired => 'বর্তমান পাসওয়ার্ড দিন।';

  @override
  String get secNewRequired => 'নতুন পাসওয়ার্ড দিন।';

  @override
  String secTooShort(String min, int remaining) {
    return 'কমপক্ষে $minটি অক্ষর ব্যবহার করুন (আরও $remainingটি)।';
  }

  @override
  String secTooLong(String max) {
    return '$maxটি বা তার কম অক্ষর ব্যবহার করুন।';
  }

  @override
  String get secSameAsCurrent => 'বর্তমান পাসওয়ার্ড থেকে আলাদা একটি বেছে নিন।';

  @override
  String get secConfirmRequired => 'নতুন পাসওয়ার্ড আবার দিন।';

  @override
  String get secMismatch => 'পাসওয়ার্ড মিলছে না।';

  @override
  String get secPasswordUpdated =>
      'পাসওয়ার্ড আপডেট হয়েছে। পরের বার লগ ইনে নতুন পাসওয়ার্ড ব্যবহার করুন।';

  @override
  String get secPasswordUpdateFailed =>
      'আপনার পাসওয়ার্ড আপডেট করা যায়নি। আবার চেষ্টা করুন।';

  @override
  String get secPassword => 'পাসওয়ার্ড';

  @override
  String get secChangePassword => 'পাসওয়ার্ড পরিবর্তন করুন';

  @override
  String get secNewPassword => 'নতুন পাসওয়ার্ড';

  @override
  String secReqLength(String min) {
    return 'কমপক্ষে $minটি অক্ষর';
  }

  @override
  String get secReqDifferent => 'বর্তমান পাসওয়ার্ড থেকে আলাদা';

  @override
  String get secConfirmPassword => 'নতুন পাসওয়ার্ড নিশ্চিত করুন';

  @override
  String get secPasswordsMatch => 'পাসওয়ার্ড মিলেছে';

  @override
  String get secPasswordsDontMatchYet => 'পাসওয়ার্ড এখনো মেলেনি';

  @override
  String get secSavePassword => 'পাসওয়ার্ড সংরক্ষণ করুন';

  @override
  String get commonOptional => 'ঐচ্ছিক';

  @override
  String get commonCopied => 'কপি হয়েছে';

  @override
  String commonAge(String age) {
    return 'বয়স $age';
  }

  @override
  String get commonImageUploadFailed => 'ছবি আপলোড করা যায়নি';

  @override
  String get commonRemoveImage => 'ছবি সরান';

  @override
  String get commonAddImage => 'ছবি যোগ করুন';

  @override
  String get commonUploading => 'আপলোড হচ্ছে...';

  @override
  String get commonSubmit => 'জমা দিন';

  @override
  String get subTitle => 'সাবস্ক্রিপশন';

  @override
  String get subIntro =>
      'কোর্সে ভর্তি হতে প্রতিটি শিক্ষার্থীর প্রোফাইলের আলাদা সাবস্ক্রিপশন লাগে। অনুমোদনের পর থেকে এক মাস চলে।';

  @override
  String get subLoadFailed => 'আপনার সাবস্ক্রিপশন লোড করা যায়নি';

  @override
  String get subHowToPay => 'কীভাবে পেমেন্ট করবেন';

  @override
  String get subHowToPayBody =>
      'এই অ্যাকাউন্টগুলোর যেকোনো একটিতে পেমেন্ট পাঠান, তারপর লেনদেনের তথ্য দিয়ে প্রতিটি প্রোফাইলের জন্য আবেদন করুন।';

  @override
  String get subPerProfileMonth => 'প্রতি প্রোফাইল · এক মাস';

  @override
  String get subNoPaymentDetails =>
      'পেমেন্টের তথ্য এখনো যোগ করা হয়নি। সাপোর্টে যোগাযোগ করুন।';

  @override
  String get subCopyAccountNumber => 'অ্যাকাউন্ট নম্বর কপি করুন';

  @override
  String get subTypeBank => 'ব্যাংক ট্রান্সফার';

  @override
  String get subTypeMobile => 'মোবাইল ব্যাংকিং';

  @override
  String get subTypeOther => 'অন্যান্য';

  @override
  String get subBadgeSubscribed => 'সাবস্ক্রাইব করা';

  @override
  String get subBadgeUnderReview => 'যাচাই চলছে';

  @override
  String get subBadgeNotSubscribed => 'সাবস্ক্রাইব করা নেই';

  @override
  String subSubscribedUntil(String date) {
    return '$date পর্যন্ত সাবস্ক্রাইব করা';
  }

  @override
  String get subRenewalUnderReview => 'নবায়নের পেমেন্ট যাচাই চলছে';

  @override
  String get subPaymentUnderReview =>
      'পেমেন্ট যাচাই চলছে — সাধারণত এক দিনের মধ্যে';

  @override
  String get subSubscribeToEnrol => 'কোর্সে ভর্তি হতে সাবস্ক্রাইব করুন';

  @override
  String get subLastRejected => 'শেষ পেমেন্ট অনুমোদিত হয়নি।';

  @override
  String subLastRejectedReason(String reason) {
    return 'শেষ পেমেন্ট অনুমোদিত হয়নি: $reason';
  }

  @override
  String subWaiverReady(int percent) {
    return '$percent% ফি মওকুফ প্রস্তুত';
  }

  @override
  String subWaiverReadyUseBy(int percent, String date) {
    return '$percent% ফি মওকুফ প্রস্তুত — $date-এর মধ্যে ব্যবহার করুন';
  }

  @override
  String get subWaiverUnderReview => 'ফি মওকুফের আবেদন যাচাই চলছে';

  @override
  String subWaiverRejected(String reason) {
    return 'মওকুফ অনুমোদিত হয়নি: $reason।';
  }

  @override
  String get subRequestWaiver => 'ফি দিতে সমস্যা? মওকুফের আবেদন করুন';

  @override
  String get subWaiverLimit => 'এই বছরের মওকুফের সীমা শেষ';

  @override
  String subWaiverLimitNext(String date) {
    return 'এই বছরের মওকুফের সীমা শেষ (পরবর্তী $date)';
  }

  @override
  String get subCancelRequest => 'আবেদন বাতিল করুন';

  @override
  String get subRenew => 'নবায়ন করুন';

  @override
  String get subApply => 'সাবস্ক্রিপশনের আবেদন করুন';

  @override
  String get subLearnerProfiles => 'শিক্ষার্থীর প্রোফাইল';

  @override
  String subSubscribedCount(int count, int total) {
    return '$totalটির মধ্যে $countটি সাবস্ক্রাইব করা';
  }

  @override
  String subUnderReviewCount(int count) {
    return '$countটি যাচাই চলছে';
  }

  @override
  String get subAddProfileToSubscribe =>
      'সাবস্ক্রাইব করতে একটি শিক্ষার্থীর প্রোফাইল যোগ করুন।';

  @override
  String get subCancelTitle => 'এই আবেদন বাতিল করবেন?';

  @override
  String subCancelBody(String name) {
    return '$name-এর পেমেন্ট যাচাই করা হবে না। পরে আবার জমা দিতে পারবেন।';
  }

  @override
  String get subKeepIt => 'রেখে দিন';

  @override
  String get subCancelled => 'আবেদন বাতিল হয়েছে';

  @override
  String get subCancelFailed => 'আবেদন বাতিল করা যায়নি';

  @override
  String get subPaymentHistory => 'পেমেন্টের ইতিহাস';

  @override
  String get subFeeWaivers => 'ফি মওকুফ';

  @override
  String subWaiverPercent(int percent) {
    return '$percent% মওকুফ';
  }

  @override
  String subSubmittedOn(String date) {
    return 'জমা $date';
  }

  @override
  String subUntil(String date) {
    return '$date পর্যন্ত';
  }

  @override
  String get subReqUnderReview => 'যাচাই চলছে';

  @override
  String get subReqApproved => 'অনুমোদিত';

  @override
  String get subReqRejected => 'প্রত্যাখ্যাত';

  @override
  String get subReqCancelled => 'বাতিল';

  @override
  String subWaiverOff(int percent) {
    return 'এক মাসে $percent% ছাড়';
  }

  @override
  String subRequestedOn(String date) {
    return 'আবেদন $date';
  }

  @override
  String subUseBy(String date) {
    return '$date-এর মধ্যে ব্যবহার করুন';
  }

  @override
  String subUsedOn(String date) {
    return 'ব্যবহৃত $date';
  }

  @override
  String get subWaiverReadyToUse => 'ব্যবহারের জন্য প্রস্তুত';

  @override
  String get subWaiverUsed => 'ব্যবহৃত';

  @override
  String get subWaiverNotApproved => 'অনুমোদিত হয়নি';

  @override
  String get subWaiverExpired => 'মেয়াদ শেষ';

  @override
  String get subWaiverWithdrawn => 'প্রত্যাহার করা হয়েছে';

  @override
  String subSubmittedPayment(String name) {
    return 'পেমেন্ট জমা হয়েছে। যাচাই হলে $name-কে সাবস্ক্রাইব করা হবে।';
  }

  @override
  String get subWaiverSent =>
      'মওকুফের আবেদন পাঠানো হয়েছে। যাচাই হলে ইমেইল করব।';

  @override
  String applyRenewTitle(String name) {
    return '$name-এর সাবস্ক্রিপশন নবায়ন';
  }

  @override
  String applyApplyTitle(String name) {
    return '$name-এর সাবস্ক্রিপশনের আবেদন';
  }

  @override
  String applyFullyWaivedBody(String name) {
    return '$name-এর ফি মওকুফে পুরো মাস কভার হয়, তাই পেমেন্ট লাগবে না। একজন অ্যাডমিন অনুমোদন দিয়ে $name-কে এক মাসের জন্য সাবস্ক্রাইব করবেন।';
  }

  @override
  String applyPaymentBody(String amount, String name) {
    return 'আপনার $amount পেমেন্টের তথ্য দিন। একজন অ্যাডমিন যাচাই করে $name-কে এক মাসের জন্য সাবস্ক্রাইব করবেন।';
  }

  @override
  String applyWaiverApplied(int percent) {
    return '$percent% ফি মওকুফ প্রয়োগ হয়েছে';
  }

  @override
  String get applyNothingToPay => 'এই মাসে কিছু দিতে হবে না।';

  @override
  String get applyWaiverUsedNote =>
      'এই সাবস্ক্রিপশন অনুমোদিত হলে মওকুফটি ব্যবহৃত হবে।';

  @override
  String get applyPaidTo => 'যেখানে পেমেন্ট করেছেন';

  @override
  String applyAmount(String currency) {
    return 'পরিমাণ ($currency)';
  }

  @override
  String get applyAmountRequired => 'পরিশোধিত পরিমাণ লিখুন';

  @override
  String get applyPaymentDate => 'পেমেন্টের তারিখ';

  @override
  String get applyTransactionId => 'লেনদেন আইডি / রেফারেন্স';

  @override
  String get applyTransactionIdHint => 'যেমন: 9KD7X2LQ1P';

  @override
  String get applyTransactionIdRequired => 'লেনদেন আইডি লিখুন';

  @override
  String get applyPaidFrom => 'যেখান থেকে পেমেন্ট করেছেন';

  @override
  String get applyPaidFromHint => 'আপনার অ্যাকাউন্ট বা মোবাইল নম্বর';

  @override
  String get applyNote => 'নোট';

  @override
  String get applyProof => 'পেমেন্টের স্ক্রিনশট / রসিদ';

  @override
  String get applySubmitPayment => 'পেমেন্ট জমা দিন';

  @override
  String get applySubmitFailed => 'আপনার পেমেন্ট জমা দেওয়া যায়নি';

  @override
  String waiverTitle(String name) {
    return '$name-এর জন্য ফি মওকুফের আবেদন';
  }

  @override
  String waiverBody(String name) {
    return 'পুরো ফি দেওয়া কঠিন হলে আপনার অবস্থা জানান। অনুমোদিত হলে $name-এর পরবর্তী এক মাসের সাবস্ক্রিপশনে ২৫–১০০% ছাড় পাবেন, যা ৩০ দিনের মধ্যে ব্যবহার করতে হবে।';
  }

  @override
  String get waiverSituation => 'আপনার অবস্থা';

  @override
  String get waiverSituationHint =>
      'যেমন: পারিবারিক আয়, কতজন সন্তান পড়ছে, সাম্প্রতিক পরিস্থিতির পরিবর্তন…';

  @override
  String waiverMinChars(String min) {
    return 'কমপক্ষে $min অক্ষর লিখুন';
  }

  @override
  String waiverDocuments(String max) {
    return 'সহায়ক ডকুমেন্ট (ঐচ্ছিক, সর্বোচ্চ $maxটি ছবি)';
  }

  @override
  String waiverRemaining(int count, String name) {
    return 'আগামী ১২ মাসে $name-এর জন্য আরও $count বার আবেদন করতে পারবেন।';
  }

  @override
  String get waiverSend => 'আবেদন পাঠান';

  @override
  String get waiverFailed => 'মওকুফের আবেদন জমা দেওয়া যায়নি';

  @override
  String get dashChooseProfile =>
      'এই ড্যাশবোর্ড দেখতে একটি শিক্ষার্থী প্রোফাইল বেছে নিন।';

  @override
  String get dashChooseProfileButton => 'প্রোফাইল বেছে নিন';

  @override
  String get dashLoadFailed => 'ড্যাশবোর্ড লোড করা যায়নি';

  @override
  String dashGreetingMorning(String name) {
    return 'শুভ সকাল, $name';
  }

  @override
  String dashGreetingAfternoon(String name) {
    return 'শুভ অপরাহ্ণ, $name';
  }

  @override
  String dashGreetingEvening(String name) {
    return 'শুভ সন্ধ্যা, $name';
  }

  @override
  String get dashFindFirstCourse => 'শেখা শুরু করতে প্রথম কোর্স খুঁজুন।';

  @override
  String get dashNiceWork => 'আজ দারুণ কাজ — এভাবেই চালিয়ে যান।';

  @override
  String get dashPickUp => 'যেখানে থেমেছিলেন সেখান থেকে শুরু করুন।';

  @override
  String get dashClassLiveNow => 'আপনার ক্লাস এখন লাইভ';

  @override
  String dashClassStartsAt(String time) {
    return 'আপনার ক্লাস শুরু হবে $time-এ';
  }

  @override
  String get dashJoin => 'যোগ দিন';

  @override
  String get dashView => 'দেখুন';

  @override
  String get dashStatInProgress => 'চলমান কোর্স';

  @override
  String dashStatCompletedCount(int count) {
    return '$countটি সম্পন্ন';
  }

  @override
  String get dashStatLessons => 'সম্পন্ন পাঠ';

  @override
  String dashStatThisWeek(int count) {
    return 'এই সপ্তাহে $countটি';
  }

  @override
  String get dashStatCertificates => 'অর্জিত সার্টিফিকেট';

  @override
  String get dashStatViewCertificates => 'সার্টিফিকেট দেখুন';

  @override
  String get dashStatStreak => 'টানা দিন';

  @override
  String get dashStatKeepStreak => 'ধারা ধরে রাখতে আজ পড়ুন';

  @override
  String dashStatBest(int count) {
    return 'সেরা: $count দিন';
  }

  @override
  String get dashContinueTitle => 'শেখা চালিয়ে যান';

  @override
  String get dashViewAll => 'সব দেখুন';

  @override
  String get dashAllFinished => 'আপনি সব কোর্স শেষ করেছেন!';

  @override
  String get dashNotStarted => 'আপনি এখনো কোনো কোর্স শুরু করেননি';

  @override
  String get dashBrowseCourses => 'কোর্স দেখুন';

  @override
  String dashNext(String title) {
    return 'পরবর্তী: $title';
  }

  @override
  String get dashLiveOnline => 'লাইভ অনলাইন ক্লাস';

  @override
  String get dashNoLessons => 'এখনো কোনো পাঠ নেই';

  @override
  String get dashSchedule => 'সময়সূচি';

  @override
  String get dashResume => 'আবার শুরু';

  @override
  String get dashStart => 'শুরু করুন';

  @override
  String get dashLiveTitle => 'আসন্ন লাইভ ক্লাস';

  @override
  String get dashLiveNone => 'কোনো আসন্ন লাইভ ক্লাস নেই।';

  @override
  String get dashLiveNow => 'এখন লাইভ';

  @override
  String get dashDeadlinesTitle => 'সময়সীমা';

  @override
  String get dashDeadlinesNone => 'কিছু বাকি নেই — আপনি প্রস্তুত।';

  @override
  String get dashDueToday => 'আজ শেষ তারিখ';

  @override
  String get dashDueTomorrow => 'আগামীকাল শেষ তারিখ';

  @override
  String dashDueIn(int count) {
    return '$count দিনের মধ্যে';
  }

  @override
  String get dashExam => 'পরীক্ষা';

  @override
  String get dashAssignment => 'অ্যাসাইনমেন্ট';

  @override
  String get dashActivityTitle => 'আপনার কার্যক্রম';

  @override
  String dashActivitySubtitle(int total, int weeks) {
    return 'প্রতি সপ্তাহে সম্পন্ন পাঠ · গত $weeks সপ্তাহে $totalটি';
  }

  @override
  String get dashThisWeekShort => 'এ সপ্তাহ';

  @override
  String get dashResultsTitle => 'সাম্প্রতিক ফলাফল';

  @override
  String get dashResultsNone =>
      'আপনার পরীক্ষা ও অ্যাসাইনমেন্টের ফলাফল এখানে দেখাবে।';

  @override
  String get dashResultPassed => 'উত্তীর্ণ';

  @override
  String get dashResultFailed => 'অনুত্তীর্ণ';

  @override
  String get dashResultGraded => 'মূল্যায়িত';

  @override
  String get dashResultAwaiting => 'মূল্যায়নের অপেক্ষায়';

  @override
  String get dashNotesTitle => 'সাম্প্রতিক নোট';

  @override
  String get dashRecommended => 'আপনার জন্য প্রস্তাবিত';

  @override
  String get dashBrowseAll => 'সব দেখুন';

  @override
  String get dashLiveBadge => 'লাইভ';

  @override
  String get dashSwitchProfile => 'প্রোফাইল পরিবর্তন';

  @override
  String get dashTimeTba => 'সময় পরে জানানো হবে';

  @override
  String get helpTitle => 'সাহায্য ও সহায়তা';

  @override
  String get helpFaq => 'সচরাচর জিজ্ঞাসিত প্রশ্ন';

  @override
  String get helpSearch => 'প্রশ্ন খুঁজুন…';

  @override
  String helpNoMatch(String query) {
    return '“$query”-এর সাথে কোনো প্রশ্ন মেলেনি।';
  }

  @override
  String get helpNone => 'এখনো কোনো প্রশ্ন প্রকাশিত হয়নি।';

  @override
  String get helpContactUs => 'যোগাযোগ করুন';

  @override
  String get helpPolicies => 'নীতিমালা';

  @override
  String get pageUnavailable => 'এই পৃষ্ঠাটি এখন উপলব্ধ নয়।';

  @override
  String pageUpdated(String date) {
    return 'সর্বশেষ হালনাগাদ $date';
  }

  @override
  String get languageChangeTo => 'ভাষা পরিবর্তন করুন';
}
