// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Hindi (`hi`).
class AppLocalizationsHi extends AppLocalizations {
  AppLocalizationsHi([String locale = 'hi']) : super(locale);

  @override
  String get commonCancel => 'रद्द करें';

  @override
  String get commonContinue => 'जारी रखें';

  @override
  String get commonTryAgain => 'फिर से कोशिश करें';

  @override
  String get commonSending => 'भेजा जा रहा है...';

  @override
  String get commonClose => 'बंद करें';

  @override
  String get commonSave => 'सहेजें';

  @override
  String get commonDelete => 'हटाएँ';

  @override
  String get commonOr => 'या';

  @override
  String get commonLearner => 'शिक्षार्थी';

  @override
  String get commonAdult => 'वयस्क';

  @override
  String commonAgeRange(String min, String max) {
    return 'आयु $min–$max';
  }

  @override
  String commonAgeUnder(String max) {
    return '$max वर्ष और कम';
  }

  @override
  String get commonNotSubscribed => 'सदस्यता नहीं';

  @override
  String get commonConnectionError =>
      'कनेक्ट नहीं हो पा रहा। अपना इंटरनेट कनेक्शन जाँचें।';

  @override
  String get commonLogoLabel => '3i International Islamic Institute लोगो';

  @override
  String get commonInstituteName => 'इंटरनेशनल इस्लामिक इंस्टीट्यूट';

  @override
  String get languageLabel => 'भाषा';

  @override
  String get languageSettingBody =>
      'वेबसाइट, ऐप और ईमेल में उपयोग होने वाली भाषा';

  @override
  String get languageSaveFailed =>
      'आपके खाते में भाषा सहेजी नहीं जा सकी। अगली बार साइन इन करने पर यह पहले जैसी हो जाएगी।';

  @override
  String get authEmailLabel => 'ईमेल पता';

  @override
  String get authPasswordLabel => 'पासवर्ड';

  @override
  String get authShowPassword => 'पासवर्ड दिखाएँ';

  @override
  String get authHidePassword => 'पासवर्ड छिपाएँ';

  @override
  String get authEmailInvalid => 'मान्य ईमेल पता दर्ज करें';

  @override
  String get authPasswordRequired => 'पासवर्ड आवश्यक है';

  @override
  String get authPasswordMin => 'पासवर्ड कम से कम 10 अक्षरों का होना चाहिए';

  @override
  String get authPasswordMax => 'पासवर्ड अधिकतम 128 अक्षरों का हो सकता है';

  @override
  String get authBackToLogin => 'लॉग इन पर वापस जाएँ';

  @override
  String get authGoToLogin => 'लॉग इन पर जाएँ';

  @override
  String get authSelectDate => 'तिथि चुनें';

  @override
  String get authSelectDob => 'अपनी जन्मतिथि चुनें';

  @override
  String get loginTitle => 'फिर से स्वागत है';

  @override
  String get loginSubtitle => 'लॉग इन करने के लिए अपनी जानकारी दर्ज करें।';

  @override
  String get loginForgotPassword => 'पासवर्ड भूल गए?';

  @override
  String get loginSubmit => 'लॉग इन';

  @override
  String get loginFailed => 'लॉग इन विफल रहा। कृपया फिर से प्रयास करें।';

  @override
  String get loginNewHere => '3i पर नए हैं?';

  @override
  String get loginCreateAccount => 'खाता बनाएँ';

  @override
  String get loginInstructorPortal => 'शिक्षक पोर्टल';

  @override
  String get registerTitle => 'अपनी यात्रा शुरू करें';

  @override
  String get registerSubtitle => 'एक खाता। जब चाहें अपने बच्चों को जोड़ें।';

  @override
  String get registerFirstName => 'पहला नाम';

  @override
  String get registerFirstNameHint => 'जैसे: सारा';

  @override
  String get registerLastName => 'उपनाम';

  @override
  String get registerLastNameHint => 'जैसे: अहमद';

  @override
  String get registerFirstNameRequired => 'पहला नाम आवश्यक है';

  @override
  String get registerLastNameRequired => 'उपनाम आवश्यक है';

  @override
  String get registerNameTooLong => 'अधिकतम 100 अक्षर हो सकते हैं';

  @override
  String get registerPasswordHint => 'कम से कम 10 अक्षर';

  @override
  String get registerDateOfBirth => 'जन्म तिथि';

  @override
  String get registerDateOfBirthHint => 'आयु 18 वर्ष या उससे अधिक होनी चाहिए';

  @override
  String get registerDobRequired =>
      'अपनी जन्मतिथि चुनें। आपकी आयु कम से कम 18 होनी चाहिए।';

  @override
  String get registerLanguage => 'पसंदीदा भाषा';

  @override
  String get registerLanguageHint =>
      'ऐप में इस्तेमाल होने वाली भाषा। आप इसे कभी भी बदल सकते हैं।';

  @override
  String get registerSubmit => 'खाता बनाएँ';

  @override
  String get registerFailed => 'पंजीकरण विफल रहा। कृपया फिर से प्रयास करें।';

  @override
  String get registerHaveAccount => 'पहले से खाता है?';

  @override
  String get registerLogIn => 'लॉग इन';

  @override
  String get forgotTitle => 'अपना पासवर्ड रीसेट करें';

  @override
  String get forgotSubtitle =>
      'अपने खाते का ईमेल दर्ज करें, हम आपको एक लिंक भेजेंगे।';

  @override
  String get forgotSubmit => 'रीसेट लिंक भेजें';

  @override
  String get forgotSentTitle => 'अपना ईमेल देखें';

  @override
  String get forgotSentBody =>
      'यदि इस ईमेल से कोई खाता है, तो हमने पासवर्ड रीसेट लिंक भेज दिया है।';

  @override
  String get forgotFailed => 'रीसेट लिंक नहीं भेजा जा सका';

  @override
  String get resetTitle => 'नया पासवर्ड चुनें';

  @override
  String get resetSubtitle => 'कम से कम 10 अक्षरों का सुरक्षित पासवर्ड चुनें।';

  @override
  String get resetNewPassword => 'नया पासवर्ड';

  @override
  String get resetConfirm => 'नए पासवर्ड की पुष्टि करें';

  @override
  String get resetSubmit => 'पासवर्ड अपडेट करें';

  @override
  String get resetMismatch => 'पासवर्ड मेल नहीं खाते';

  @override
  String get resetInvalidLink =>
      'यह पासवर्ड रीसेट लिंक अमान्य या अधूरा है। नया लिंक माँगें।';

  @override
  String get resetFailed => 'पासवर्ड रीसेट नहीं हो सका';

  @override
  String get resetDoneTitle => 'पासवर्ड अपडेट हो गया';

  @override
  String get resetDoneBody =>
      'आपका पासवर्ड अपडेट हो गया है। नए पासवर्ड से लॉग इन करें।';

  @override
  String get checkEmailTitle => 'अपना ईमेल देखें';

  @override
  String checkEmailSentTo(String email) {
    return 'हमने $email पर एक सत्यापन लिंक भेजा है';
  }

  @override
  String get checkEmailResend => 'ईमेल फिर से भेजें';

  @override
  String get checkEmailCanResendNow => 'अब आप फिर से भेज सकते हैं';

  @override
  String checkEmailResendIn(int seconds) {
    return 'आप $seconds सेकंड में फिर से भेज सकते हैं';
  }

  @override
  String get checkEmailResendFailed => 'ईमेल फिर से नहीं भेजा जा सका';

  @override
  String get checkEmailWrongEmail => 'गलत ईमेल? वापस जाएँ';

  @override
  String get checkEmailBackInstructor => 'शिक्षक साइन इन पर वापस जाएँ';

  @override
  String get verifyVerifying => 'आपका ईमेल सत्यापित किया जा रहा है...';

  @override
  String get verifyPleaseWait =>
      'कृपया प्रतीक्षा करें, आपका ईमेल सत्यापित किया जा रहा है।';

  @override
  String get verifyVerifiedTitle => 'ईमेल सत्यापित हो गया!';

  @override
  String get verifyVerifiedBody =>
      'आपका ईमेल सत्यापित हो गया है। अब आप लॉग इन कर सकते हैं।';

  @override
  String get verifyExpiredTitle => 'इस लिंक की समय-सीमा समाप्त हो गई है';

  @override
  String get verifyExpiredBody =>
      'सत्यापन लिंक 24 घंटे तक मान्य रहते हैं। हम उसी ईमेल पर नया लिंक भेज सकते हैं।';

  @override
  String get verifyFailedTitle => 'सत्यापन विफल रहा';

  @override
  String get verifyFailed => 'सत्यापन विफल रहा';

  @override
  String get verifyInvalidLink => 'अमान्य सत्यापन लिंक';

  @override
  String get verifyNewLinkTitle => 'नया लिंक भेजा गया';

  @override
  String get verifyNewLinkBody =>
      'हमने आपके ईमेल पर नया सत्यापन लिंक भेजा है। खाता सेटअप पूरा करने के लिए इसे 24 घंटे के भीतर खोलें।';

  @override
  String get verifySendNewLink => 'मुझे नया लिंक भेजें';

  @override
  String get verifyNewLinkFailed => 'नया लिंक नहीं भेजा जा सका';

  @override
  String get unverifiedTitle => 'कृपया पहले अपना ईमेल सत्यापित करें';

  @override
  String unverifiedBody(String email) {
    return 'हमने $email पर एक सत्यापन लिंक भेजा था। अगर उसकी समय-सीमा खत्म हो गई है या वह नहीं मिल रहा, तो हम नया भेज सकते हैं।';
  }

  @override
  String get unverifiedResend => 'सत्यापन ईमेल फिर से भेजें';

  @override
  String get socialContinueGoogle => 'Google के साथ जारी रखें';

  @override
  String get socialContinueApple => 'Apple के साथ जारी रखें';

  @override
  String get socialSignUpGoogle => 'Google से साइन अप करें';

  @override
  String get socialSignUpApple => 'Apple से साइन अप करें';

  @override
  String get socialGoogleFailed => 'Google साइन इन विफल रहा';

  @override
  String get socialAppleFailed => 'Apple साइन इन विफल रहा';

  @override
  String get socialAppleNoToken => 'Apple से कोई पहचान टोकन नहीं मिला';

  @override
  String socialDobRequired(String provider) {
    return '$provider से खाता बनाने के लिए आपकी जन्मतिथि आवश्यक है।';
  }

  @override
  String get socialCreateTitle => 'अपना खाता बनाएँ';

  @override
  String socialCreateBody(String provider) {
    return 'इस $provider ईमेल का अभी कोई 3i खाता नहीं है। खाता बनाने के लिए जन्मतिथि दर्ज करें। आपकी आयु कम से कम 13 वर्ष होनी चाहिए।';
  }

  @override
  String get profilesWhoIsLearning => 'आज कौन सीख रहा है?';

  @override
  String get profilesEmpty =>
      'शुरू करने के लिए एक शिक्षार्थी प्रोफ़ाइल जोड़ें।';

  @override
  String get profilesLoadFailed => 'प्रोफ़ाइल लोड नहीं हो सकीं';

  @override
  String get profilesAddLearner => 'शिक्षार्थी जोड़ें';

  @override
  String get profilesLogOut => 'लॉग आउट';

  @override
  String get pinEnter => 'अपना 4 अंकों का पिन दर्ज करें';

  @override
  String get pinIncorrect => 'पिन मेल नहीं खाता। फिर से कोशिश करें।';

  @override
  String pinTriesLeft(int count) {
    return 'गलत पिन। $count प्रयास शेष।';
  }

  @override
  String get pinCheckFailed => 'पिन जाँचा नहीं जा सका। अपना कनेक्शन जाँचें।';

  @override
  String pinTooMany(int seconds) {
    return 'बहुत अधिक प्रयास। $seconds सेकंड बाद फिर प्रयास करें।';
  }

  @override
  String get pinForgot =>
      'पिन भूल गए? खाताधारक से \'प्रोफ़ाइल प्रबंधित करें\' में रीसेट करने को कहें।';

  @override
  String pinProgress(int filled, int length) {
    return 'पिन, $length में से $filled अंक दर्ज';
  }

  @override
  String get settingsTitle => 'खाता सेटिंग्स';

  @override
  String get settingsFamilyTitle => 'परिवार और प्रोफ़ाइल';

  @override
  String get settingsFamilyBody => 'शिक्षार्थी प्रोफ़ाइल और पिन प्रबंधित करें';

  @override
  String get settingsDevicesTitle => 'डिवाइस';

  @override
  String get settingsDevicesBody => 'डिवाइस प्रबंधन वेबसाइट पर उपलब्ध है';

  @override
  String get settingsSubscriptionTitle => 'सदस्यता और भुगतान';

  @override
  String get settingsSubscriptionBody =>
      'हर शिक्षार्थी की सदस्यता का भुगतान और नवीनीकरण करें';

  @override
  String get settingsSecurityTitle => 'लॉग इन और सुरक्षा';

  @override
  String get settingsSecurityBody => 'अपना ईमेल और पासवर्ड अपडेट करें';

  @override
  String get menuAccount => 'उपयोगकर्ता मेनू';

  @override
  String get menuSwitchLearner => 'शिक्षार्थी प्रोफ़ाइल बदलें';

  @override
  String get menuFamily => 'परिवार और प्रोफ़ाइल';

  @override
  String get menuSubscription => 'सदस्यता';

  @override
  String get menuManageAccount => 'खाता प्रबंधित करें';

  @override
  String get menuLogOut => 'लॉग आउट';

  @override
  String get menuCourses => 'कोर्स';

  @override
  String get menuHelp => 'सहायता और समर्थन';

  @override
  String get menuLearnerProfile => 'शिक्षार्थी प्रोफ़ाइल';

  @override
  String dashboardGreeting(String name) {
    return 'अस्सलामु अलैकुम, $name';
  }

  @override
  String get dashboardWelcomeBack => 'आपके डैशबोर्ड पर फिर से स्वागत है';

  @override
  String get dashboardSearchCourses => 'कोर्स खोजें';

  @override
  String get dashboardExploreCourses => 'कोर्स देखें';

  @override
  String get navDashboard => 'डैशबोर्ड';

  @override
  String get navRegularCourses => 'नियमित कोर्स';

  @override
  String get navOnlineClasses => 'ऑनलाइन कक्षाएँ';

  @override
  String get navAssignments => 'असाइनमेंट';

  @override
  String get navExams => 'परीक्षाएँ';

  @override
  String get navCertificates => 'प्रमाणपत्र';

  @override
  String get navWishlist => 'पसंदीदा सूची';

  @override
  String get coursesTitle => 'कोर्स';

  @override
  String get coursesSearch => 'कोर्स, शिक्षक, विषय खोजें...';

  @override
  String get coursesClearSearch => 'खोज साफ़ करें';

  @override
  String get coursesLoading => 'कोर्स लोड हो रहे हैं...';

  @override
  String get coursesLoadFailed => 'कोर्स लोड नहीं हो सके।';

  @override
  String coursesCount(int count) {
    return '$count कोर्स';
  }

  @override
  String get coursesCategory => 'श्रेणी';

  @override
  String get coursesAllCategories => 'सभी श्रेणियाँ';

  @override
  String get coursesType => 'प्रकार';

  @override
  String get coursesAllTypes => 'सभी प्रकार';

  @override
  String get coursesTypeRegular => 'नियमित';

  @override
  String get coursesTypeLive => 'ऑनलाइन कक्षा';

  @override
  String get coursesTypeHybrid => 'हाइब्रिड';

  @override
  String get coursesLanguage => 'भाषा';

  @override
  String get coursesAllLanguages => 'सभी भाषाएँ';

  @override
  String get coursesAge => 'आयु';

  @override
  String get coursesSort => 'क्रम';

  @override
  String get coursesSortPopularity => 'प्रासंगिकता';

  @override
  String get coursesSortNewest => 'नवीनतम';

  @override
  String get coursesSortRating => 'सर्वोच्च रेटिंग';

  @override
  String get coursesSortTitle => 'शीर्षक (A-Z)';

  @override
  String get coursesClearFilters => 'फ़िल्टर हटाएँ';

  @override
  String get coursesClearAllFilters => 'सभी फ़िल्टर हटाएँ';

  @override
  String get coursesNoResults =>
      'आपके फ़िल्टर से मेल खाता कोई कोर्स नहीं मिला।';

  @override
  String coursesPageOf(int page, int total) {
    return 'पृष्ठ $page / $total';
  }

  @override
  String get commonAllAges => 'सभी आयु';

  @override
  String commonAgesFrom(String min) {
    return '$min+ वर्ष';
  }

  @override
  String get commonNewRating => 'नया';

  @override
  String get commonRecommendedAge => 'अनुशंसित आयु वर्ग';

  @override
  String get commonPrevious => 'पिछला';

  @override
  String get commonNext => 'अगला';

  @override
  String get courseCardPreview => 'कोर्स पूर्वावलोकन';

  @override
  String get wishlistAdd => 'विशलिस्ट में जोड़ें';

  @override
  String get wishlistRemove => 'विशलिस्ट से हटाएँ';

  @override
  String get wishlistUpdateFailed => 'विशलिस्ट अपडेट नहीं हो सकी।';

  @override
  String get landingHomeLabel => '3i International Islamic Institute होम';

  @override
  String get landingAccountMenu => 'खाता और शिक्षार्थी मेनू';

  @override
  String get landingAccount => 'खाता';

  @override
  String get menuDashboard => 'डैशबोर्ड';

  @override
  String get menuMyCourses => 'मेरे कोर्स';

  @override
  String get footerTagline => 'गहन शिक्षण। वैश्विक कक्षाएँ। एक संस्थान।';

  @override
  String get footerAbout =>
      'विज्ञान, मानविकी और व्यावसायिक क्षेत्रों में संरचित, मान्यता प्राप्त कार्यक्रम — 40 देशों के छात्रों के लिए।';

  @override
  String footerRights(String year) {
    return '© $year 3i International Islamic Institute। सर्वाधिकार सुरक्षित।';
  }

  @override
  String get homeWelcome => 'स्वागत है';

  @override
  String homeWelcomeName(String name) {
    return 'स्वागत है, $name';
  }

  @override
  String get homeSignedIn => 'आप साइन इन हैं।';

  @override
  String shareText(String title) {
    return '3i International Islamic Institute पर \"$title\" देखें';
  }

  @override
  String get shareDetailsCopied => 'कोर्स विवरण कॉपी हो गया';

  @override
  String get shareLinkCopied => 'लिंक कॉपी हो गया';

  @override
  String get levelBeginner => 'शुरुआती';

  @override
  String get levelIntermediate => 'मध्यम';

  @override
  String get levelAdvanced => 'उन्नत';

  @override
  String get levelAll => 'सभी स्तर';

  @override
  String commonMinutes(int count) {
    return '$count मिनट';
  }

  @override
  String get commonBackToCourses => 'कोर्स पर वापस जाएँ';

  @override
  String get detailLearn => 'आप क्या सीखेंगे';

  @override
  String get detailRequirements => 'आवश्यकताएँ';

  @override
  String get detailAbout => 'इस कोर्स के बारे में';

  @override
  String get detailStudentsAlsoTook => 'छात्रों ने ये भी लिए';

  @override
  String detailBreadcrumb(String category) {
    return 'कोर्स  ›  $category';
  }

  @override
  String detailRatingMeta(String rating, int count) {
    return '$rating · $count समीक्षाएँ';
  }

  @override
  String get detailInstructedBy => 'शिक्षक: ';

  @override
  String get detailLoadFailed => 'कोर्स लोड नहीं हो सका';

  @override
  String get enrolWaitlisted =>
      'प्रतीक्षा सूची में जोड़ा गया। सीट खाली होने पर सूचित किया जाएगा।';

  @override
  String get enrolSuccess => 'नामांकन सफल रहा';

  @override
  String get enrolFailed => 'नामांकन विफल रहा';

  @override
  String get enrolSubscribe => 'सदस्यता लें';

  @override
  String get enrolNoBatches => 'अभी कोई बैच उपलब्ध नहीं है।';

  @override
  String get cardIncluded => 'सदस्यता में शामिल';

  @override
  String get cardEnrolledTitle => 'आप नामांकित हैं';

  @override
  String get cardStartToday => 'आज ही सीखना शुरू करें';

  @override
  String cardNotAvailable(String name, String message, String age) {
    return '$name के लिए उपलब्ध नहीं। $message ($name की आयु $age है)।';
  }

  @override
  String get cardEnrolNow => 'अभी नामांकन करें';

  @override
  String cardNeedsSubscription(String name) {
    return 'कोर्स में नामांकन के लिए $name को सदस्यता चाहिए।';
  }

  @override
  String get cardSubscribeToEnrol => 'नामांकन के लिए सदस्यता लें';

  @override
  String get cardChooseBatch => 'कक्षा बैच चुनें';

  @override
  String get cardManageSubscription => 'सदस्यता प्रबंधित करें';

  @override
  String get cardWhatsIncluded => 'क्या शामिल है';

  @override
  String get batchChoose => 'अपना बैच चुनें';

  @override
  String get batchChooseBody => 'नामांकन जारी रखने के लिए एक कक्षा समूह चुनें।';

  @override
  String get batchSubtitleBody => 'हर उपलब्ध बैच का समय-सारणी और सत्र देखें।';

  @override
  String batchSessions(int count) {
    return '$count सत्र';
  }

  @override
  String batchSeats(int count) {
    return '$count सीटें';
  }

  @override
  String get batchActive => 'सक्रिय';

  @override
  String get batchUpcoming => 'आगामी';

  @override
  String get batchSessionNotes => 'सत्र नोट्स';

  @override
  String get detailSyllabus => 'विस्तृत पाठ्यक्रम';

  @override
  String get detailCurriculum => 'पाठ्यक्रम';

  @override
  String detailLessons(int count) {
    return '$count पाठ';
  }

  @override
  String get detailYourInstructor => 'आपके शिक्षक';

  @override
  String detailInstructorStats(int courses, int learners) {
    return '$courses कोर्स · $learners शिक्षार्थी';
  }

  @override
  String get detailReviews => 'शिक्षार्थियों की समीक्षाएँ';

  @override
  String detailReviewCount(int count) {
    return '$count समीक्षाएँ';
  }

  @override
  String get detailEnrolledShare =>
      'आप इस कोर्स में नामांकित हैं। बताएँ कि कैसा चल रहा है।';

  @override
  String get detailRateReview => 'रेटिंग और समीक्षा दें';

  @override
  String get detailNoReviews => 'अभी कोई समीक्षा नहीं।';

  @override
  String get reviewParent => 'अभिभावक';

  @override
  String get reviewThanks => 'धन्यवाद! आपकी समीक्षा जमा हो गई है।';

  @override
  String get reviewSelectRating => 'कृपया रेटिंग चुनें।';

  @override
  String get reviewSubmitFailed => 'आपकी समीक्षा जमा नहीं हो सकी।';

  @override
  String get reviewTitle => 'इस कोर्स को रेट करें';

  @override
  String reviewSubmittingAs(String name) {
    return '$name के रूप में जमा कर रहे हैं';
  }

  @override
  String get reviewYourRating => 'आपकी रेटिंग';

  @override
  String reviewStars(int count) {
    return '$count स्टार';
  }

  @override
  String get reviewWrite => 'समीक्षा लिखें (वैकल्पिक)';

  @override
  String get reviewHint => 'इस कोर्स के साथ अपना अनुभव साझा करें...';

  @override
  String get reviewSubmit => 'समीक्षा जमा करें';

  @override
  String get cardReviewCourse => 'कोर्स दोहराएँ';

  @override
  String get cardContinue => 'सीखना जारी रखें';

  @override
  String get cardStart => 'सीखना शुरू करें';

  @override
  String get cardComingSoon => 'पाठ जल्द आ रहे हैं';

  @override
  String get cardClassSchedule => 'कक्षा समय-सारणी';

  @override
  String get cardChatRoom => 'चैट रूम';

  @override
  String get cardYourBatch => 'आपका बैच';

  @override
  String get cardDashboard => 'डैशबोर्ड पर जाएँ';

  @override
  String get cardEnrolled => 'नामांकित';

  @override
  String get detailFaq => 'सामान्य प्रश्न';

  @override
  String get membershipTitle => 'एक सदस्यता। हर कोर्स।';

  @override
  String get membershipAllCourses => 'सभी कोर्स';

  @override
  String get membershipAllCoursesBody =>
      'इस्लामी अध्ययन, भाषाएँ, विज्ञान और बहुत कुछ सीखें।';

  @override
  String get membershipLive => 'लाइव कक्षाएँ शामिल';

  @override
  String get membershipLiveBody =>
      'संवादात्मक सेमिनार और लाइव प्रश्नोत्तर में शामिल हों।';

  @override
  String get membershipCertificates => 'प्रमाणपत्र शामिल';

  @override
  String get membershipCertificatesBody =>
      'सीखना पूरा करते हुए प्रमाणपत्र पाएँ।';

  @override
  String get detailShare => 'यह कोर्स साझा करें';

  @override
  String get learnSelectProfileCourses =>
      'कोर्स देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get learnCoursesLoadFailed => 'आपके कोर्स लोड नहीं हो सके';

  @override
  String get learnRegularTitle => 'नियमित कोर्स';

  @override
  String learnRegularCount(int count) {
    return '$count स्व-गति कोर्स';
  }

  @override
  String get learnSearch => 'कोर्स या शिक्षक से खोजें...';

  @override
  String get learnNoRegular => 'अभी कोई नियमित कोर्स नहीं';

  @override
  String get learnNoRegularBody =>
      'अपना अगला पाठ खोजने के लिए कोर्स सूची देखें।';

  @override
  String get learnBrowse => 'कोर्स देखें';

  @override
  String get learnNoMatch => 'कोई मेल खाता कोर्स नहीं';

  @override
  String get learnNoMatchBody => 'कोई दूसरा कोर्स या शिक्षक का नाम आज़माएँ।';

  @override
  String learnLessonsProgress(int done, int total) {
    return '$done/$total पाठ';
  }

  @override
  String get learnNoLessons => 'कोई पाठ नहीं';

  @override
  String get learnResume => 'जारी रखें';

  @override
  String get learnStart => 'सीखना शुरू करें';

  @override
  String get learnExams => 'परीक्षाएँ';

  @override
  String get levelAllCaps => 'सभी स्तर';

  @override
  String get levelBeginnerCaps => 'प्रारंभिक';

  @override
  String get levelIntermediateCaps => 'मध्यम';

  @override
  String get levelAdvancedCaps => 'उन्नत';

  @override
  String get classesSelectProfile =>
      'लाइव कक्षाएँ देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get classesLoadFailed => 'ऑनलाइन कक्षाएँ लोड नहीं हो सकीं';

  @override
  String get classesTitle => 'ऑनलाइन कक्षाएँ';

  @override
  String classesCount(int count) {
    return '$count लाइव कोर्स';
  }

  @override
  String get classesNone => 'अभी कोई लाइव कक्षा नहीं';

  @override
  String get classesNoneBody => 'कक्षा खोजने के लिए कोर्स सूची देखें।';

  @override
  String get classesNoMatch => 'कोई मेल खाती कक्षा नहीं';

  @override
  String get classesNoMatchBody => 'कोई दूसरा कोर्स या शिक्षक का नाम आज़माएँ।';

  @override
  String get classesNoUpcoming => 'कोई आगामी सत्र नहीं';

  @override
  String get classesBatch => 'बैच';

  @override
  String get classesChat => 'चैट';

  @override
  String get classesMoreActions => 'और कार्रवाइयाँ';

  @override
  String get classesDetails => 'विवरण';

  @override
  String get classesSessions => 'सत्र';

  @override
  String get classesExams => 'परीक्षाएँ';

  @override
  String get classesCertificate => 'प्रमाणपत्र';

  @override
  String get classesDateTba => 'तिथि बाद में घोषित होगी';

  @override
  String get scheduleStatusLive => 'अभी लाइव';

  @override
  String get scheduleStatusSoon => 'जल्द शुरू';

  @override
  String get scheduleStatusUpcoming => 'आगामी';

  @override
  String get scheduleStatusCompleted => 'पूर्ण';

  @override
  String get scheduleSectionUpcoming => 'आगामी सत्र';

  @override
  String get scheduleSectionCompleted => 'पिछले सत्र';

  @override
  String get scheduleSelectProfile =>
      'यह कक्षा समय-सारणी देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get scheduleTitle => 'कक्षा समय-सारणी';

  @override
  String get scheduleUnavailable => 'कक्षा समय-सारणी उपलब्ध नहीं';

  @override
  String get scheduleUnavailableBody =>
      'यह बैच लोड नहीं हो सका। हो सकता है आप अब इस बैच में नामांकित न हों, या बैच उपलब्ध न हो।';

  @override
  String scheduleScheduled(int count) {
    return '$count सत्र निर्धारित';
  }

  @override
  String get scheduleNone => 'अभी कोई सत्र निर्धारित नहीं।';

  @override
  String get scheduleNoneHint =>
      'आपके शिक्षक ने इस बैच में अभी कोई सत्र नहीं जोड़ा है।';

  @override
  String get scheduleBack => 'ऑनलाइन कक्षाओं पर वापस जाएँ';

  @override
  String scheduleEnrolledOn(String date) {
    return 'नामांकित $date';
  }

  @override
  String scheduleSessionNumber(int number) {
    return 'सत्र $number';
  }

  @override
  String get scheduleJoin => 'कक्षा में शामिल हों';

  @override
  String get scheduleJoinSoon => 'जल्द शामिल हों';

  @override
  String get scheduleNoLink => 'अभी लिंक नहीं';

  @override
  String get scheduleCompleted => 'पूर्ण';

  @override
  String get scheduleNotStarted => 'शुरू नहीं हुआ';

  @override
  String get scheduleLinkFailed => 'मीटिंग लिंक नहीं खुल सका।';

  @override
  String get lessonReloadFailed =>
      'फिर से लोड नहीं हो सका। अपना कनेक्शन जाँचें।';

  @override
  String get lessonProgressSaveFailed =>
      'प्रगति सहेजी नहीं जा सकी। अगली बार फिर प्रयास होगा।';

  @override
  String get lessonNoteEmpty => 'नोट खाली नहीं हो सकता';

  @override
  String get lessonNoteSaveFailed =>
      'नोट सहेजा नहीं जा सका। कृपया फिर प्रयास करें।';

  @override
  String get lessonSelectProfile =>
      'जारी रखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get lessonTitle => 'पाठ';

  @override
  String get lessonLoadFailed => 'कोर्स के पाठ लोड नहीं हो सके।';

  @override
  String get lessonNotInCourse => 'यह पाठ इस कोर्स का हिस्सा नहीं है।';

  @override
  String get lessonReload => 'फिर से लोड करें';

  @override
  String get lessonCourseContent => 'कोर्स सामग्री';

  @override
  String get lessonPrevious => 'पिछला';

  @override
  String get lessonNext => 'अगला';

  @override
  String lessonCourseName(String title) {
    return 'कोर्स: $title';
  }

  @override
  String get lessonOverview => 'अवलोकन';

  @override
  String get lessonNotes => 'नोट्स';

  @override
  String get lessonDefaultOverview =>
      'यह पाठ पूरा करें, फिर विषयों के बीच जाने के लिए कोर्स सामग्री बटन का उपयोग करें।';

  @override
  String get lessonNotesHint => 'इस पाठ के लिए अपने नोट्स लिखें...';

  @override
  String get lessonSaved => 'सहेजा गया';

  @override
  String get lessonSaveNote => 'नोट सहेजें';

  @override
  String get lessonDocUnavailable => 'दस्तावेज़ उपलब्ध नहीं';

  @override
  String get lessonMarkedComplete => 'पाठ पूर्ण के रूप में चिह्नित';

  @override
  String get lessonReadOnlyKeepReading =>
      'केवल पढ़ने के लिए • पाठ पूरा करने के लिए पढ़ते रहें';

  @override
  String get lessonReadOnlyPdf => 'केवल पढ़ने के लिए PDF';

  @override
  String get lessonMediaUnavailable => 'पाठ मीडिया उपलब्ध नहीं';

  @override
  String get lessonOpenLinkTitle => 'पाठ का लिंक खोलें';

  @override
  String get lessonOpenLink => 'लिंक खोलें';

  @override
  String get lessonPdfFailed =>
      'यह दस्तावेज़ लोड नहीं हो सका। अपना कनेक्शन जाँचें और फिर कोशिश करें।';

  @override
  String get lessonReloadPdf => 'PDF फिर से लोड करें';

  @override
  String get videoCheckConnection => 'अपना कनेक्शन जाँचें, फिर प्रयास करें।';

  @override
  String videoCouldNotPlay(String reason) {
    return 'वीडियो नहीं चल सका। $reason';
  }

  @override
  String get videoInterrupted => 'प्लेबैक बाधित हुआ। कृपया फिर प्रयास करें।';

  @override
  String get videoBack10 => '10 सेकंड पीछे';

  @override
  String get videoForward10 => '10 सेकंड आगे';

  @override
  String get videoSpeed => 'प्लेबैक गति';

  @override
  String get videoNormal => 'सामान्य';

  @override
  String get videoFullScreen => 'पूर्ण स्क्रीन';

  @override
  String get videoExitFullScreen => 'पूर्ण स्क्रीन से बाहर निकलें';

  @override
  String get videoPause => 'रोकें';

  @override
  String get videoPlay => 'चलाएँ';

  @override
  String get lessonCourseExam => 'कोर्स परीक्षा';

  @override
  String get lessonExamUnlocked =>
      'आपने कोर्स का 90% पूरा कर लिया — अब आप परीक्षा दे सकते हैं।';

  @override
  String lessonExamLocked(int progress) {
    return 'परीक्षा अनलॉक करने के लिए कोर्स का 90% पूरा करें। आप अभी $progress% पर हैं।';
  }

  @override
  String get lessonCourseProgress => 'कोर्स प्रगति';

  @override
  String get lessonExamUnlockedShort => 'परीक्षा अनलॉक — शुभकामनाएँ!';

  @override
  String get lessonExamUnlockHint =>
      'कोर्स का 90% पूरा होते ही परीक्षा अपने आप अनलॉक हो जाएगी।';

  @override
  String get lessonTakeExam => 'परीक्षा दें';

  @override
  String get lessonLocked => 'लॉक';

  @override
  String get lessonCertificateFailed =>
      'आपका प्रमाणपत्र नहीं बन सका। कृपया फिर प्रयास करें।';

  @override
  String get lessonCourseCertificate => 'कोर्स प्रमाणपत्र';

  @override
  String get lessonCertificateHint =>
      'अपनी कोर्स प्रगति और अंतिम परीक्षा अंक वाला प्रमाणपत्र बनाएँ। यह केवल एक बार किया जा सकता है।';

  @override
  String get lessonCertificateLocked =>
      'प्रमाणपत्र अनलॉक करने के लिए कम से कम एक बार परीक्षा दें।';

  @override
  String get lessonGenerating => 'बनाया जा रहा है...';

  @override
  String get lessonGenerateCertificate => 'प्रमाणपत्र बनाएँ';

  @override
  String get lessonPending => 'लंबित';

  @override
  String get lessonCertificateGenerated => 'प्रमाणपत्र बन गया';

  @override
  String lessonIssuedOn(String date) {
    return 'जारी किया गया $date';
  }

  @override
  String get lessonLastExamScore => 'अंतिम परीक्षा अंक';

  @override
  String lessonLatestAttempt(String title) {
    return 'नवीनतम प्रयास: $title';
  }

  @override
  String lessonAttemptNumber(int number) {
    return 'प्रयास #$number';
  }

  @override
  String get lessonVerificationCode => 'सत्यापन कोड:';

  @override
  String get lessonDownloadPdf => 'PDF डाउनलोड करें';

  @override
  String get commonCheckConnection => 'अपना कनेक्शन जाँचें और फिर प्रयास करें।';

  @override
  String get commonNoCoursesYet => 'अभी किसी कोर्स में नामांकन नहीं';

  @override
  String get commonOnlineClassSuffix => ' • ऑनलाइन कक्षा';

  @override
  String get assignSelectProfile =>
      'असाइनमेंट देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get assignTitle => 'असाइनमेंट';

  @override
  String get assignSelectCourse => 'असाइनमेंट देखने के लिए एक कोर्स चुनें।';

  @override
  String get assignNoCoursesBody =>
      'कोर्स देखें और नामांकन करें, फिर यहाँ असाइनमेंट दिखेंगे।';

  @override
  String get assignSubmitted => 'असाइनमेंट जमा हो गया';

  @override
  String get assignSubmitFailed => 'असाइनमेंट जमा नहीं हो सका';

  @override
  String get assignLoadFailed => 'असाइनमेंट लोड नहीं हो सके';

  @override
  String get assignBack => 'असाइनमेंट पर वापस जाएँ';

  @override
  String assignCount(int count) {
    return 'इस कोर्स के लिए $count असाइनमेंट';
  }

  @override
  String get assignNone => 'अभी कोई असाइनमेंट नहीं';

  @override
  String get assignNoneBody => 'इस कोर्स के लिए अभी कोई असाइनमेंट नहीं।';

  @override
  String get assignNoDeadline => 'कोई समय-सीमा नहीं';

  @override
  String assignDue(String date) {
    return 'अंतिम तिथि: $date';
  }

  @override
  String assignMarks(int count) {
    return '$count अंक';
  }

  @override
  String get assignYourSubmission => 'आपकी प्रविष्टि';

  @override
  String get assignOpenFile => 'संलग्न फ़ाइल खोलें';

  @override
  String assignMarksAwarded(String awarded, int total) {
    return 'अंक: $awarded/$total';
  }

  @override
  String assignFeedback(String feedback) {
    return 'प्रतिक्रिया: $feedback';
  }

  @override
  String get assignAnswerHint => 'अपना उत्तर लिखें...';

  @override
  String get assignSubmitting => 'जमा हो रहा है...';

  @override
  String get assignSubmit => 'असाइनमेंट जमा करें';

  @override
  String get assignFileFailed => 'संलग्न फ़ाइल नहीं खुल सकी।';

  @override
  String get assignGraded => 'मूल्यांकित';

  @override
  String get assignSubmittedBadge => 'जमा किया गया';

  @override
  String get examsSelectProfile =>
      'परीक्षाएँ देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get examsSelectProfileFirst => 'पहले एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get examsTitle => 'परीक्षाएँ';

  @override
  String get examsSelectCourse =>
      'परीक्षाएँ देखने और देने के लिए एक कोर्स चुनें।';

  @override
  String get examsNoCoursesBody =>
      'कोर्स देखें और नामांकन करें, फिर यहाँ परीक्षाएँ दिखेंगी।';

  @override
  String get examsLoadFailed => 'परीक्षाएँ लोड नहीं हो सकीं';

  @override
  String get examsBackOnline => 'ऑनलाइन कक्षाओं पर वापस जाएँ';

  @override
  String get examsBackRegular => 'नियमित कोर्स पर वापस जाएँ';

  @override
  String examsAvailable(int count) {
    return '$count परीक्षाएँ उपलब्ध';
  }

  @override
  String get examsNone => 'कोई परीक्षा उपलब्ध नहीं';

  @override
  String get examsNoneBody => 'इस कोर्स में अभी कोई परीक्षा नहीं है।';

  @override
  String get examsTypePractice => 'अभ्यास';

  @override
  String get examsTypeFinal => 'अंतिम';

  @override
  String get examsPassed => 'उत्तीर्ण';

  @override
  String get examsInProgress => 'जारी';

  @override
  String get examsRandomQuestions => 'यादृच्छिक प्रश्न';

  @override
  String examsQuestions(int count) {
    return '$count प्रश्न';
  }

  @override
  String examsPassMark(int mark) {
    return 'उत्तीर्ण: $mark%';
  }

  @override
  String examsAttempts(String value) {
    return 'प्रयास: $value';
  }

  @override
  String examsBestScore(String score, int total) {
    return 'सर्वश्रेष्ठ अंक: $score/$total';
  }

  @override
  String get examsTimeLeft => 'आपके प्रयास में बचा समय';

  @override
  String get examsTimesUp => 'समय समाप्त';

  @override
  String get examsTimerRunning =>
      'टाइमर चल रहा है — जारी रखने के लिए फिर शुरू करें।';

  @override
  String get examsOpenToSubmit =>
      'सहेजे गए उत्तर जमा करने के लिए परीक्षा खोलें।';

  @override
  String get examsStartsIn => 'शुरू होगी';

  @override
  String examsOpens(String date) {
    return 'खुलेगी $date';
  }

  @override
  String get examsWindowClosesIn => 'शुरू करने का समय बंद होगा';

  @override
  String examsStartBefore(String date) {
    return '$date से पहले शुरू करें';
  }

  @override
  String get examsViewResult => 'परिणाम देखें';

  @override
  String get examsResume => 'परीक्षा फिर शुरू करें';

  @override
  String get examsSubmitAnswers => 'उत्तर जमा करें';

  @override
  String get examsMaxAttempts => 'अधिकतम प्रयास पूरे';

  @override
  String get examsNotStartedYet => 'अभी शुरू नहीं हुई';

  @override
  String get examsWindowClosed => 'शुरू करने का समय बंद';

  @override
  String get examsTake => 'परीक्षा दें';

  @override
  String get examsBack => 'परीक्षाओं पर वापस जाएँ';

  @override
  String examsCountdownDays(int d, String h, String m) {
    return '$dदि $hघं $mमि';
  }

  @override
  String takeMinutesLeft(int count) {
    return '$count मिनट बचे';
  }

  @override
  String get takeOneMinuteLeft =>
      '1 मिनट बचा — आपकी परीक्षा अपने आप जमा हो जाएगी';

  @override
  String get takeNotStartedToast => 'यह परीक्षा अभी शुरू नहीं हुई';

  @override
  String get takeWindowClosedToast =>
      'इस परीक्षा को शुरू करने का समय बंद हो गया';

  @override
  String get takeSubmittedToast => 'परीक्षा जमा हो गई';

  @override
  String get takeSubmitError =>
      'आपकी परीक्षा जमा नहीं हो सकी। कृपया फिर से कोशिश करें।';

  @override
  String get takeStartFailed =>
      'परीक्षा शुरू नहीं हो सकी। कृपया फिर से कोशिश करें।';

  @override
  String get takeConfirmTitle => 'परीक्षा जमा करें?';

  @override
  String takeConfirmUnanswered(int count) {
    return 'आपके $count प्रश्नों के उत्तर बाकी हैं। जमा करने के बाद उत्तर नहीं बदले जा सकते।';
  }

  @override
  String get takeConfirmAll =>
      'आपने सभी प्रश्नों के उत्तर दिए हैं। जमा करने के बाद उत्तर नहीं बदले जा सकते।';

  @override
  String get takeAnswered => 'उत्तर दिया';

  @override
  String get takeUnanswered => 'उत्तर बाकी';

  @override
  String get takeNotAnswered => 'उत्तर नहीं दिया';

  @override
  String get takeFlagged => 'चिह्नित';

  @override
  String get takeFlag => 'चिह्न';

  @override
  String get takeKeepWorking => 'जारी रखें';

  @override
  String get takeSubmitExam => 'परीक्षा जमा करें';

  @override
  String get takeLeaveTitle => 'परीक्षा छोड़ें?';

  @override
  String get takeLeaveBody =>
      'आपके उत्तर सहेजे गए हैं, पर टाइमर चलता रहेगा। आप परीक्षा सूची से फिर शुरू कर सकते हैं।';

  @override
  String get takeStay => 'रुकें';

  @override
  String get takeLeave => 'छोड़ें';

  @override
  String get takeQuestions => 'प्रश्न';

  @override
  String takeAnsweredOf(int answered, int total) {
    return '$total में से $answered उत्तर दिए';
  }

  @override
  String takeFlaggedCount(int count) {
    return '$count चिह्नित';
  }

  @override
  String get takeSubmittedTitle => 'परीक्षा जमा हो गई';

  @override
  String get takeTakingToResult => 'आपको परिणाम पर ले जाया जा रहा है…';

  @override
  String get takeLoadFailedTitle => 'परीक्षा लोड नहीं हो सकी';

  @override
  String get takeNotStartedTitle => 'परीक्षा अभी शुरू नहीं हुई';

  @override
  String takeNotStartedBody(String date) {
    return 'यह परीक्षा $date को शुरू होगी। शुरू होने के बाद परीक्षा अवधि का 50% बीतने तक आप कभी भी शुरू कर सकते हैं।';
  }

  @override
  String get takeClosedTitle => 'शुरू करने का समय बंद';

  @override
  String takeClosedBody(String date) {
    return 'यह परीक्षा $date तक शुरू की जा सकती थी। शुरू करने का समय अब बीत चुका है।';
  }

  @override
  String get takeNoQuestionsTitle => 'कोई प्रश्न उपलब्ध नहीं';

  @override
  String get takeNoQuestionsBody => 'इस परीक्षा में अभी कोई प्रश्न नहीं है।';

  @override
  String get takeAllQuestions => 'सभी प्रश्न दिखाएँ';

  @override
  String takeQuestionOf(int n, int total) {
    return 'प्रश्न $n / $total';
  }

  @override
  String takeMarks(int count) {
    return '$count अंक';
  }

  @override
  String get takeSubmitting => 'जमा हो रहा है...';

  @override
  String get takeReviewSubmit => 'समीक्षा करें और जमा करें';

  @override
  String get takeNext => 'अगला';

  @override
  String get takeAnswerHint => 'अपना उत्तर लिखें...';

  @override
  String takeWords(int count) {
    return '$count शब्द';
  }

  @override
  String get takeNoOptions => 'इस प्रश्न के लिए कोई विकल्प उपलब्ध नहीं।';

  @override
  String get takeSelectAll => 'लागू होने वाले सभी चुनें';

  @override
  String get takeTimesUp => 'समय समाप्त';

  @override
  String get takeSubmittingAnswers => 'आपके उत्तर जमा हो रहे हैं…';

  @override
  String get takeSubmissionFailed => 'जमा करना विफल';

  @override
  String get takeSavedOnDevice =>
      'आपके उत्तर इस डिवाइस पर सहेजे गए हैं। कनेक्शन जाँचें और फिर कोशिश करें।';

  @override
  String get takeRetrySubmit => 'फिर से जमा करें';

  @override
  String get takeDiscardLeave => 'छोड़ें और बाहर जाएँ';

  @override
  String takeTimeRemaining(String time) {
    return 'शेष समय $time';
  }

  @override
  String get takeDuration => 'अवधि';

  @override
  String get takeTotalMarks => 'कुल अंक';

  @override
  String get takePassMarkLabel => 'उत्तीर्णांक';

  @override
  String takeRule1(int minutes) {
    return 'शुरू दबाते ही टाइमर चालू होगा और $minutes मिनट चलेगा — ऐप छोड़ने या बंद करने पर भी चलता रहेगा।';
  }

  @override
  String get takeRule2 =>
      'आपके उत्तर इस डिवाइस पर अपने-आप सहेजे जाते हैं। वापस आने पर आप वहीं से जारी रखेंगे।';

  @override
  String get takeRule3 => 'पूरी परीक्षा के लिए एक ही डिवाइस का उपयोग करें।';

  @override
  String get takeRule4 => 'समय खत्म होने पर आपके उत्तर अपने आप जमा हो जाएँगे।';

  @override
  String takeStartBeforeFull(String date) {
    return '$date से पहले शुरू करें। शुरू करने पर आपको पूरा समय मिलेगा।';
  }

  @override
  String get takeBeforeYouBegin => 'शुरू करने से पहले';

  @override
  String get takeStart => 'परीक्षा शुरू करें';

  @override
  String get resultPassed => 'बधाई हो! आप उत्तीर्ण हुए।';

  @override
  String get resultGrading => 'आपके लिखित उत्तरों का मूल्यांकन हो रहा है।';

  @override
  String get resultFailed =>
      'आप उत्तीर्ण नहीं हुए। अपने उत्तर देखें और फिर प्रयास करें।';

  @override
  String resultPassDuration(int mark, int minutes) {
    return 'उत्तीर्णांक: $mark% • अवधि: $minutes मिनट';
  }

  @override
  String get resultScore => 'अंक';

  @override
  String get resultAttempts => 'प्रयास';

  @override
  String get resultTimeTaken => 'लिया गया समय';

  @override
  String resultMinutesShort(int count) {
    return '$countमि';
  }

  @override
  String get resultHistory => 'प्रयास इतिहास';

  @override
  String resultShowHistory(int count) {
    return 'प्रयास इतिहास देखें ($count)';
  }

  @override
  String get resultHideHistory => 'प्रयास इतिहास छिपाएँ';

  @override
  String get resultReview => 'प्रश्न समीक्षा';

  @override
  String get resultReviewHint => 'अपने उत्तर और सही उत्तर देखें।';

  @override
  String get resultNoAttempts => 'कोई प्रयास नहीं मिला।';

  @override
  String resultShowingAttempt(int number) {
    return 'प्रयास #$number के उत्तर दिखाए जा रहे हैं।';
  }

  @override
  String resultBestScore(String score, int total, int number) {
    return 'सर्वोच्च अंक: $score/$total (प्रयास #$number)';
  }

  @override
  String resultPassedEarlier(int number) {
    return 'आप इस प्रयास में पास नहीं हुए, लेकिन प्रयास #$number में आप पहले ही पास हो चुके हैं।';
  }

  @override
  String resultSummaryTitle(int number) {
    return 'प्रयास #$number का सारांश';
  }

  @override
  String get resultTotalQuestions => 'प्रश्न';

  @override
  String get resultAnswered => 'उत्तर दिए';

  @override
  String get resultUnanswered => 'अनुत्तरित';

  @override
  String get resultMarksDeducted => 'ऋणात्मक अंक';

  @override
  String get resultRetake => 'फिर से परीक्षा दें';

  @override
  String resultAwarded(String awarded, int total) {
    return '$total में से $awarded दिए गए';
  }

  @override
  String get resultAwaitingGrading => 'मूल्यांकन की प्रतीक्षा';

  @override
  String get resultCorrect => 'सही';

  @override
  String get resultPartial => 'आंशिक रूप से सही';

  @override
  String get resultIncorrect => 'गलत';

  @override
  String get resultYourAnswer => 'आपका उत्तर';

  @override
  String get resultSuggestedAnswer => 'सुझाया गया उत्तर';

  @override
  String get resultCorrectAnswer => 'सही उत्तर';

  @override
  String get resultExplanation => 'व्याख्या';

  @override
  String resultAttempt(int number) {
    return 'प्रयास #$number';
  }

  @override
  String get resultLoadFailed => 'परिणाम लोड नहीं हो सका।';

  @override
  String get resultPending => 'लंबित';

  @override
  String get resultPassedBadge => 'उत्तीर्ण';

  @override
  String get resultFailedBadge => 'अनुत्तीर्ण';

  @override
  String get certSelectProfile =>
      'प्रमाणपत्र देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get certLoadFailed => 'आपके प्रमाणपत्र लोड नहीं हो सके।';

  @override
  String get certEyebrow => 'आपकी उपलब्धियाँ';

  @override
  String get certTitle => 'मेरे प्रमाणपत्र';

  @override
  String get certSubtitle =>
      'अपने कोर्स के प्रमाणपत्र देखें, सत्यापित करें और सहेजें।';

  @override
  String get certSearch => 'कोर्स, परीक्षा या सत्यापन कोड खोजें...';

  @override
  String get certEmpty => 'अभी कोई प्रमाणपत्र नहीं';

  @override
  String get certNoMatch => 'आपकी खोज से कोई प्रमाणपत्र मेल नहीं खाता';

  @override
  String get certEmptyHint => 'आपके अर्जित प्रमाणपत्र यहाँ दिखेंगे।';

  @override
  String get certNoMatchHint => 'कोई दूसरी खोज आज़माएँ।';

  @override
  String certShowing(int shown, int total) {
    return '$total में से $shown प्रमाणपत्र दिखाए जा रहे हैं';
  }

  @override
  String get certDateUnavailable => 'तिथि उपलब्ध नहीं';

  @override
  String get certValid => 'मान्य';

  @override
  String certIssued(String date) {
    return 'जारी $date';
  }

  @override
  String certResult(String score, int total) {
    return 'परिणाम: $score / $total';
  }

  @override
  String get certPassed => 'उत्तीर्ण';

  @override
  String get certNotPassed => 'अनुत्तीर्ण';

  @override
  String get certHide => 'छिपाएँ';

  @override
  String get certPreview => 'पूर्वावलोकन';

  @override
  String get certSavePdf => 'PDF सहेजें';

  @override
  String get certAchievement => 'उपलब्धि प्रमाणपत्र';

  @override
  String get certPresentedTo => 'प्रदान किया गया';

  @override
  String get certFor => 'हेतु';

  @override
  String certProgress(int progress) {
    return 'कोर्स प्रगति $progress%';
  }

  @override
  String certId(String id) {
    return 'प्रमाणपत्र आईडी: $id';
  }

  @override
  String certCode(String code) {
    return 'सत्यापन कोड: $code';
  }

  @override
  String get certCodeCopied => 'सत्यापन कोड कॉपी हो गया';

  @override
  String get certCopyCode => 'कोड कॉपी करें';

  @override
  String get certPdfFailed => 'PDF पूर्वावलोकन नहीं खुल सका।';

  @override
  String get certAllTypes => 'सभी प्रकार';

  @override
  String get certTypeAttendance => 'उपस्थिति';

  @override
  String get certTypeCompletion => 'पूर्णता';

  @override
  String get certTypeCourseCompletion => 'कोर्स पूर्णता';

  @override
  String get certTypeExam => 'परीक्षा';

  @override
  String get wishlistRemoved => 'विशलिस्ट से हटाया गया';

  @override
  String get wishlistRemoveFailed => 'विशलिस्ट से हटाया नहीं जा सका';

  @override
  String get wishlistSelectProfile =>
      'विशलिस्ट देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get wishlistLoadFailed => 'विशलिस्ट लोड नहीं हो सकी';

  @override
  String get wishlistTitle => 'विशलिस्ट';

  @override
  String wishlistCount(int count) {
    return 'बाद के लिए $count कोर्स सहेजे गए';
  }

  @override
  String get wishlistEmpty => 'आपकी विशलिस्ट खाली है';

  @override
  String get wishlistEmptyBody => 'पसंद के कोर्स सहेजें और यहाँ वापस आएँ।';

  @override
  String get wishlistCourse => 'कोर्स';

  @override
  String get wishlistViewDetails => 'कोर्स विवरण देखें';

  @override
  String get formatSelfPaced => 'स्व-गति';

  @override
  String get formatLive => 'लाइव कक्षा';

  @override
  String get notifTitle => 'सूचनाएँ';

  @override
  String get notifMarkReadFailed => 'पढ़ा हुआ चिह्नित नहीं हो सका';

  @override
  String get notifMarkAllRead => 'सभी पढ़े गए';

  @override
  String notifUnread(int count) {
    return '$count अपठित';
  }

  @override
  String get notifLoadFailed => 'सूचनाएँ लोड नहीं हो सकीं।';

  @override
  String get notifTapRetry => 'फिर प्रयास के लिए टैप करें';

  @override
  String get notifCaughtUp => 'आप सब देख चुके हैं।';

  @override
  String get notifRemoveFailed => 'सूचना हटाई नहीं जा सकी';

  @override
  String get notifJustNow => 'अभी-अभी';

  @override
  String notifMinutesAgo(int count) {
    return '$count मिनट पहले';
  }

  @override
  String notifHoursAgo(int count) {
    return '$count घंटे पहले';
  }

  @override
  String notifDaysAgo(int count) {
    return '$count दिन पहले';
  }

  @override
  String get notifView => 'देखें';

  @override
  String notifBellUnread(int count) {
    return 'सूचनाएँ, $count अपठित';
  }

  @override
  String get chatNoCourse => 'कोर्स निर्दिष्ट नहीं है।';

  @override
  String get chatSelectProfile =>
      'इस कक्षा चैट में शामिल होने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get chatConnectFailed =>
      'कक्षा चैट से कनेक्ट नहीं हो सका। कृपया फिर प्रयास करें।';

  @override
  String get chatTooLong => 'संदेश अधिकतम 2,000 अक्षरों का हो सकता है।';

  @override
  String get chatReportTitle => 'संदेश की रिपोर्ट करें';

  @override
  String get chatReportWhy => 'इस संदेश की समीक्षा क्यों होनी चाहिए?';

  @override
  String get chatReportHint => 'समस्या बताएँ...';

  @override
  String get chatSubmitReport => 'रिपोर्ट जमा करें';

  @override
  String get chatReported => 'संदेश की समीक्षा के लिए रिपोर्ट की गई।';

  @override
  String get chatReportFailed =>
      'संदेश की रिपोर्ट नहीं हो सकी। कृपया फिर प्रयास करें।';

  @override
  String chatClassChat(String batch) {
    return '$batch • कक्षा चैट';
  }

  @override
  String get chatDismiss => 'हटाएँ';

  @override
  String get chatRetry => 'फिर कोशिश करें';

  @override
  String get chatPlaceholder => 'संदेश लिखें...';

  @override
  String get chatConnecting => 'कनेक्ट हो रहा है...';

  @override
  String get chatSend => 'संदेश भेजें';

  @override
  String get chatLive => 'लाइव';

  @override
  String get chatOffline => 'ऑफ़लाइन';

  @override
  String get chatNextClass => 'अगली लाइव कक्षा';

  @override
  String get chatJoinClass => 'कक्षा में शामिल हों';

  @override
  String get chatEmpty => 'अभी कोई संदेश नहीं। अपने सहपाठियों को नमस्ते कहें!';

  @override
  String get chatInstructor => 'शिक्षक';

  @override
  String get chatMessageActions => 'संदेश कार्रवाइयाँ';

  @override
  String get chatTimeTba => 'समय बाद में घोषित होगा';

  @override
  String chatDateAt(String date, String time) {
    return '$date, $time बजे';
  }

  @override
  String get familyTitle => 'आपके शिक्षार्थियों की प्रोफ़ाइल';

  @override
  String get familyAddProfile => 'प्रोफ़ाइल जोड़ें';

  @override
  String get familyEmpty =>
      'अभी कोई शिक्षार्थी प्रोफ़ाइल नहीं। शुरू करने के लिए एक प्रोफ़ाइल जोड़ें।';

  @override
  String get familySubscribed => 'सदस्यता सक्रिय';

  @override
  String get familySubscription => 'सदस्यता';

  @override
  String get familySubscribe => 'सदस्यता लें';

  @override
  String get commonEdit => 'संपादित करें';

  @override
  String get pinReset => 'पिन रीसेट करें';

  @override
  String get pinSet => 'पिन सेट करें';

  @override
  String get imageInvalidType => 'JPEG, PNG, WebP या GIF छवि चुनें।';

  @override
  String get imageTooLarge => 'चित्र 5 MB या उससे छोटा होना चाहिए';

  @override
  String get imagePickerFailed => 'आपकी फ़ोटो लाइब्रेरी नहीं खुल सकी।';

  @override
  String get learnerChooseDob => 'जन्मतिथि चुनें।';

  @override
  String get learnerPhotoUploadFailed =>
      'शिक्षार्थी बन गया, पर फ़ोटो अपलोड नहीं हो सकी। आप इसे प्रोफ़ाइल प्रबंधन से जोड़ सकते हैं।';

  @override
  String get learnerCreateFailed => 'प्रोफ़ाइल नहीं बन सकी';

  @override
  String get learnerAddTitle => 'एक शिक्षार्थी जोड़ें';

  @override
  String get learnerAddPhoto => 'प्रोफ़ाइल चित्र जोड़ें';

  @override
  String get learnerChangePhoto => 'प्रोफ़ाइल चित्र बदलें';

  @override
  String get learnerRemovePhoto => 'फ़ोटो हटाएँ';

  @override
  String get learnerAddPhotoOptional => 'प्रोफ़ाइल फ़ोटो जोड़ें (वैकल्पिक)';

  @override
  String get learnerName => 'शिक्षार्थी का नाम';

  @override
  String get learnerNameRequired => 'नाम आवश्यक है';

  @override
  String get learnerNameTooLong => 'अधिकतम 100 अक्षरों का नाम दर्ज करें।';

  @override
  String get learnerDob => 'जन्म तिथि';

  @override
  String get learnerPinOptional => '4 अंकों का पिन (वैकल्पिक)';

  @override
  String get learnerPinFormat => 'पिन ठीक 4 अंकों का होना चाहिए';

  @override
  String get learnerPinMismatch => 'पिन मेल नहीं खाते';

  @override
  String get learnerCreate => 'शिक्षार्थी जोड़ें';

  @override
  String get learnerLoadFailed => 'शिक्षार्थी प्रोफ़ाइल लोड नहीं हो सकी।';

  @override
  String get learnerUpdateFailed => 'प्रोफ़ाइल अपडेट नहीं हो सकी';

  @override
  String get learnerNotFound => 'प्रोफ़ाइल नहीं मिली';

  @override
  String learnerEditTitle(String name) {
    return '$name की प्रोफ़ाइल संपादित करें';
  }

  @override
  String get learnerNameLocked =>
      'प्रमाणपत्र जारी हो चुका है, इसलिए नाम बदला नहीं जा सकता।';

  @override
  String get learnerCancelPinChange => 'पिन बदलना रद्द करें';

  @override
  String get learnerNewPin => 'नया 4 अंकों का पिन';

  @override
  String get learnerConfirmNewPin => 'नए पिन की पुष्टि करें';

  @override
  String get commonSaving => 'सहेजा जा रहा है...';

  @override
  String get learnerSaveChanges => 'बदलाव सहेजें';

  @override
  String get deleteFailed => 'प्रोफ़ाइल हटाई नहीं जा सकी';

  @override
  String deleteTitle(String name) {
    return '$name की प्रोफ़ाइल हटाएँ?';
  }

  @override
  String get deleteDestroyed => 'यह मिट जाएगा:';

  @override
  String get deleteDestroyedItems =>
      'प्रगति, नामांकन, परीक्षा परिणाम और चैट संदेश।';

  @override
  String get deleteSurvives => 'यह बना रहेगा:';

  @override
  String get deleteSurvivesItems => 'प्रमाणपत्र और मॉडरेशन रिकॉर्ड।';

  @override
  String deleteTypeName(String name) {
    return 'पुष्टि के लिए $name लिखें';
  }

  @override
  String get deleteDeleting => 'हटाया जा रहा है…';

  @override
  String get deleteConfirm => 'प्रोफ़ाइल हटाएँ';

  @override
  String get deleteGoBack => 'नहीं, वापस जाएँ';

  @override
  String get avatarLabel => 'शिक्षार्थी अवतार';

  @override
  String get secServerUnreachable =>
      'सर्वर तक नहीं पहुँच सके। अपना इंटरनेट कनेक्शन जाँचें और फिर प्रयास करें।';

  @override
  String get secTooManyAttempts =>
      'बहुत अधिक प्रयास। थोड़ा रुककर फिर प्रयास करें।';

  @override
  String get secTitle => 'लॉग इन और सुरक्षा';

  @override
  String get secEmailRequired => 'अपना नया ईमेल पता दर्ज करें।';

  @override
  String get secEmailInvalid =>
      'मान्य ईमेल पता दर्ज करें, जैसे name@example.com।';

  @override
  String get secEmailSame => 'यह पहले से आपका ईमेल पता है।';

  @override
  String get secConfirmWithPassword =>
      'पुष्टि के लिए वर्तमान पासवर्ड दर्ज करें।';

  @override
  String get secEmailUpdated =>
      'ईमेल अपडेट हो गया। सत्यापन लिंक के लिए नया इनबॉक्स देखें।';

  @override
  String get secEmailUpdateFailed =>
      'आपका ईमेल अपडेट नहीं हो सका। कृपया फिर से कोशिश करें।';

  @override
  String get secEmail => 'ईमेल';

  @override
  String get secEmailLoadFailed => 'आपका ईमेल लोड नहीं हो सका।';

  @override
  String get secRetry => 'फिर कोशिश करें';

  @override
  String get secLoadingEmail => 'खाते का ईमेल लोड हो रहा है…';

  @override
  String get secUnverified => 'असत्यापित — सत्यापन लिंक के लिए अपना ईमेल देखें';

  @override
  String get secVerified => 'सत्यापित ✓';

  @override
  String get secChangeEmail => 'ईमेल बदलें';

  @override
  String get secNewEmail => 'नया ईमेल';

  @override
  String get secCurrentPassword => 'वर्तमान पासवर्ड';

  @override
  String get secPasswordConfirmHint =>
      'यह आप ही हैं, इसकी पुष्टि के लिए हम पासवर्ड पूछते हैं।';

  @override
  String get secSaveEmail => 'ईमेल सहेजें';

  @override
  String get secEmailChangeNote =>
      'नया ईमेल लागू होने से पहले उसे सत्यापित करना होगा। तब तक आपका खाता पूरी तरह सक्रिय रहेगा।';

  @override
  String get secCurrentRequired => 'अपना वर्तमान पासवर्ड दर्ज करें।';

  @override
  String get secNewRequired => 'नया पासवर्ड दर्ज करें।';

  @override
  String secTooShort(String min, int remaining) {
    return 'कम से कम $min अक्षर उपयोग करें ($remaining और)।';
  }

  @override
  String secTooLong(String max) {
    return '$max या उससे कम अक्षर उपयोग करें।';
  }

  @override
  String get secSameAsCurrent => 'वर्तमान पासवर्ड से अलग पासवर्ड चुनें।';

  @override
  String get secConfirmRequired => 'नया पासवर्ड फिर से दर्ज करें।';

  @override
  String get secMismatch => 'पासवर्ड मेल नहीं खाते।';

  @override
  String get secPasswordUpdated =>
      'पासवर्ड अपडेट हो गया। अगली बार लॉग इन करते समय नया पासवर्ड उपयोग करें।';

  @override
  String get secPasswordUpdateFailed =>
      'आपका पासवर्ड अपडेट नहीं हो सका। कृपया फिर से कोशिश करें।';

  @override
  String get secPassword => 'पासवर्ड';

  @override
  String get secChangePassword => 'पासवर्ड बदलें';

  @override
  String get secNewPassword => 'नया पासवर्ड';

  @override
  String secReqLength(String min) {
    return 'कम से कम $min अक्षर';
  }

  @override
  String get secReqDifferent => 'वर्तमान पासवर्ड से अलग';

  @override
  String get secConfirmPassword => 'नए पासवर्ड की पुष्टि करें';

  @override
  String get secPasswordsMatch => 'पासवर्ड मेल खाते हैं';

  @override
  String get secPasswordsDontMatchYet => 'पासवर्ड अभी मेल नहीं खाते';

  @override
  String get secSavePassword => 'पासवर्ड सहेजें';

  @override
  String get commonOptional => 'वैकल्पिक';

  @override
  String get commonCopied => 'कॉपी हो गया';

  @override
  String commonAge(String age) {
    return 'आयु $age';
  }

  @override
  String get commonImageUploadFailed => 'चित्र अपलोड नहीं हो सका';

  @override
  String get commonRemoveImage => 'चित्र हटाएँ';

  @override
  String get commonAddImage => 'चित्र जोड़ें';

  @override
  String get commonUploading => 'अपलोड हो रहा है...';

  @override
  String get commonSubmit => 'जमा करें';

  @override
  String get subTitle => 'सदस्यता';

  @override
  String get subIntro =>
      'कोर्स में नामांकन के लिए हर शिक्षार्थी प्रोफ़ाइल की अपनी सदस्यता चाहिए। सदस्यता स्वीकृति से एक महीने तक चलती है।';

  @override
  String get subLoadFailed => 'आपकी सदस्यता लोड नहीं हो सकी';

  @override
  String get subHowToPay => 'भुगतान कैसे करें';

  @override
  String get subHowToPayBody =>
      'इनमें से किसी एक खाते में भुगतान भेजें, फिर लेनदेन विवरण के साथ हर प्रोफ़ाइल के लिए आवेदन करें।';

  @override
  String get subPerProfileMonth => 'प्रति प्रोफ़ाइल · एक महीना';

  @override
  String get subNoPaymentDetails =>
      'भुगतान विवरण अभी जोड़े नहीं गए हैं। कृपया सहायता से संपर्क करें।';

  @override
  String get subCopyAccountNumber => 'खाता संख्या कॉपी करें';

  @override
  String get subTypeBank => 'बैंक ट्रांसफ़र';

  @override
  String get subTypeMobile => 'मोबाइल बैंकिंग';

  @override
  String get subTypeOther => 'अन्य';

  @override
  String get subBadgeSubscribed => 'सदस्यता सक्रिय';

  @override
  String get subBadgeUnderReview => 'समीक्षाधीन';

  @override
  String get subBadgeNotSubscribed => 'सदस्यता नहीं';

  @override
  String subSubscribedUntil(String date) {
    return '$date तक सदस्यता';
  }

  @override
  String get subRenewalUnderReview => 'नवीनीकरण भुगतान की समीक्षा हो रही है';

  @override
  String get subPaymentUnderReview =>
      'भुगतान की समीक्षा हो रही है — आमतौर पर एक दिन में';

  @override
  String get subSubscribeToEnrol => 'कोर्स में नामांकन के लिए सदस्यता लें';

  @override
  String get subLastRejected => 'पिछला भुगतान स्वीकृत नहीं हुआ।';

  @override
  String subLastRejectedReason(String reason) {
    return 'पिछला भुगतान स्वीकृत नहीं हुआ: $reason';
  }

  @override
  String subWaiverReady(int percent) {
    return '$percent% शुल्क छूट तैयार';
  }

  @override
  String subWaiverReadyUseBy(int percent, String date) {
    return '$percent% शुल्क छूट तैयार — $date तक उपयोग करें';
  }

  @override
  String get subWaiverUnderReview => 'शुल्क छूट अनुरोध की समीक्षा हो रही है';

  @override
  String subWaiverRejected(String reason) {
    return 'छूट स्वीकृत नहीं हुई: $reason।';
  }

  @override
  String get subRequestWaiver => 'शुल्क में मदद चाहिए? छूट का अनुरोध करें';

  @override
  String get subWaiverLimit => 'इस वर्ष की छूट सीमा पूरी हो गई';

  @override
  String subWaiverLimitNext(String date) {
    return 'इस वर्ष की छूट सीमा पूरी (अगली $date को)';
  }

  @override
  String get subCancelRequest => 'अनुरोध रद्द करें';

  @override
  String get subRenew => 'नवीनीकरण करें';

  @override
  String get subApply => 'सदस्यता के लिए आवेदन करें';

  @override
  String get subLearnerProfiles => 'शिक्षार्थी प्रोफ़ाइल';

  @override
  String subSubscribedCount(int count, int total) {
    return '$total में से $count की सदस्यता';
  }

  @override
  String subUnderReviewCount(int count) {
    return '$count समीक्षाधीन';
  }

  @override
  String get subAddProfileToSubscribe =>
      'सदस्यता के लिए एक शिक्षार्थी प्रोफ़ाइल जोड़ें।';

  @override
  String get subCancelTitle => 'यह अनुरोध रद्द करें?';

  @override
  String subCancelBody(String name) {
    return '$name के भुगतान की समीक्षा नहीं होगी। आप बाद में फिर से जमा कर सकते हैं।';
  }

  @override
  String get subKeepIt => 'रहने दें';

  @override
  String get subCancelled => 'अनुरोध रद्द हो गया';

  @override
  String get subCancelFailed => 'अनुरोध रद्द नहीं हो सका';

  @override
  String get subPaymentHistory => 'भुगतान इतिहास';

  @override
  String get subFeeWaivers => 'शुल्क छूट';

  @override
  String subWaiverPercent(int percent) {
    return '$percent% छूट';
  }

  @override
  String subSubmittedOn(String date) {
    return 'जमा $date';
  }

  @override
  String subUntil(String date) {
    return '$date तक';
  }

  @override
  String get subReqUnderReview => 'समीक्षाधीन';

  @override
  String get subReqApproved => 'स्वीकृत';

  @override
  String get subReqRejected => 'अस्वीकृत';

  @override
  String get subReqCancelled => 'रद्द';

  @override
  String subWaiverOff(int percent) {
    return 'एक महीने पर $percent% छूट';
  }

  @override
  String subRequestedOn(String date) {
    return 'अनुरोध $date';
  }

  @override
  String subUseBy(String date) {
    return '$date तक उपयोग करें';
  }

  @override
  String subUsedOn(String date) {
    return 'उपयोग किया $date';
  }

  @override
  String get subWaiverReadyToUse => 'उपयोग के लिए तैयार';

  @override
  String get subWaiverUsed => 'उपयोग हो चुका';

  @override
  String get subWaiverNotApproved => 'स्वीकृत नहीं';

  @override
  String get subWaiverExpired => 'समाप्त';

  @override
  String get subWaiverWithdrawn => 'वापस लिया गया';

  @override
  String subSubmittedPayment(String name) {
    return 'भुगतान जमा हो गया। सत्यापन होते ही $name को सदस्यता मिल जाएगी।';
  }

  @override
  String get subWaiverSent =>
      'छूट अनुरोध भेज दिया गया। समीक्षा होते ही हम आपको ईमेल करेंगे।';

  @override
  String applyRenewTitle(String name) {
    return '$name की सदस्यता का नवीनीकरण';
  }

  @override
  String applyApplyTitle(String name) {
    return '$name की सदस्यता के लिए आवेदन';
  }

  @override
  String applyFullyWaivedBody(String name) {
    return '$name की शुल्क छूट पूरे महीने को कवर करती है, इसलिए भुगतान की ज़रूरत नहीं। एक एडमिन इसे स्वीकृत करके $name को एक महीने के लिए सदस्यता देगा।';
  }

  @override
  String applyPaymentBody(String amount, String name) {
    return 'अपने $amount भुगतान का विवरण दर्ज करें। एक एडमिन इसकी जाँच करके $name को एक महीने के लिए सदस्यता देगा।';
  }

  @override
  String applyWaiverApplied(int percent) {
    return '$percent% शुल्क छूट लागू';
  }

  @override
  String get applyNothingToPay => 'इस महीने कुछ भुगतान नहीं करना है।';

  @override
  String get applyWaiverUsedNote =>
      'यह सदस्यता स्वीकृत होने पर छूट उपयोग हो जाएगी।';

  @override
  String get applyPaidTo => 'किसे भुगतान किया';

  @override
  String applyAmount(String currency) {
    return 'राशि ($currency)';
  }

  @override
  String get applyAmountRequired => 'भुगतान की गई राशि दर्ज करें';

  @override
  String get applyPaymentDate => 'भुगतान तिथि';

  @override
  String get applyTransactionId => 'लेन-देन आईडी / संदर्भ';

  @override
  String get applyTransactionIdHint => 'जैसे: 9KD7X2LQ1P';

  @override
  String get applyTransactionIdRequired => 'लेनदेन आईडी दर्ज करें';

  @override
  String get applyPaidFrom => 'किससे भुगतान किया';

  @override
  String get applyPaidFromHint => 'आपका खाता या मोबाइल नंबर';

  @override
  String get applyNote => 'नोट';

  @override
  String get applyProof => 'भुगतान स्क्रीनशॉट / रसीद';

  @override
  String get applySubmitPayment => 'भुगतान जमा करें';

  @override
  String get applySubmitFailed => 'आपका भुगतान जमा नहीं हो सका';

  @override
  String waiverTitle(String name) {
    return '$name के लिए शुल्क छूट का अनुरोध';
  }

  @override
  String waiverBody(String name) {
    return 'यदि पूरा शुल्क देना कठिन है, तो अपनी स्थिति बताएँ। स्वीकृत होने पर $name की अगली एक महीने की सदस्यता पर 25–100% छूट मिलेगी, जिसे 30 दिनों में उपयोग करना होगा।';
  }

  @override
  String get waiverSituation => 'आपकी स्थिति';

  @override
  String get waiverSituationHint =>
      'जैसे: पारिवारिक आय, पढ़ने वाले बच्चों की संख्या, हाल के बदलाव…';

  @override
  String waiverMinChars(String min) {
    return 'कम से कम $min अक्षर लिखें';
  }

  @override
  String waiverDocuments(String max) {
    return 'सहायक दस्तावेज़ (वैकल्पिक, अधिकतम $max छवियाँ)';
  }

  @override
  String waiverRemaining(int count, String name) {
    return 'अगले 12 महीनों में $name के लिए $count बार और अनुरोध कर सकते हैं।';
  }

  @override
  String get waiverSend => 'अनुरोध भेजें';

  @override
  String get waiverFailed => 'छूट अनुरोध जमा नहीं हो सका';

  @override
  String get dashChooseProfile =>
      'यह डैशबोर्ड देखने के लिए एक शिक्षार्थी प्रोफ़ाइल चुनें।';

  @override
  String get dashChooseProfileButton => 'प्रोफ़ाइल चुनें';

  @override
  String get dashLoadFailed => 'डैशबोर्ड लोड नहीं हो सका';

  @override
  String dashGreetingMorning(String name) {
    return 'सुप्रभात, $name';
  }

  @override
  String dashGreetingAfternoon(String name) {
    return 'शुभ दोपहर, $name';
  }

  @override
  String dashGreetingEvening(String name) {
    return 'शुभ संध्या, $name';
  }

  @override
  String get dashFindFirstCourse =>
      'सीखना शुरू करने के लिए अपना पहला कोर्स खोजें।';

  @override
  String get dashNiceWork => 'आज बढ़िया काम — यही रफ़्तार बनाए रखें।';

  @override
  String get dashPickUp => 'जहाँ छोड़ा था वहीं से शुरू करें।';

  @override
  String get dashClassLiveNow => 'आपकी कक्षा अभी लाइव है';

  @override
  String dashClassStartsAt(String time) {
    return 'आपकी कक्षा $time बजे शुरू होगी';
  }

  @override
  String get dashJoin => 'शामिल हों';

  @override
  String get dashView => 'देखें';

  @override
  String get dashStatInProgress => 'जारी कोर्स';

  @override
  String dashStatCompletedCount(int count) {
    return '$count पूर्ण';
  }

  @override
  String get dashStatLessons => 'पूरे किए गए पाठ';

  @override
  String dashStatThisWeek(int count) {
    return 'इस सप्ताह $count';
  }

  @override
  String get dashStatCertificates => 'अर्जित प्रमाणपत्र';

  @override
  String get dashStatViewCertificates => 'प्रमाणपत्र देखें';

  @override
  String get dashStatStreak => 'लगातार दिन';

  @override
  String get dashStatKeepStreak => 'सिलसिला बनाए रखने के लिए आज पढ़ें';

  @override
  String dashStatBest(int count) {
    return 'सर्वश्रेष्ठ: $count दिन';
  }

  @override
  String get dashContinueTitle => 'सीखना जारी रखें';

  @override
  String get dashViewAll => 'सभी देखें';

  @override
  String get dashAllFinished => 'आपने सभी कोर्स पूरे कर लिए!';

  @override
  String get dashNotStarted => 'आपने अभी तक कोई कोर्स शुरू नहीं किया';

  @override
  String get dashBrowseCourses => 'कोर्स देखें';

  @override
  String dashNext(String title) {
    return 'अगला: $title';
  }

  @override
  String get dashLiveOnline => 'लाइव ऑनलाइन कक्षा';

  @override
  String get dashNoLessons => 'अभी कोई पाठ नहीं';

  @override
  String get dashSchedule => 'समय-सारणी';

  @override
  String get dashResume => 'जारी रखें';

  @override
  String get dashStart => 'शुरू करें';

  @override
  String get dashLiveTitle => 'आगामी लाइव कक्षाएँ';

  @override
  String get dashLiveNone => 'कोई आगामी लाइव कक्षा नहीं।';

  @override
  String get dashLiveNow => 'अभी लाइव';

  @override
  String get dashDeadlinesTitle => 'समय-सीमा';

  @override
  String get dashDeadlinesNone => 'कुछ बाकी नहीं — आप तैयार हैं।';

  @override
  String get dashDueToday => 'आज तक';

  @override
  String get dashDueTomorrow => 'कल तक';

  @override
  String dashDueIn(int count) {
    return '$count दिनों में';
  }

  @override
  String get dashExam => 'परीक्षा';

  @override
  String get dashAssignment => 'असाइनमेंट';

  @override
  String get dashActivityTitle => 'आपकी गतिविधि';

  @override
  String dashActivitySubtitle(int total, int weeks) {
    return 'प्रति सप्ताह पूरे पाठ · पिछले $weeks सप्ताह में $total';
  }

  @override
  String get dashThisWeekShort => 'इस सप्ताह';

  @override
  String get dashResultsTitle => 'हाल के परिणाम';

  @override
  String get dashResultsNone =>
      'आपके परीक्षा और असाइनमेंट परिणाम यहाँ दिखेंगे।';

  @override
  String get dashResultPassed => 'उत्तीर्ण';

  @override
  String get dashResultFailed => 'अनुत्तीर्ण';

  @override
  String get dashResultGraded => 'मूल्यांकित';

  @override
  String get dashResultAwaiting => 'मूल्यांकन की प्रतीक्षा';

  @override
  String get dashNotesTitle => 'हाल के नोट्स';

  @override
  String get dashRecommended => 'आपके लिए सुझाए गए';

  @override
  String get dashBrowseAll => 'सभी देखें';

  @override
  String get dashLiveBadge => 'लाइव';

  @override
  String get dashSwitchProfile => 'प्रोफ़ाइल बदलें';

  @override
  String get dashTimeTba => 'समय बाद में';

  @override
  String get helpTitle => 'सहायता और समर्थन';

  @override
  String get helpFaq => 'अक्सर पूछे जाने वाले प्रश्न';

  @override
  String get helpSearch => 'प्रश्न खोजें…';

  @override
  String helpNoMatch(String query) {
    return '“$query” से कोई प्रश्न मेल नहीं खाता।';
  }

  @override
  String get helpNone => 'अभी कोई प्रश्न प्रकाशित नहीं हुआ।';

  @override
  String get helpContactUs => 'संपर्क करें';

  @override
  String get helpPolicies => 'नीतियाँ';

  @override
  String get pageUnavailable => 'यह पृष्ठ अभी उपलब्ध नहीं है।';

  @override
  String pageUpdated(String date) {
    return 'अंतिम अपडेट $date';
  }

  @override
  String get languageChangeTo => 'भाषा बदलें';
}
