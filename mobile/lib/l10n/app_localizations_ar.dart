// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get commonCancel => '⁧إلغاء⁩';

  @override
  String get commonContinue => '⁧متابعة⁩';

  @override
  String get commonTryAgain => '⁧حاول مرة أخرى⁩';

  @override
  String get commonSending => '⁧جارٍ الإرسال...⁩';

  @override
  String get commonClose => '⁧إغلاق⁩';

  @override
  String get commonSave => '⁧حفظ⁩';

  @override
  String get commonDelete => '⁧حذف⁩';

  @override
  String get commonOr => '⁧أو⁩';

  @override
  String get commonLearner => '⁧المتعلم⁩';

  @override
  String get commonAdult => '⁧بالغ⁩';

  @override
  String commonAgeRange(String min, String max) {
    return '⁧الأعمار $min–$max⁩';
  }

  @override
  String commonAgeUnder(String max) {
    return '⁧$max سنوات فأقل⁩';
  }

  @override
  String get commonNotSubscribed => '⁧غير مشترك⁩';

  @override
  String get commonConnectionError =>
      '⁧تعذّر الاتصال. تحقّق من اتصالك بالإنترنت.⁩';

  @override
  String get commonLogoLabel => '⁧شعار معهد 3i الإسلامي الدولي⁩';

  @override
  String get commonInstituteName => '⁧المعهد الإسلامي الدولي⁩';

  @override
  String get languageLabel => '⁧اللغة⁩';

  @override
  String get languageSettingBody =>
      '⁧اللغة المستخدمة في الموقع والتطبيق والبريد⁩';

  @override
  String get languageSaveFailed =>
      '⁧تعذّر حفظ اللغة في حسابك. ستعود إلى الإعداد السابق عند تسجيل الدخول في المرة القادمة.⁩';

  @override
  String get authEmailLabel => '⁧البريد الإلكتروني⁩';

  @override
  String get authPasswordLabel => '⁧كلمة المرور⁩';

  @override
  String get authShowPassword => '⁧إظهار كلمة المرور⁩';

  @override
  String get authHidePassword => '⁧إخفاء كلمة المرور⁩';

  @override
  String get authEmailInvalid => '⁧أدخل بريدًا إلكترونيًا صالحًا⁩';

  @override
  String get authPasswordRequired => '⁧كلمة المرور مطلوبة⁩';

  @override
  String get authPasswordMin =>
      '⁧يجب أن تتكون كلمة المرور من 10 أحرف على الأقل⁩';

  @override
  String get authPasswordMax => '⁧يجب ألا تتجاوز كلمة المرور 128 حرفًا⁩';

  @override
  String get authBackToLogin => '⁧العودة لتسجيل الدخول⁩';

  @override
  String get authGoToLogin => '⁧الذهاب إلى تسجيل الدخول⁩';

  @override
  String get authSelectDate => '⁧اختر التاريخ⁩';

  @override
  String get authSelectDob => '⁧اختر تاريخ ميلادك⁩';

  @override
  String get loginTitle => '⁧مرحبًا بعودتك⁩';

  @override
  String get loginSubtitle => '⁧يرجى إدخال بياناتك لتسجيل الدخول.⁩';

  @override
  String get loginForgotPassword => '⁧نسيت كلمة المرور؟⁩';

  @override
  String get loginSubmit => '⁧تسجيل الدخول⁩';

  @override
  String get loginFailed => '⁧فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get loginNewHere => '⁧جديد في 3i؟⁩';

  @override
  String get loginCreateAccount => '⁧أنشئ حسابًا⁩';

  @override
  String get loginInstructorPortal => '⁧بوابة المعلمين⁩';

  @override
  String get registerTitle => '⁧ابدأ رحلتك⁩';

  @override
  String get registerSubtitle => '⁧حساب واحد. أضف أطفالك متى شئت.⁩';

  @override
  String get registerFirstName => '⁧الاسم الأول⁩';

  @override
  String get registerFirstNameHint => '⁧مثال: سارة⁩';

  @override
  String get registerLastName => '⁧اسم العائلة⁩';

  @override
  String get registerLastNameHint => '⁧مثال: أحمد⁩';

  @override
  String get registerFirstNameRequired => '⁧الاسم الأول مطلوب⁩';

  @override
  String get registerLastNameRequired => '⁧اسم العائلة مطلوب⁩';

  @override
  String get registerNameTooLong => '⁧يجب ألا يتجاوز 100 حرف⁩';

  @override
  String get registerPasswordHint => '⁧10 أحرف على الأقل⁩';

  @override
  String get registerDateOfBirth => '⁧تاريخ الميلاد⁩';

  @override
  String get registerDateOfBirthHint => '⁧يجب أن يكون عمرك 18 عامًا أو أكثر⁩';

  @override
  String get registerDobRequired =>
      '⁧اختر تاريخ ميلادك. يجب ألا يقل عمرك عن 18 عامًا.⁩';

  @override
  String get registerLanguage => '⁧اللغة المفضلة⁩';

  @override
  String get registerLanguageHint =>
      '⁧اللغة التي يستخدمها التطبيق. يمكنك تغييرها في أي وقت.⁩';

  @override
  String get registerSubmit => '⁧إنشاء حساب⁩';

  @override
  String get registerFailed => '⁧فشل التسجيل. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get registerHaveAccount => '⁧لديك حساب بالفعل؟⁩';

  @override
  String get registerLogIn => '⁧تسجيل الدخول⁩';

  @override
  String get forgotTitle => '⁧إعادة تعيين كلمة المرور⁩';

  @override
  String get forgotSubtitle => '⁧أدخل بريد حسابك وسنرسل إليك رابطًا.⁩';

  @override
  String get forgotSubmit => '⁧إرسال رابط إعادة التعيين⁩';

  @override
  String get forgotSentTitle => '⁧تحقق من بريدك الإلكتروني⁩';

  @override
  String get forgotSentBody =>
      '⁧إذا كان هناك حساب بهذا البريد، فقد أرسلنا رابط إعادة تعيين كلمة المرور.⁩';

  @override
  String get forgotFailed => '⁧تعذّر إرسال رابط إعادة التعيين⁩';

  @override
  String get resetTitle => '⁧اختر كلمة مرور جديدة⁩';

  @override
  String get resetSubtitle => '⁧اختر كلمة مرور آمنة لا تقل عن 10 أحرف.⁩';

  @override
  String get resetNewPassword => '⁧كلمة المرور الجديدة⁩';

  @override
  String get resetConfirm => '⁧تأكيد كلمة المرور الجديدة⁩';

  @override
  String get resetSubmit => '⁧تحديث كلمة المرور⁩';

  @override
  String get resetMismatch => '⁧كلمتا المرور غير متطابقتين⁩';

  @override
  String get resetInvalidLink =>
      '⁧رابط إعادة تعيين كلمة المرور غير صالح أو غير مكتمل. اطلب رابطًا جديدًا.⁩';

  @override
  String get resetFailed => '⁧تعذّرت إعادة تعيين كلمة المرور⁩';

  @override
  String get resetDoneTitle => '⁧تم تحديث كلمة المرور⁩';

  @override
  String get resetDoneBody =>
      '⁧تم تحديث كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.⁩';

  @override
  String get checkEmailTitle => '⁧تحقق من بريدك الإلكتروني⁩';

  @override
  String checkEmailSentTo(String email) {
    return '⁧أرسلنا رابط التحقق إلى $email⁩';
  }

  @override
  String get checkEmailResend => '⁧إعادة إرسال البريد⁩';

  @override
  String get checkEmailCanResendNow => '⁧يمكنك إعادة الإرسال الآن⁩';

  @override
  String checkEmailResendIn(int seconds) {
    return '⁧يمكنك إعادة الإرسال بعد $seconds ثانية⁩';
  }

  @override
  String get checkEmailResendFailed => '⁧تعذّرت إعادة إرسال البريد⁩';

  @override
  String get checkEmailWrongEmail => '⁧بريد خاطئ؟ عُد للخلف⁩';

  @override
  String get checkEmailBackInstructor => '⁧العودة إلى دخول المعلمين⁩';

  @override
  String get verifyVerifying => '⁧جارٍ التحقق من بريدك الإلكتروني...⁩';

  @override
  String get verifyPleaseWait =>
      '⁧يرجى الانتظار ريثما نتحقق من بريدك الإلكتروني.⁩';

  @override
  String get verifyVerifiedTitle => '⁧تم التحقق من البريد!⁩';

  @override
  String get verifyVerifiedBody =>
      '⁧تم التحقق من بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.⁩';

  @override
  String get verifyExpiredTitle => '⁧انتهت صلاحية هذا الرابط⁩';

  @override
  String get verifyExpiredBody =>
      '⁧روابط التحقق صالحة لمدة 24 ساعة. يمكننا إرسال رابط جديد إلى البريد نفسه.⁩';

  @override
  String get verifyFailedTitle => '⁧فشل التحقق⁩';

  @override
  String get verifyFailed => '⁧فشل التحقق⁩';

  @override
  String get verifyInvalidLink => '⁧رابط تحقق غير صالح⁩';

  @override
  String get verifyNewLinkTitle => '⁧تم إرسال رابط جديد⁩';

  @override
  String get verifyNewLinkBody =>
      '⁧أرسلنا رابط تحقق جديدًا إلى بريدك. افتحه خلال 24 ساعة لإكمال إعداد حسابك.⁩';

  @override
  String get verifySendNewLink => '⁧أرسل لي رابطًا جديدًا⁩';

  @override
  String get verifyNewLinkFailed => '⁧تعذّر إرسال رابط جديد⁩';

  @override
  String get unverifiedTitle => '⁧يرجى التحقق من بريدك أولًا⁩';

  @override
  String unverifiedBody(String email) {
    return '⁧أرسلنا رابط تحقق إلى $email. إذا انتهت صلاحيته أو لم تجده، يمكننا إرسال رابط جديد.⁩';
  }

  @override
  String get unverifiedResend => '⁧إعادة إرسال بريد التحقق⁩';

  @override
  String get socialContinueGoogle => '⁧المتابعة باستخدام Google⁩';

  @override
  String get socialContinueApple => '⁧المتابعة باستخدام Apple⁩';

  @override
  String get socialSignUpGoogle => '⁧التسجيل عبر Google⁩';

  @override
  String get socialSignUpApple => '⁧التسجيل عبر Apple⁩';

  @override
  String get socialGoogleFailed => '⁧فشل تسجيل الدخول عبر Google⁩';

  @override
  String get socialAppleFailed => '⁧فشل تسجيل الدخول عبر Apple⁩';

  @override
  String get socialAppleNoToken => '⁧لم يتم استلام رمز الهوية من Apple⁩';

  @override
  String socialDobRequired(String provider) {
    return '⁧تاريخ ميلادك مطلوب لإنشاء حساب عبر $provider.⁩';
  }

  @override
  String get socialCreateTitle => '⁧أنشئ حسابك⁩';

  @override
  String socialCreateBody(String provider) {
    return '⁧لا يوجد حساب 3i لبريد $provider هذا بعد. لإنشاء حساب أدخل تاريخ ميلادك. يجب ألا يقل عمرك عن 13 عامًا.⁩';
  }

  @override
  String get profilesWhoIsLearning => '⁧من يتعلم اليوم؟⁩';

  @override
  String get profilesEmpty => '⁧أضف ملف متعلم للبدء.⁩';

  @override
  String get profilesLoadFailed => '⁧تعذّر تحميل الملفات الشخصية⁩';

  @override
  String get profilesAddLearner => '⁧إضافة متعلم⁩';

  @override
  String get profilesLogOut => '⁧تسجيل الخروج⁩';

  @override
  String get pinEnter => '⁧أدخل رمز PIN المكوّن من 4 أرقام⁩';

  @override
  String get pinIncorrect => '⁧رمز PIN غير صحيح. حاول مرة أخرى.⁩';

  @override
  String pinTriesLeft(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'تبقّت $count محاولة',
      many: 'تبقّت $count محاولة',
      few: 'تبقّت $count محاولات',
      two: 'تبقّت محاولتان',
      one: 'تبقّت محاولة واحدة',
    );
    return '⁧رمز PIN غير صحيح. $_temp0.⁩';
  }

  @override
  String get pinCheckFailed => '⁧تعذّر التحقق من رمز PIN. تحقّق من اتصالك.⁩';

  @override
  String pinTooMany(int seconds) {
    return '⁧محاولات كثيرة. حاول مجددًا بعد $seconds ث.⁩';
  }

  @override
  String get pinForgot =>
      '⁧نسيت رمز PIN؟ اطلب من صاحب الحساب إعادة تعيينه من «إدارة الملفات».⁩';

  @override
  String pinProgress(int filled, int length) {
    return '⁧رمز PIN، أُدخل $filled من $length أرقام⁩';
  }

  @override
  String get settingsTitle => '⁧إعدادات الحساب⁩';

  @override
  String get settingsFamilyTitle => '⁧العائلة والملفات الشخصية⁩';

  @override
  String get settingsFamilyBody => '⁧إدارة ملفات المتعلمين ورموز PIN⁩';

  @override
  String get settingsDevicesTitle => '⁧الأجهزة⁩';

  @override
  String get settingsDevicesBody => '⁧إدارة الأجهزة متاحة على الموقع⁩';

  @override
  String get settingsSubscriptionTitle => '⁧الاشتراك والفوترة⁩';

  @override
  String get settingsSubscriptionBody => '⁧ادفع اشتراك كل متعلم وجدّده⁩';

  @override
  String get settingsSecurityTitle => '⁧تسجيل الدخول والأمان⁩';

  @override
  String get settingsSecurityBody => '⁧حدّث بريدك وكلمة المرور⁩';

  @override
  String get menuAccount => '⁧قائمة المستخدم⁩';

  @override
  String get menuSwitchLearner => '⁧تبديل ملف المتعلم⁩';

  @override
  String get menuFamily => '⁧العائلة والملفات الشخصية⁩';

  @override
  String get menuSubscription => '⁧الاشتراك⁩';

  @override
  String get menuManageAccount => '⁧إدارة الحساب⁩';

  @override
  String get menuLogOut => '⁧تسجيل الخروج⁩';

  @override
  String get menuCourses => '⁧الدورات⁩';

  @override
  String get menuHelp => '⁧المساعدة والدعم⁩';

  @override
  String get menuLearnerProfile => '⁧ملف المتعلم⁩';

  @override
  String dashboardGreeting(String name) {
    return '⁧السلام عليكم، $name⁩';
  }

  @override
  String get dashboardWelcomeBack => '⁧مرحبًا بعودتك إلى لوحة التحكم⁩';

  @override
  String get dashboardSearchCourses => '⁧ابحث عن دورات⁩';

  @override
  String get dashboardExploreCourses => '⁧استكشف الدورات⁩';

  @override
  String get navDashboard => '⁧لوحة التحكم⁩';

  @override
  String get navRegularCourses => '⁧الدورات المنتظمة⁩';

  @override
  String get navOnlineClasses => '⁧الحصص المباشرة⁩';

  @override
  String get navAssignments => '⁧الواجبات⁩';

  @override
  String get navExams => '⁧الاختبارات⁩';

  @override
  String get navCertificates => '⁧الشهادات⁩';

  @override
  String get navWishlist => '⁧قائمة الرغبات⁩';

  @override
  String get coursesTitle => '⁧الدورات⁩';

  @override
  String coursesForLearner(String name, int age) {
    return '⁧يتم عرض الدورات المناسبة لـ $name (العمر $age).⁩';
  }

  @override
  String detailAgeNoticeTitle(String name) {
    return '⁧هذه الدورة ليست مناسبة لعمر $name⁩';
  }

  @override
  String detailAgeNoticeBody(String range, String name, int age) {
    return '⁧إنها للمتعلمين بعمر $range. عمر $name هو $age.⁩';
  }

  @override
  String detailAgeNoticeBrowse(String name) {
    return '⁧عرض الدورات المناسبة لـ $name⁩';
  }

  @override
  String coursesBandNotForAge(String name) {
    return '⁧غير مناسب لعمر $name⁩';
  }

  @override
  String get coursesSearch => '⁧ابحث عن دورات أو معلمين أو مواضيع...⁩';

  @override
  String get coursesClearSearch => '⁧مسح البحث⁩';

  @override
  String get coursesLoading => '⁧جارٍ تحميل الدورات...⁩';

  @override
  String get coursesLoadFailed => '⁧تعذّر تحميل الدورات.⁩';

  @override
  String coursesCount(int count) {
    return '⁧$count دورة⁩';
  }

  @override
  String get coursesCategory => '⁧الفئة⁩';

  @override
  String get coursesAllCategories => '⁧جميع الفئات⁩';

  @override
  String get coursesType => '⁧النوع⁩';

  @override
  String get coursesAllTypes => '⁧جميع الأنواع⁩';

  @override
  String get coursesTypeRegular => '⁧عادية⁩';

  @override
  String get coursesTypeLive => '⁧حصة عبر الإنترنت⁩';

  @override
  String get coursesTypeHybrid => '⁧مدمج⁩';

  @override
  String get coursesLanguage => '⁧اللغة⁩';

  @override
  String get coursesAllLanguages => '⁧جميع اللغات⁩';

  @override
  String get coursesAge => '⁧العمر⁩';

  @override
  String get coursesSort => '⁧الترتيب⁩';

  @override
  String get coursesSortPopularity => '⁧الأكثر صلة⁩';

  @override
  String get coursesSortNewest => '⁧الأحدث⁩';

  @override
  String get coursesSortRating => '⁧الأعلى تقييمًا⁩';

  @override
  String get coursesSortTitle => '⁧العنوان (أ-ي)⁩';

  @override
  String get coursesClearFilters => '⁧مسح عوامل التصفية⁩';

  @override
  String get coursesClearAllFilters => '⁧مسح كل عوامل التصفية⁩';

  @override
  String get coursesNoResults => '⁧لا توجد دورات مطابقة لعوامل التصفية.⁩';

  @override
  String coursesPageOf(int page, int total) {
    return '⁧الصفحة $page من $total⁩';
  }

  @override
  String get commonAllAges => '⁧جميع الأعمار⁩';

  @override
  String commonAgesFrom(String min) {
    return '⁧من $min سنة فأكثر⁩';
  }

  @override
  String get commonNewRating => '⁧جديد⁩';

  @override
  String get commonRecommendedAge => '⁧الفئة العمرية الموصى بها⁩';

  @override
  String get commonPrevious => '⁧السابق⁩';

  @override
  String get commonNext => '⁧التالي⁩';

  @override
  String get courseCardPreview => '⁧معاينة الدورة⁩';

  @override
  String get wishlistAdd => '⁧أضف إلى قائمة الأمنيات⁩';

  @override
  String get wishlistRemove => '⁧إزالة من قائمة الأمنيات⁩';

  @override
  String get wishlistUpdateFailed => '⁧تعذّر تحديث قائمة الأمنيات.⁩';

  @override
  String get landingHomeLabel => '⁧الصفحة الرئيسية لمعهد 3i الإسلامي الدولي⁩';

  @override
  String get landingAccountMenu => '⁧قائمة الحساب والمتعلم⁩';

  @override
  String get landingAccount => '⁧الحساب⁩';

  @override
  String get menuDashboard => '⁧لوحة التحكم⁩';

  @override
  String get menuMyCourses => '⁧دوراتي⁩';

  @override
  String get footerTagline => '⁧تعليم متقن. فصول عالمية. معهد واحد.⁩';

  @override
  String get footerAbout =>
      '⁧برامج منظّمة ومعتمدة في العلوم والإنسانيات والمجالات المهنية لطلاب في 40 دولة.⁩';

  @override
  String footerRights(String year) {
    return '⁧© $year معهد 3i الإسلامي الدولي. جميع الحقوق محفوظة.⁩';
  }

  @override
  String get homeWelcome => '⁧مرحبًا⁩';

  @override
  String homeWelcomeName(String name) {
    return '⁧مرحبًا، $name⁩';
  }

  @override
  String get homeSignedIn => '⁧لقد سجّلت الدخول.⁩';

  @override
  String shareText(String title) {
    return '⁧اطّلع على \"$title\" في معهد 3i الإسلامي الدولي⁩';
  }

  @override
  String get shareDetailsCopied => '⁧تم نسخ تفاصيل الدورة⁩';

  @override
  String get shareLinkCopied => '⁧تم نسخ الرابط⁩';

  @override
  String get levelBeginner => '⁧مبتدئ⁩';

  @override
  String get levelIntermediate => '⁧متوسط⁩';

  @override
  String get levelAdvanced => '⁧متقدم⁩';

  @override
  String get levelAll => '⁧كل المستويات⁩';

  @override
  String commonMinutes(int count) {
    return '⁧$count دقيقة⁩';
  }

  @override
  String get commonBackToCourses => '⁧العودة إلى الدورات⁩';

  @override
  String get detailLearn => '⁧ما ستتعلمه⁩';

  @override
  String get detailRequirements => '⁧المتطلبات⁩';

  @override
  String get detailAbout => '⁧عن هذه الدورة⁩';

  @override
  String get detailStudentsAlsoTook => '⁧التحق الطلاب أيضًا بـ⁩';

  @override
  String detailBreadcrumb(String category) {
    return '⁧الدورات  ›  $category⁩';
  }

  @override
  String detailRatingMeta(String rating, int count) {
    return '⁧$rating · $count مراجعة⁩';
  }

  @override
  String get detailInstructedBy => '⁧يقدّمها ⁩';

  @override
  String get detailLoadFailed => '⁧تعذّر تحميل الدورة⁩';

  @override
  String get enrolWaitlisted =>
      '⁧أُضفت إلى قائمة الانتظار. سنُعلمك عند توفر مقعد.⁩';

  @override
  String get enrolSuccess => '⁧تم التسجيل بنجاح⁩';

  @override
  String get enrolFailed => '⁧فشل التسجيل⁩';

  @override
  String get enrolSubscribe => '⁧اشترك⁩';

  @override
  String get enrolNoBatches => '⁧لا توجد دفعات متاحة حاليًا.⁩';

  @override
  String get cardIncluded => '⁧مشمولة في العضوية⁩';

  @override
  String get cardEnrolledTitle => '⁧أنت مسجّل⁩';

  @override
  String get cardStartToday => '⁧ابدأ التعلم اليوم⁩';

  @override
  String cardNotAvailable(String name, String message, String age) {
    return '⁧غير متاحة لـ$name. $message (عمر $name هو $age).⁩';
  }

  @override
  String get cardEnrolNow => '⁧سجّل الآن⁩';

  @override
  String cardNeedsSubscription(String name) {
    return '⁧يحتاج $name إلى اشتراك للتسجيل في الدورات.⁩';
  }

  @override
  String get cardSubscribeToEnrol => '⁧اشترك للتسجيل⁩';

  @override
  String get cardChooseBatch => '⁧اختر دفعة الحصص⁩';

  @override
  String get cardManageSubscription => '⁧إدارة الاشتراك⁩';

  @override
  String get cardWhatsIncluded => '⁧ما يتضمنه⁩';

  @override
  String get batchChoose => '⁧اختر دفعتك⁩';

  @override
  String get batchChooseBody => '⁧اختر مجموعة صفية لمتابعة التسجيل.⁩';

  @override
  String get batchSubtitleBody => '⁧اعرض الجدول والحصص لكل دفعة متاحة.⁩';

  @override
  String batchSessions(int count) {
    return '⁧$count حصة⁩';
  }

  @override
  String batchSeats(int count) {
    return '⁧$count مقعد⁩';
  }

  @override
  String get batchActive => '⁧نشطة⁩';

  @override
  String get batchUpcoming => '⁧قادمة⁩';

  @override
  String get batchSessionNotes => '⁧ملاحظات الحصة⁩';

  @override
  String get detailSyllabus => '⁧المنهج التفصيلي⁩';

  @override
  String get detailCurriculum => '⁧المنهج⁩';

  @override
  String detailLessons(int count) {
    return '⁧$count درس⁩';
  }

  @override
  String get detailYourInstructor => '⁧معلمك⁩';

  @override
  String detailInstructorStats(int courses, int learners) {
    return '⁧$courses دورة · $learners متعلم⁩';
  }

  @override
  String get detailReviews => '⁧مراجعات المتعلمين⁩';

  @override
  String detailReviewCount(int count) {
    return '⁧$count مراجعة⁩';
  }

  @override
  String get detailEnrolledShare =>
      '⁧أنت مسجّل في هذه الدورة. شاركنا كيف تسير.⁩';

  @override
  String get detailRateReview => '⁧قيّم وراجع⁩';

  @override
  String get detailNoReviews => '⁧لا توجد مراجعات بعد.⁩';

  @override
  String get reviewParent => '⁧وليّ الأمر⁩';

  @override
  String get reviewThanks => '⁧شكرًا! تم إرسال مراجعتك.⁩';

  @override
  String get reviewSelectRating => '⁧يرجى اختيار تقييم.⁩';

  @override
  String get reviewSubmitFailed => '⁧تعذّر إرسال مراجعتك.⁩';

  @override
  String get reviewTitle => '⁧قيّم هذه الدورة⁩';

  @override
  String reviewSubmittingAs(String name) {
    return '⁧الإرسال باسم $name⁩';
  }

  @override
  String get reviewYourRating => '⁧تقييمك⁩';

  @override
  String reviewStars(int count) {
    return '⁧$count نجوم⁩';
  }

  @override
  String get reviewWrite => '⁧اكتب مراجعة (اختياري)⁩';

  @override
  String get reviewHint => '⁧شارك تجربتك مع هذه الدورة...⁩';

  @override
  String get reviewSubmit => '⁧إرسال المراجعة⁩';

  @override
  String get cardReviewCourse => '⁧مراجعة الدورة⁩';

  @override
  String get cardContinue => '⁧متابعة التعلم⁩';

  @override
  String get cardStart => '⁧ابدأ التعلم⁩';

  @override
  String get cardComingSoon => '⁧الدروس قريبًا⁩';

  @override
  String get cardClassSchedule => '⁧جدول الحصص⁩';

  @override
  String get cardChatRoom => '⁧غرفة الدردشة⁩';

  @override
  String get cardYourBatch => '⁧دفعتك⁩';

  @override
  String get cardDashboard => '⁧الذهاب إلى لوحة التحكم⁩';

  @override
  String get cardEnrolled => '⁧مسجّل⁩';

  @override
  String get detailFaq => '⁧أسئلة شائعة⁩';

  @override
  String get membershipTitle => '⁧عضوية واحدة. كل الدورات.⁩';

  @override
  String get membershipAllCourses => '⁧جميع الدورات⁩';

  @override
  String get membershipAllCoursesBody =>
      '⁧تعلّم الدراسات الإسلامية واللغات والعلوم وغيرها.⁩';

  @override
  String get membershipLive => '⁧الحصص المباشرة مشمولة⁩';

  @override
  String get membershipLiveBody =>
      '⁧انضم إلى ندوات تفاعلية وجلسات أسئلة وأجوبة مباشرة.⁩';

  @override
  String get membershipCertificates => '⁧الشهادات مشمولة⁩';

  @override
  String get membershipCertificatesBody =>
      '⁧احصل على الشهادات عند إتمام تعلّمك.⁩';

  @override
  String get detailShare => '⁧شارك هذه الدورة⁩';

  @override
  String get learnSelectProfileCourses => '⁧اختر ملف متعلم لعرض الدورات.⁩';

  @override
  String get learnCoursesLoadFailed => '⁧تعذّر تحميل دوراتك⁩';

  @override
  String get learnRegularTitle => '⁧الدورات المنتظمة⁩';

  @override
  String learnRegularCount(int count) {
    return '⁧$count من الدورات الذاتية⁩';
  }

  @override
  String get learnSearch => '⁧ابحث باسم الدورة أو المعلم...⁩';

  @override
  String get learnNoRegular => '⁧لا توجد دورات عادية بعد⁩';

  @override
  String get learnNoRegularBody => '⁧تصفّح دليل الدورات لتجد درسك التالي.⁩';

  @override
  String get learnBrowse => '⁧تصفّح الدورات⁩';

  @override
  String get learnNoMatch => '⁧لا توجد دورات مطابقة⁩';

  @override
  String get learnNoMatchBody => '⁧جرّب اسم دورة أو معلم آخر.⁩';

  @override
  String learnLessonsProgress(int done, int total) {
    return '⁧$done/$total دروس⁩';
  }

  @override
  String get learnNoLessons => '⁧لا دروس⁩';

  @override
  String get learnResume => '⁧استئناف⁩';

  @override
  String get learnStart => '⁧ابدأ التعلم⁩';

  @override
  String get learnExams => '⁧الاختبارات⁩';

  @override
  String get levelAllCaps => '⁧جميع المستويات⁩';

  @override
  String get levelBeginnerCaps => '⁧مبتدئ⁩';

  @override
  String get levelIntermediateCaps => '⁧متوسط⁩';

  @override
  String get levelAdvancedCaps => '⁧متقدم⁩';

  @override
  String get classesSelectProfile => '⁧اختر ملف متعلم لعرض حصصك المباشرة.⁩';

  @override
  String get classesLoadFailed => '⁧تعذّر تحميل الحصص⁩';

  @override
  String get classesTitle => '⁧الحصص عبر الإنترنت⁩';

  @override
  String classesCount(int count) {
    return '⁧$count من الدورات المباشرة⁩';
  }

  @override
  String get classesNone => '⁧لا توجد حصص مباشرة بعد⁩';

  @override
  String get classesNoneBody => '⁧تصفّح دليل الدورات لتجد حصة.⁩';

  @override
  String get classesNoMatch => '⁧لا توجد حصص مطابقة⁩';

  @override
  String get classesNoMatchBody => '⁧جرّب اسم دورة أو معلم آخر.⁩';

  @override
  String get classesNoUpcoming => '⁧لا توجد حصة قادمة⁩';

  @override
  String get classesBatch => '⁧الدفعة⁩';

  @override
  String get classesChat => '⁧الدردشة⁩';

  @override
  String get classesMoreActions => '⁧إجراءات أخرى⁩';

  @override
  String get classesDetails => '⁧التفاصيل⁩';

  @override
  String get classesSessions => '⁧الحصص⁩';

  @override
  String get classesExams => '⁧الاختبارات⁩';

  @override
  String get classesCertificate => '⁧الشهادة⁩';

  @override
  String get classesDateTba => '⁧سيُعلن الموعد لاحقًا⁩';

  @override
  String get scheduleStatusLive => '⁧مباشر الآن⁩';

  @override
  String get scheduleStatusSoon => '⁧يبدأ قريبًا⁩';

  @override
  String get scheduleStatusUpcoming => '⁧قادم⁩';

  @override
  String get scheduleStatusCompleted => '⁧مكتملة⁩';

  @override
  String get scheduleSectionUpcoming => '⁧الحصص القادمة⁩';

  @override
  String get scheduleSectionCompleted => '⁧الحصص السابقة⁩';

  @override
  String get scheduleSelectProfile => '⁧اختر ملف متعلم لعرض جدول هذه الحصص.⁩';

  @override
  String get scheduleTitle => '⁧جدول الحصص⁩';

  @override
  String get scheduleUnavailable => '⁧جدول الحصص غير متاح⁩';

  @override
  String get scheduleUnavailableBody =>
      '⁧تعذّر تحميل هذه الدفعة. ربما لم تعد مسجّلًا فيها أو لم تعد متاحة.⁩';

  @override
  String scheduleScheduled(int count) {
    return '⁧$count من الحصص المجدولة⁩';
  }

  @override
  String get scheduleNone => '⁧لم تُجدول أي حصص بعد.⁩';

  @override
  String get scheduleNoneHint => '⁧لم يضف معلمك أي حصص إلى هذه الدفعة بعد.⁩';

  @override
  String get scheduleBack => '⁧العودة إلى الحصص⁩';

  @override
  String scheduleEnrolledOn(String date) {
    return '⁧سُجّل في $date⁩';
  }

  @override
  String scheduleSessionNumber(int number) {
    return '⁧الحصة $number⁩';
  }

  @override
  String get scheduleJoin => '⁧انضم للحصة⁩';

  @override
  String get scheduleJoinSoon => '⁧انضم قريبًا⁩';

  @override
  String get scheduleNoLink => '⁧لا يوجد رابط بعد⁩';

  @override
  String get scheduleCompleted => '⁧مكتملة⁩';

  @override
  String get scheduleNotStarted => '⁧لم تبدأ⁩';

  @override
  String get scheduleLinkFailed => '⁧تعذّر فتح رابط الاجتماع.⁩';

  @override
  String get lessonReloadFailed => '⁧تعذّرت إعادة التحميل. تحقّق من اتصالك.⁩';

  @override
  String get lessonProgressSaveFailed =>
      '⁧تعذّر حفظ التقدم. ستتم إعادة المحاولة لاحقًا.⁩';

  @override
  String get lessonNoteEmpty => '⁧لا يمكن أن تكون الملاحظة فارغة⁩';

  @override
  String get lessonNoteSaveFailed =>
      '⁧تعذّر حفظ الملاحظة. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get lessonSelectProfile => '⁧اختر ملف متعلم للمتابعة.⁩';

  @override
  String get lessonTitle => '⁧درس⁩';

  @override
  String get lessonLoadFailed => '⁧تعذّر تحميل دروس الدورة.⁩';

  @override
  String get lessonNotInCourse => '⁧هذا الدرس ليس جزءًا من الدورة.⁩';

  @override
  String get lessonReload => '⁧إعادة التحميل⁩';

  @override
  String get lessonCourseContent => '⁧محتوى الدورة⁩';

  @override
  String get lessonPrevious => '⁧السابق⁩';

  @override
  String get lessonNext => '⁧التالي⁩';

  @override
  String lessonCourseName(String title) {
    return '⁧الدورة: $title⁩';
  }

  @override
  String get lessonOverview => '⁧نظرة عامة⁩';

  @override
  String get lessonNotes => '⁧الملاحظات⁩';

  @override
  String get lessonDefaultOverview =>
      '⁧تابع هذا الدرس، ثم استخدم زر محتوى الدورة للتنقل بين المواضيع.⁩';

  @override
  String get lessonNotesHint => '⁧اكتب ملاحظاتك لهذا الدرس...⁩';

  @override
  String get lessonSaved => '⁧تم الحفظ⁩';

  @override
  String get lessonSaveNote => '⁧حفظ الملاحظة⁩';

  @override
  String get lessonDocUnavailable => '⁧المستند غير متاح⁩';

  @override
  String get lessonMarkedComplete => '⁧تم تعليم الدرس كمكتمل⁩';

  @override
  String get lessonReadOnlyKeepReading =>
      '⁧معاينة للقراءة فقط • تابع القراءة لإكمال الدرس⁩';

  @override
  String get lessonReadOnlyPdf => '⁧معاينة PDF للقراءة فقط⁩';

  @override
  String get lessonMediaUnavailable => '⁧وسائط الدرس غير متاحة⁩';

  @override
  String get lessonOpenLinkTitle => '⁧افتح رابط الدرس⁩';

  @override
  String get lessonOpenLink => '⁧فتح الرابط⁩';

  @override
  String get lessonPdfFailed =>
      '⁧تعذّر تحميل المستند. تحقق من اتصالك وحاول مجددًا.⁩';

  @override
  String get lessonReloadPdf => '⁧إعادة تحميل PDF⁩';

  @override
  String get videoCheckConnection => '⁧تحقّق من اتصالك ثم حاول مجددًا.⁩';

  @override
  String videoCouldNotPlay(String reason) {
    return '⁧تعذّر تشغيل الفيديو. $reason⁩';
  }

  @override
  String get videoInterrupted => '⁧توقف التشغيل. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get videoBack10 => '⁧رجوع 10 ثوانٍ⁩';

  @override
  String get videoForward10 => '⁧تقديم 10 ثوانٍ⁩';

  @override
  String get videoSpeed => '⁧سرعة التشغيل⁩';

  @override
  String get videoNormal => '⁧عادي⁩';

  @override
  String get videoFullScreen => '⁧ملء الشاشة⁩';

  @override
  String get videoExitFullScreen => '⁧الخروج من ملء الشاشة⁩';

  @override
  String get videoPause => '⁧إيقاف مؤقت⁩';

  @override
  String get videoPlay => '⁧تشغيل⁩';

  @override
  String get lessonCourseExam => '⁧اختبار الدورة⁩';

  @override
  String get lessonExamUnlocked =>
      '⁧أكملت 90% من الدورة — يمكنك الآن أداء الاختبار.⁩';

  @override
  String lessonExamLocked(int progress) {
    return '⁧أكمل 90% من الدورة لفتح الاختبار. أنت عند $progress%.⁩';
  }

  @override
  String get lessonCourseProgress => '⁧تقدم الدورة⁩';

  @override
  String get lessonExamUnlockedShort => '⁧تم فتح الاختبار — بالتوفيق!⁩';

  @override
  String get lessonExamUnlockHint =>
      '⁧يُفتح الاختبار تلقائيًا عند إكمال 90% من الدورة.⁩';

  @override
  String get lessonTakeExam => '⁧أدِّ الاختبار⁩';

  @override
  String get lessonLocked => '⁧مقفل⁩';

  @override
  String get lessonCertificateFailed =>
      '⁧تعذّر إنشاء شهادتك. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get lessonCourseCertificate => '⁧شهادة الدورة⁩';

  @override
  String get lessonCertificateHint =>
      '⁧أنشئ شهادة تُظهر تقدمك ودرجة آخر اختبار. يمكن ذلك مرة واحدة فقط.⁩';

  @override
  String get lessonCertificateLocked =>
      '⁧أدِّ الاختبار مرة واحدة على الأقل لفتح شهادتك.⁩';

  @override
  String get lessonGenerating => '⁧جارٍ الإنشاء...⁩';

  @override
  String get lessonGenerateCertificate => '⁧إنشاء الشهادة⁩';

  @override
  String get lessonPending => '⁧معلّق⁩';

  @override
  String get lessonCertificateGenerated => '⁧تم إنشاء الشهادة⁩';

  @override
  String lessonIssuedOn(String date) {
    return '⁧صدرت في $date⁩';
  }

  @override
  String get lessonLastExamScore => '⁧درجة آخر اختبار⁩';

  @override
  String lessonLatestAttempt(String title) {
    return '⁧آخر محاولة: $title⁩';
  }

  @override
  String lessonAttemptNumber(int number) {
    return '⁧المحاولة #$number⁩';
  }

  @override
  String get lessonVerificationCode => '⁧رمز التحقق:⁩';

  @override
  String get lessonDownloadPdf => '⁧تنزيل PDF⁩';

  @override
  String get commonCheckConnection => '⁧تحقّق من اتصالك وحاول مرة أخرى.⁩';

  @override
  String get commonNoCoursesYet => '⁧لم تسجّل في أي دورة بعد⁩';

  @override
  String get commonOnlineClassSuffix => '⁧ • حصة عبر الإنترنت⁩';

  @override
  String get assignSelectProfile => '⁧اختر ملف متعلم لعرض الواجبات.⁩';

  @override
  String get assignTitle => '⁧الواجبات⁩';

  @override
  String get assignSelectCourse => '⁧اختر دورة لعرض واجباتها.⁩';

  @override
  String get assignNoCoursesBody => '⁧تصفّح الدورات وسجّل لترى الواجبات هنا.⁩';

  @override
  String get assignSubmitted => '⁧تم إرسال الواجب⁩';

  @override
  String get assignSubmitFailed => '⁧تعذّر إرسال الواجب⁩';

  @override
  String get assignLoadFailed => '⁧تعذّر تحميل الواجبات⁩';

  @override
  String get assignBack => '⁧العودة إلى الواجبات⁩';

  @override
  String assignCount(int count) {
    return '⁧$count من الواجبات لهذه الدورة⁩';
  }

  @override
  String get assignNone => '⁧لا توجد واجبات بعد⁩';

  @override
  String get assignNoneBody => '⁧لا توجد واجبات لهذه الدورة بعد.⁩';

  @override
  String get assignNoDeadline => '⁧بلا موعد نهائي⁩';

  @override
  String assignDue(String date) {
    return '⁧الموعد: $date⁩';
  }

  @override
  String assignMarks(int count) {
    return '⁧$count درجة⁩';
  }

  @override
  String get assignYourSubmission => '⁧إجابتك المُرسلة⁩';

  @override
  String get assignOpenFile => '⁧فتح الملف المرفق⁩';

  @override
  String assignMarksAwarded(String awarded, int total) {
    return '⁧الدرجة: $awarded/$total⁩';
  }

  @override
  String assignFeedback(String feedback) {
    return '⁧الملاحظات: $feedback⁩';
  }

  @override
  String get assignAnswerHint => '⁧اكتب إجابتك...⁩';

  @override
  String get assignSubmitting => '⁧جارٍ الإرسال...⁩';

  @override
  String get assignSubmit => '⁧إرسال الواجب⁩';

  @override
  String get assignFileFailed => '⁧تعذّر فتح الملف المرفق.⁩';

  @override
  String get assignGraded => '⁧مُقيَّم⁩';

  @override
  String get assignSubmittedBadge => '⁧مُرسَل⁩';

  @override
  String get examsSelectProfile => '⁧اختر ملف متعلم لعرض الاختبارات.⁩';

  @override
  String get examsSelectProfileFirst => '⁧اختر ملف متعلم أولًا.⁩';

  @override
  String get examsTitle => '⁧الاختبارات⁩';

  @override
  String get examsSelectCourse => '⁧اختر دورة لعرض اختباراتها وأدائها.⁩';

  @override
  String get examsNoCoursesBody => '⁧تصفّح الدورات وسجّل لترى الاختبارات هنا.⁩';

  @override
  String get examsLoadFailed => '⁧تعذّر تحميل الاختبارات⁩';

  @override
  String get examsBackOnline => '⁧العودة إلى الحصص⁩';

  @override
  String get examsBackRegular => '⁧العودة إلى الدورات العادية⁩';

  @override
  String examsAvailable(int count) {
    return '⁧$count من الاختبارات المتاحة⁩';
  }

  @override
  String get examsNone => '⁧لا توجد اختبارات متاحة⁩';

  @override
  String get examsNoneBody => '⁧لا توجد اختبارات لهذه الدورة بعد.⁩';

  @override
  String get examsTypePractice => '⁧تدريبي⁩';

  @override
  String get examsTypeFinal => '⁧نهائي⁩';

  @override
  String get examsPassed => '⁧ناجح⁩';

  @override
  String get examsInProgress => '⁧قيد التقدم⁩';

  @override
  String get examsRandomQuestions => '⁧أسئلة عشوائية⁩';

  @override
  String examsQuestions(int count) {
    return '⁧$count سؤال⁩';
  }

  @override
  String examsPassMark(int mark) {
    return '⁧النجاح: $mark%⁩';
  }

  @override
  String examsAttempts(String value) {
    return '⁧المحاولات: $value⁩';
  }

  @override
  String examsBestScore(String score, int total) {
    return '⁧أفضل درجة: $score/$total⁩';
  }

  @override
  String get examsTimeLeft => '⁧الوقت المتبقي في محاولتك⁩';

  @override
  String get examsTimesUp => '⁧انتهى الوقت⁩';

  @override
  String get examsTimerRunning => '⁧المؤقت مستمر — استأنف للمتابعة.⁩';

  @override
  String get examsOpenToSubmit => '⁧افتح الاختبار لإرسال إجاباتك المحفوظة.⁩';

  @override
  String get examsStartsIn => '⁧يبدأ خلال⁩';

  @override
  String examsOpens(String date) {
    return '⁧يُفتح في $date⁩';
  }

  @override
  String get examsWindowClosesIn => '⁧تُغلق نافذة البدء خلال⁩';

  @override
  String examsStartBefore(String date) {
    return '⁧ابدأ قبل $date⁩';
  }

  @override
  String get examsViewResult => '⁧عرض النتيجة⁩';

  @override
  String get examsResume => '⁧استئناف الاختبار⁩';

  @override
  String get examsSubmitAnswers => '⁧إرسال الإجابات⁩';

  @override
  String get examsMaxAttempts => '⁧تم بلوغ الحد الأقصى للمحاولات⁩';

  @override
  String get examsNotStartedYet => '⁧لم يبدأ بعد⁩';

  @override
  String get examsWindowClosed => '⁧أُغلقت نافذة البدء⁩';

  @override
  String get examsTake => '⁧أدِّ الاختبار⁩';

  @override
  String get examsBack => '⁧العودة إلى الاختبارات⁩';

  @override
  String examsCountdownDays(int d, String h, String m) {
    return '⁧$dي $hس $mد⁩';
  }

  @override
  String takeMinutesLeft(int count) {
    return '⁧تبقى $count دقائق⁩';
  }

  @override
  String get takeOneMinuteLeft => '⁧تبقى دقيقة — سيُرسل اختبارك تلقائيًا⁩';

  @override
  String get takeNotStartedToast => '⁧لم يبدأ هذا الاختبار بعد⁩';

  @override
  String get takeWindowClosedToast => '⁧أُغلقت نافذة بدء هذا الاختبار⁩';

  @override
  String get takeSubmittedToast => '⁧تم إرسال الاختبار⁩';

  @override
  String get takeSubmitError => '⁧تعذّر إرسال اختبارك. حاول مرة أخرى.⁩';

  @override
  String get takeStartFailed => '⁧تعذّر بدء الاختبار. حاول مرة أخرى.⁩';

  @override
  String get takeConfirmTitle => '⁧إرسال اختبارك؟⁩';

  @override
  String takeConfirmUnanswered(int count) {
    return '⁧لديك $count من الأسئلة دون إجابة. لا يمكنك تغيير إجاباتك بعد الإرسال.⁩';
  }

  @override
  String get takeConfirmAll =>
      '⁧أجبت عن كل الأسئلة. لا يمكنك تغيير إجاباتك بعد الإرسال.⁩';

  @override
  String get takeAnswered => '⁧مُجاب⁩';

  @override
  String get takeUnanswered => '⁧بلا إجابة⁩';

  @override
  String get takeNotAnswered => '⁧لم تتم الإجابة⁩';

  @override
  String get takeFlagged => '⁧مُعلَّم⁩';

  @override
  String get takeFlag => '⁧تعليم⁩';

  @override
  String get takeKeepWorking => '⁧متابعة الحل⁩';

  @override
  String get takeSubmitExam => '⁧إرسال الاختبار⁩';

  @override
  String get takeLeaveTitle => '⁧مغادرة الاختبار؟⁩';

  @override
  String get takeLeaveBody =>
      '⁧إجاباتك محفوظة، لكن المؤقت يستمر. يمكنك الاستئناف من قائمة الاختبارات.⁩';

  @override
  String get takeStay => '⁧البقاء⁩';

  @override
  String get takeLeave => '⁧مغادرة⁩';

  @override
  String get takeQuestions => '⁧الأسئلة⁩';

  @override
  String takeAnsweredOf(int answered, int total) {
    return '⁧أُجيب عن $answered من $total⁩';
  }

  @override
  String takeFlaggedCount(int count) {
    return '⁧$count مُعلَّم⁩';
  }

  @override
  String get takeSubmittedTitle => '⁧تم إرسال الاختبار⁩';

  @override
  String get takeTakingToResult => '⁧جارٍ نقلك إلى نتيجتك…⁩';

  @override
  String get takeLoadFailedTitle => '⁧تعذّر تحميل الاختبار⁩';

  @override
  String get takeNotStartedTitle => '⁧لم يبدأ الاختبار بعد⁩';

  @override
  String takeNotStartedBody(String date) {
    return '⁧يبدأ هذا الاختبار في $date. يمكنك البدء في أي وقت بعد ذلك حتى انقضاء 50% من مدته.⁩';
  }

  @override
  String get takeClosedTitle => '⁧أُغلقت نافذة البدء⁩';

  @override
  String takeClosedBody(String date) {
    return '⁧كان يمكن بدء هذا الاختبار حتى $date. انتهت نافذة البدء.⁩';
  }

  @override
  String get takeNoQuestionsTitle => '⁧لا توجد أسئلة⁩';

  @override
  String get takeNoQuestionsBody => '⁧لا يحتوي هذا الاختبار على أسئلة بعد.⁩';

  @override
  String get takeAllQuestions => '⁧عرض كل الأسئلة⁩';

  @override
  String takeQuestionOf(int n, int total) {
    return '⁧السؤال $n من $total⁩';
  }

  @override
  String takeMarks(int count) {
    return '⁧$count درجة⁩';
  }

  @override
  String get takeSubmitting => '⁧جارٍ الإرسال...⁩';

  @override
  String get takeReviewSubmit => '⁧المراجعة والإرسال⁩';

  @override
  String get takeNext => '⁧التالي⁩';

  @override
  String get takeAnswerHint => '⁧اكتب إجابتك...⁩';

  @override
  String takeWords(int count) {
    return '⁧$count كلمة⁩';
  }

  @override
  String get takeNoOptions => '⁧لا توجد خيارات لهذا السؤال.⁩';

  @override
  String get takeSelectAll => '⁧اختر كل ما ينطبق⁩';

  @override
  String get takeTimesUp => '⁧انتهى الوقت⁩';

  @override
  String get takeSubmittingAnswers => '⁧جارٍ إرسال إجاباتك…⁩';

  @override
  String get takeSubmissionFailed => '⁧فشل الإرسال⁩';

  @override
  String get takeSavedOnDevice =>
      '⁧إجاباتك محفوظة على هذا الجهاز. تحقق من اتصالك وحاول مجددًا.⁩';

  @override
  String get takeRetrySubmit => '⁧إعادة الإرسال⁩';

  @override
  String get takeDiscardLeave => '⁧تجاهل والمغادرة⁩';

  @override
  String takeTimeRemaining(String time) {
    return '⁧الوقت المتبقي $time⁩';
  }

  @override
  String get takeDuration => '⁧المدة⁩';

  @override
  String get takeTotalMarks => '⁧مجموع الدرجات⁩';

  @override
  String get takePassMarkLabel => '⁧درجة النجاح⁩';

  @override
  String takeRule1(int minutes) {
    return '⁧يبدأ المؤقت فور الضغط على «ابدأ» ويستمر $minutes دقيقة — ولا يتوقف حتى إن غادرت التطبيق أو أغلقته.⁩';
  }

  @override
  String get takeRule2 =>
      '⁧تُحفظ إجاباتك تلقائيًا على هذا الجهاز. وعند عودتك تتابع من حيث توقفت.⁩';

  @override
  String get takeRule3 => '⁧استخدم الجهاز نفسه طوال الاختبار.⁩';

  @override
  String get takeRule4 => '⁧عند انتهاء الوقت تُرسل إجاباتك تلقائيًا.⁩';

  @override
  String takeStartBeforeFull(String date) {
    return '⁧ابدأ قبل $date. بعد البدء تحصل على المدة كاملة.⁩';
  }

  @override
  String get takeBeforeYouBegin => '⁧قبل أن تبدأ⁩';

  @override
  String get takeStart => '⁧ابدأ الاختبار⁩';

  @override
  String get resultPassed => '⁧تهانينا! لقد نجحت.⁩';

  @override
  String get resultGrading => '⁧يجري تصحيح إجاباتك المكتوبة.⁩';

  @override
  String get resultFailed => '⁧لم تنجح. راجع إجاباتك وحاول مجددًا.⁩';

  @override
  String resultPassDuration(int mark, int minutes) {
    return '⁧درجة النجاح: $mark% • المدة: $minutes دقيقة⁩';
  }

  @override
  String get resultScore => '⁧الدرجة⁩';

  @override
  String get resultAttempts => '⁧المحاولات⁩';

  @override
  String get resultTimeTaken => '⁧الوقت المستغرق⁩';

  @override
  String resultMinutesShort(int count) {
    return '⁧$countد⁩';
  }

  @override
  String get resultHistory => '⁧سجل المحاولات⁩';

  @override
  String resultShowHistory(int count) {
    return '⁧عرض سجل المحاولات ($count)⁩';
  }

  @override
  String get resultHideHistory => '⁧إخفاء سجل المحاولات⁩';

  @override
  String get resultReview => '⁧مراجعة الأسئلة⁩';

  @override
  String get resultReviewHint => '⁧راجع إجاباتك والإجابات الصحيحة.⁩';

  @override
  String get resultNoAttempts => '⁧لم يتم العثور على محاولات.⁩';

  @override
  String resultShowingAttempt(int number) {
    return '⁧عرض إجابات المحاولة #$number.⁩';
  }

  @override
  String resultBestScore(String score, int total, int number) {
    return '⁧أعلى درجة: $score/$total (المحاولة #$number)⁩';
  }

  @override
  String resultPassedEarlier(int number) {
    return '⁧لم تنجح في هذه المحاولة، لكنك نجحت بالفعل في المحاولة #$number.⁩';
  }

  @override
  String resultSummaryTitle(int number) {
    return '⁧ملخص المحاولة #$number⁩';
  }

  @override
  String get resultTotalQuestions => '⁧الأسئلة⁩';

  @override
  String get resultAnswered => '⁧تمت الإجابة⁩';

  @override
  String get resultUnanswered => '⁧بلا إجابة⁩';

  @override
  String get resultMarksDeducted => '⁧درجات سالبة⁩';

  @override
  String get resultRetake => '⁧إعادة الاختبار⁩';

  @override
  String resultAwarded(String awarded, int total) {
    return '⁧مُنح $awarded من $total⁩';
  }

  @override
  String get resultAwaitingGrading => '⁧بانتظار التقييم⁩';

  @override
  String get resultCorrect => '⁧صحيح⁩';

  @override
  String get resultPartial => '⁧صحيح جزئيًا⁩';

  @override
  String get resultIncorrect => '⁧خطأ⁩';

  @override
  String get resultYourAnswer => '⁧إجابتك⁩';

  @override
  String get resultSuggestedAnswer => '⁧الإجابة المقترحة⁩';

  @override
  String get resultCorrectAnswer => '⁧الإجابة الصحيحة⁩';

  @override
  String get resultExplanation => '⁧الشرح⁩';

  @override
  String resultAttempt(int number) {
    return '⁧المحاولة #$number⁩';
  }

  @override
  String get resultLoadFailed => '⁧تعذّر تحميل النتيجة.⁩';

  @override
  String get resultPending => '⁧معلّق⁩';

  @override
  String get resultPassedBadge => '⁧ناجح⁩';

  @override
  String get resultFailedBadge => '⁧راسب⁩';

  @override
  String get certSelectProfile => '⁧اختر ملف متعلم لعرض الشهادات.⁩';

  @override
  String get certLoadFailed => '⁧تعذّر تحميل شهاداتك.⁩';

  @override
  String get certEyebrow => '⁧إنجازاتك⁩';

  @override
  String get certTitle => '⁧شهاداتي⁩';

  @override
  String get certSubtitle => '⁧اعرض شهادات دوراتك وتحقق منها واحفظها.⁩';

  @override
  String get certSearch => '⁧ابحث عن دورة أو اختبار أو رمز تحقق...⁩';

  @override
  String get certEmpty => '⁧لا توجد شهادات بعد⁩';

  @override
  String get certNoMatch => '⁧لا توجد شهادات مطابقة لبحثك⁩';

  @override
  String get certEmptyHint => '⁧ستظهر هنا الشهادات التي تحصل عليها.⁩';

  @override
  String get certNoMatchHint => '⁧جرّب بحثًا مختلفًا.⁩';

  @override
  String certShowing(int shown, int total) {
    return '⁧عرض $shown من أصل $total شهادة⁩';
  }

  @override
  String get certDateUnavailable => '⁧التاريخ غير متاح⁩';

  @override
  String get certValid => '⁧صالحة⁩';

  @override
  String certIssued(String date) {
    return '⁧صدرت في $date⁩';
  }

  @override
  String certResult(String score, int total) {
    return '⁧النتيجة: $score / $total⁩';
  }

  @override
  String get certPassed => '⁧ناجح⁩';

  @override
  String get certNotPassed => '⁧غير ناجح⁩';

  @override
  String get certHide => '⁧إخفاء⁩';

  @override
  String get certPreview => '⁧معاينة⁩';

  @override
  String get certSavePdf => '⁧حفظ PDF⁩';

  @override
  String get certAchievement => '⁧شهادة إنجاز⁩';

  @override
  String get certPresentedTo => '⁧مُقدّمة إلى⁩';

  @override
  String get certFor => '⁧عن⁩';

  @override
  String certProgress(int progress) {
    return '⁧تقدم الدورة $progress%⁩';
  }

  @override
  String certId(String id) {
    return '⁧معرّف الشهادة: $id⁩';
  }

  @override
  String certCode(String code) {
    return '⁧رمز التحقق: $code⁩';
  }

  @override
  String get certCodeCopied => '⁧تم نسخ رمز التحقق⁩';

  @override
  String get certCopyCode => '⁧نسخ الرمز⁩';

  @override
  String get certPdfFailed => '⁧تعذّر فتح معاينة PDF.⁩';

  @override
  String get certAllTypes => '⁧جميع الأنواع⁩';

  @override
  String get certTypeAttendance => '⁧الحضور⁩';

  @override
  String get certTypeCompletion => '⁧إتمام⁩';

  @override
  String get certTypeCourseCompletion => '⁧إتمام الدورة⁩';

  @override
  String get certTypeExam => '⁧اختبار⁩';

  @override
  String get wishlistRemoved => '⁧أُزيلت من قائمة الأمنيات⁩';

  @override
  String get wishlistRemoveFailed => '⁧تعذّرت الإزالة من قائمة الأمنيات⁩';

  @override
  String get wishlistSelectProfile => '⁧اختر ملف متعلم لعرض قائمة أمنياتك.⁩';

  @override
  String get wishlistLoadFailed => '⁧تعذّر تحميل قائمة الأمنيات⁩';

  @override
  String get wishlistTitle => '⁧قائمة الأمنيات⁩';

  @override
  String wishlistCount(int count) {
    return '⁧$count من الدورات المحفوظة لوقت لاحق⁩';
  }

  @override
  String get wishlistEmpty => '⁧قائمة أمنياتك فارغة⁩';

  @override
  String get wishlistEmptyBody => '⁧احفظ الدورات التي تعجبك وعُد إليها هنا.⁩';

  @override
  String get wishlistCourse => '⁧دورة⁩';

  @override
  String get wishlistViewDetails => '⁧عرض تفاصيل الدورة⁩';

  @override
  String get formatSelfPaced => '⁧ذاتي الوتيرة⁩';

  @override
  String get formatLive => '⁧حصة مباشرة⁩';

  @override
  String get notifTitle => '⁧الإشعارات⁩';

  @override
  String get notifMarkReadFailed => '⁧تعذّر التعليم كمقروء⁩';

  @override
  String get notifMarkAllRead => '⁧تعليم الكل كمقروء⁩';

  @override
  String notifUnread(int count) {
    return '⁧$count غير مقروءة⁩';
  }

  @override
  String get notifLoadFailed => '⁧تعذّر تحميل الإشعارات.⁩';

  @override
  String get notifTapRetry => '⁧اضغط لإعادة المحاولة⁩';

  @override
  String get notifCaughtUp => '⁧لا جديد لديك.⁩';

  @override
  String get notifRemoveFailed => '⁧تعذّرت إزالة الإشعار⁩';

  @override
  String get notifJustNow => '⁧الآن⁩';

  @override
  String notifMinutesAgo(int count) {
    return '⁧منذ $count د⁩';
  }

  @override
  String notifHoursAgo(int count) {
    return '⁧منذ $count س⁩';
  }

  @override
  String notifDaysAgo(int count) {
    return '⁧منذ $count ي⁩';
  }

  @override
  String get notifView => '⁧عرض⁩';

  @override
  String notifBellUnread(int count) {
    return '⁧الإشعارات، $count غير مقروءة⁩';
  }

  @override
  String get chatNoCourse => '⁧لم تُحدَّد الدورة.⁩';

  @override
  String get chatSelectProfile => '⁧اختر ملف متعلم للانضمام إلى دردشة الحصة.⁩';

  @override
  String get chatConnectFailed =>
      '⁧تعذّر الاتصال بدردشة الحصة. يرجى المحاولة مرة أخرى.⁩';

  @override
  String get chatTooLong => '⁧يمكن أن تصل الرسالة إلى 2000 حرف.⁩';

  @override
  String get chatReportTitle => '⁧الإبلاغ عن رسالة⁩';

  @override
  String get chatReportWhy => '⁧لماذا يجب مراجعة هذه الرسالة؟⁩';

  @override
  String get chatReportHint => '⁧اشرح المشكلة...⁩';

  @override
  String get chatSubmitReport => '⁧إرسال البلاغ⁩';

  @override
  String get chatReported => '⁧تم الإبلاغ عن الرسالة لمراجعتها.⁩';

  @override
  String get chatReportFailed =>
      '⁧تعذّر الإبلاغ عن الرسالة. يرجى المحاولة مرة أخرى.⁩';

  @override
  String chatClassChat(String batch) {
    return '⁧$batch • دردشة الحصة⁩';
  }

  @override
  String get chatDismiss => '⁧إغلاق⁩';

  @override
  String get chatRetry => '⁧إعادة المحاولة⁩';

  @override
  String get chatPlaceholder => '⁧اكتب رسالة...⁩';

  @override
  String get chatConnecting => '⁧جارٍ الاتصال...⁩';

  @override
  String get chatSend => '⁧إرسال الرسالة⁩';

  @override
  String get chatLive => '⁧متصل⁩';

  @override
  String get chatOffline => '⁧غير متصل⁩';

  @override
  String get chatNextClass => '⁧الحصة المباشرة التالية⁩';

  @override
  String get chatJoinClass => '⁧انضم للحصة⁩';

  @override
  String get chatEmpty => '⁧لا توجد رسائل بعد. ألقِ التحية على زملائك!⁩';

  @override
  String get chatInstructor => '⁧المعلم⁩';

  @override
  String get chatMessageActions => '⁧إجراءات الرسالة⁩';

  @override
  String get chatTimeTba => '⁧سيُعلن الموعد لاحقًا⁩';

  @override
  String chatDateAt(String date, String time) {
    return '⁧$date الساعة $time⁩';
  }

  @override
  String get familyTitle => '⁧ملفات المتعلمين⁩';

  @override
  String get familyAddProfile => '⁧إضافة ملف⁩';

  @override
  String get familyEmpty => '⁧لا توجد ملفات متعلمين بعد. أضف ملفًا للبدء.⁩';

  @override
  String get familySubscribed => '⁧مشترك⁩';

  @override
  String get familySubscription => '⁧الاشتراك⁩';

  @override
  String get familySubscribe => '⁧اشترك⁩';

  @override
  String get commonEdit => '⁧تعديل⁩';

  @override
  String get pinReset => '⁧إعادة تعيين الرمز⁩';

  @override
  String get pinSet => '⁧تعيين الرمز⁩';

  @override
  String get imageInvalidType =>
      '⁧اختر صورة بصيغة JPEG أو PNG أو WebP أو GIF.⁩';

  @override
  String get imageTooLarge => '⁧يجب ألا يتجاوز حجم الصورة 5 ميغابايت⁩';

  @override
  String get imagePickerFailed => '⁧تعذّر فتح مكتبة الصور.⁩';

  @override
  String get learnerChooseDob => '⁧اختر تاريخ الميلاد.⁩';

  @override
  String get learnerPhotoUploadFailed =>
      '⁧تم إنشاء المتعلم، لكن تعذّر رفع الصورة. يمكنك إضافتها من إدارة الملفات.⁩';

  @override
  String get learnerCreateFailed => '⁧تعذّر إنشاء الملف⁩';

  @override
  String get learnerAddTitle => '⁧إضافة متعلم⁩';

  @override
  String get learnerAddPhoto => '⁧إضافة صورة الملف⁩';

  @override
  String get learnerChangePhoto => '⁧تغيير صورة الملف⁩';

  @override
  String get learnerRemovePhoto => '⁧إزالة الصورة⁩';

  @override
  String get learnerAddPhotoOptional => '⁧أضف صورة الملف (اختياري)⁩';

  @override
  String get learnerName => '⁧اسم المتعلم⁩';

  @override
  String get learnerNameRequired => '⁧الاسم مطلوب⁩';

  @override
  String get learnerNameTooLong => '⁧أدخل اسمًا لا يتجاوز 100 حرف.⁩';

  @override
  String get learnerDob => '⁧تاريخ الميلاد⁩';

  @override
  String get learnerPinOptional => '⁧رمز PIN من 4 أرقام (اختياري)⁩';

  @override
  String get learnerPinFormat => '⁧يجب أن يتكون الرمز من 4 أرقام بالضبط⁩';

  @override
  String get learnerPinMismatch => '⁧الرمزان غير متطابقين⁩';

  @override
  String get learnerCreate => '⁧إضافة المتعلم⁩';

  @override
  String get learnerLoadFailed => '⁧تعذّر تحميل ملف المتعلم.⁩';

  @override
  String get learnerUpdateFailed => '⁧تعذّر تحديث الملف⁩';

  @override
  String get learnerNotFound => '⁧الملف غير موجود⁩';

  @override
  String learnerEditTitle(String name) {
    return '⁧تعديل ملف $name⁩';
  }

  @override
  String get learnerNameLocked => '⁧الاسم مقفل لأنه تم إصدار شهادة.⁩';

  @override
  String get learnerCancelPinChange => '⁧إلغاء تغيير رمز PIN⁩';

  @override
  String get learnerNewPin => '⁧رمز جديد من 4 أرقام⁩';

  @override
  String get learnerConfirmNewPin => '⁧تأكيد الرمز الجديد⁩';

  @override
  String get commonSaving => '⁧جارٍ الحفظ...⁩';

  @override
  String get learnerSaveChanges => '⁧حفظ التغييرات⁩';

  @override
  String get deleteFailed => '⁧تعذّر حذف الملف⁩';

  @override
  String deleteTitle(String name) {
    return '⁧حذف ملف $name؟⁩';
  }

  @override
  String get deleteDestroyed => '⁧سيتم حذف:⁩';

  @override
  String get deleteDestroyedItems =>
      '⁧التقدم والتسجيلات ونتائج الاختبارات ورسائل الدردشة.⁩';

  @override
  String get deleteSurvives => '⁧سيتم الاحتفاظ بـ:⁩';

  @override
  String get deleteSurvivesItems => '⁧الشهادات وسجلات الإشراف.⁩';

  @override
  String deleteTypeName(String name) {
    return '⁧اكتب $name للتأكيد⁩';
  }

  @override
  String get deleteDeleting => '⁧جارٍ الحذف…⁩';

  @override
  String get deleteConfirm => '⁧حذف الملف⁩';

  @override
  String get deleteGoBack => '⁧لا، عُد للخلف⁩';

  @override
  String get avatarLabel => '⁧صورة المتعلم⁩';

  @override
  String get secServerUnreachable =>
      '⁧تعذّر الوصول إلى الخادم. تحقّق من اتصالك بالإنترنت وحاول مرة أخرى.⁩';

  @override
  String get secTooManyAttempts =>
      '⁧محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا.⁩';

  @override
  String get secTitle => '⁧تسجيل الدخول والأمان⁩';

  @override
  String get secEmailRequired => '⁧أدخل بريدك الجديد.⁩';

  @override
  String get secEmailInvalid => '⁧أدخل بريدًا صالحًا، مثل name@example.com.⁩';

  @override
  String get secEmailSame => '⁧هذا هو بريدك بالفعل.⁩';

  @override
  String get secConfirmWithPassword => '⁧أدخل كلمة المرور الحالية للتأكيد.⁩';

  @override
  String get secEmailUpdated =>
      '⁧تم تحديث البريد. تحقق من صندوقك الجديد بحثًا عن رابط التحقق.⁩';

  @override
  String get secEmailUpdateFailed => '⁧تعذّر تحديث بريدك. حاول مرة أخرى.⁩';

  @override
  String get secEmail => '⁧البريد الإلكتروني⁩';

  @override
  String get secEmailLoadFailed => '⁧تعذّر تحميل بريدك الإلكتروني.⁩';

  @override
  String get secRetry => '⁧إعادة المحاولة⁩';

  @override
  String get secLoadingEmail => '⁧جارٍ تحميل البريد الإلكتروني للحساب…⁩';

  @override
  String get secUnverified =>
      '⁧غير مُتحقق — تحقق من بريدك بحثًا عن رابط التحقق⁩';

  @override
  String get secVerified => '⁧تم التحقق ✓⁩';

  @override
  String get secChangeEmail => '⁧تغيير البريد⁩';

  @override
  String get secNewEmail => '⁧البريد الجديد⁩';

  @override
  String get secCurrentPassword => '⁧كلمة المرور الحالية⁩';

  @override
  String get secPasswordConfirmHint => '⁧نطلب كلمة المرور للتأكد من هويتك.⁩';

  @override
  String get secSaveEmail => '⁧حفظ البريد⁩';

  @override
  String get secEmailChangeNote =>
      '⁧ستحتاج إلى التحقق من بريدك الجديد قبل اعتماده. يبقى حسابك نشطًا بالكامل في هذه الأثناء.⁩';

  @override
  String get secCurrentRequired => '⁧أدخل كلمة المرور الحالية.⁩';

  @override
  String get secNewRequired => '⁧أدخل كلمة مرور جديدة.⁩';

  @override
  String secTooShort(String min, int remaining) {
    return '⁧استخدم $min أحرف على الأقل (متبقٍ $remaining).⁩';
  }

  @override
  String secTooLong(String max) {
    return '⁧استخدم $max حرفًا أو أقل.⁩';
  }

  @override
  String get secSameAsCurrent => '⁧اختر كلمة مرور مختلفة عن الحالية.⁩';

  @override
  String get secConfirmRequired => '⁧أعد إدخال كلمة المرور الجديدة.⁩';

  @override
  String get secMismatch => '⁧كلمتا المرور غير متطابقتين.⁩';

  @override
  String get secPasswordUpdated =>
      '⁧تم تحديث كلمة المرور. استخدمها عند تسجيل الدخول القادم.⁩';

  @override
  String get secPasswordUpdateFailed =>
      '⁧تعذّر تحديث كلمة المرور. حاول مرة أخرى.⁩';

  @override
  String get secPassword => '⁧كلمة المرور⁩';

  @override
  String get secChangePassword => '⁧تغيير كلمة المرور⁩';

  @override
  String get secNewPassword => '⁧كلمة المرور الجديدة⁩';

  @override
  String secReqLength(String min) {
    return '⁧$min أحرف على الأقل⁩';
  }

  @override
  String get secReqDifferent => '⁧مختلفة عن كلمة المرور الحالية⁩';

  @override
  String get secConfirmPassword => '⁧تأكيد كلمة المرور الجديدة⁩';

  @override
  String get secPasswordsMatch => '⁧كلمتا المرور متطابقتان⁩';

  @override
  String get secPasswordsDontMatchYet => '⁧كلمتا المرور غير متطابقتين بعد⁩';

  @override
  String get secSavePassword => '⁧حفظ كلمة المرور⁩';

  @override
  String get commonOptional => '⁧اختياري⁩';

  @override
  String get commonCopied => '⁧تم النسخ⁩';

  @override
  String commonAge(String age) {
    return '⁧العمر $age⁩';
  }

  @override
  String get commonImageUploadFailed => '⁧تعذّر رفع الصورة⁩';

  @override
  String get commonRemoveImage => '⁧إزالة الصورة⁩';

  @override
  String get commonAddImage => '⁧إضافة صورة⁩';

  @override
  String get commonUploading => '⁧جارٍ الرفع...⁩';

  @override
  String get commonSubmit => '⁧إرسال⁩';

  @override
  String get subTitle => '⁧الاشتراك⁩';

  @override
  String get subIntro =>
      '⁧يحتاج كل ملف متعلم إلى اشتراك خاص به للتسجيل في الدورات. يستمر الاشتراك شهرًا من تاريخ الموافقة.⁩';

  @override
  String get subLoadFailed => '⁧تعذّر تحميل اشتراكك⁩';

  @override
  String get subHowToPay => '⁧طريقة الدفع⁩';

  @override
  String get subHowToPayBody =>
      '⁧أرسل الدفعة إلى أحد هذه الحسابات، ثم قدّم طلبًا لكل ملف مع تفاصيل المعاملة.⁩';

  @override
  String get subPerProfileMonth => '⁧لكل ملف · شهر واحد⁩';

  @override
  String get subNoPaymentDetails =>
      '⁧لم تُضف تفاصيل الدفع بعد. يرجى التواصل مع الدعم.⁩';

  @override
  String get subCopyAccountNumber => '⁧نسخ رقم الحساب⁩';

  @override
  String get subTypeBank => '⁧تحويل بنكي⁩';

  @override
  String get subTypeMobile => '⁧الخدمات المصرفية عبر الجوال⁩';

  @override
  String get subTypeOther => '⁧أخرى⁩';

  @override
  String get subBadgeSubscribed => '⁧مشترك⁩';

  @override
  String get subBadgeUnderReview => '⁧قيد المراجعة⁩';

  @override
  String get subBadgeNotSubscribed => '⁧غير مشترك⁩';

  @override
  String subSubscribedUntil(String date) {
    return '⁧مشترك حتى $date⁩';
  }

  @override
  String get subRenewalUnderReview => '⁧دفعة التجديد قيد المراجعة⁩';

  @override
  String get subPaymentUnderReview => '⁧الدفعة قيد المراجعة — عادةً خلال يوم⁩';

  @override
  String get subSubscribeToEnrol => '⁧اشترك للتسجيل في الدورات⁩';

  @override
  String get subLastRejected => '⁧لم تتم الموافقة على الدفعة الأخيرة.⁩';

  @override
  String subLastRejectedReason(String reason) {
    return '⁧لم تتم الموافقة على الدفعة الأخيرة: $reason⁩';
  }

  @override
  String subWaiverReady(int percent) {
    return '⁧إعفاء من الرسوم بنسبة $percent% جاهز⁩';
  }

  @override
  String subWaiverReadyUseBy(int percent, String date) {
    return '⁧إعفاء من الرسوم بنسبة $percent% جاهز — استخدمه قبل $date⁩';
  }

  @override
  String get subWaiverUnderReview => '⁧طلب الإعفاء من الرسوم قيد المراجعة⁩';

  @override
  String subWaiverRejected(String reason) {
    return '⁧لم تتم الموافقة على الإعفاء: $reason.⁩';
  }

  @override
  String get subRequestWaiver => '⁧تحتاج مساعدة في الرسوم؟ اطلب إعفاءً⁩';

  @override
  String get subWaiverLimit => '⁧تم بلوغ حد الإعفاءات لهذا العام⁩';

  @override
  String subWaiverLimitNext(String date) {
    return '⁧تم بلوغ حد الإعفاءات لهذا العام (التالي في $date)⁩';
  }

  @override
  String get subCancelRequest => '⁧إلغاء الطلب⁩';

  @override
  String get subRenew => '⁧تجديد⁩';

  @override
  String get subApply => '⁧قدّم طلب اشتراك⁩';

  @override
  String get subLearnerProfiles => '⁧ملفات المتعلمين⁩';

  @override
  String subSubscribedCount(int count, int total) {
    return '⁧$count من $total مشترك⁩';
  }

  @override
  String subUnderReviewCount(int count) {
    return '⁧$count قيد المراجعة⁩';
  }

  @override
  String get subAddProfileToSubscribe => '⁧أضف ملف متعلم للاشتراك.⁩';

  @override
  String get subCancelTitle => '⁧إلغاء هذا الطلب؟⁩';

  @override
  String subCancelBody(String name) {
    return '⁧لن تتم مراجعة دفعة $name. يمكنك إرسالها لاحقًا.⁩';
  }

  @override
  String get subKeepIt => '⁧إبقاء⁩';

  @override
  String get subCancelled => '⁧تم إلغاء الطلب⁩';

  @override
  String get subCancelFailed => '⁧تعذّر إلغاء الطلب⁩';

  @override
  String get subPaymentHistory => '⁧سجل المدفوعات⁩';

  @override
  String get subFeeWaivers => '⁧الإعفاءات من الرسوم⁩';

  @override
  String subWaiverPercent(int percent) {
    return '⁧إعفاء $percent%⁩';
  }

  @override
  String subSubmittedOn(String date) {
    return '⁧أُرسل في $date⁩';
  }

  @override
  String subUntil(String date) {
    return '⁧حتى $date⁩';
  }

  @override
  String get subReqUnderReview => '⁧قيد المراجعة⁩';

  @override
  String get subReqApproved => '⁧مقبول⁩';

  @override
  String get subReqRejected => '⁧مرفوض⁩';

  @override
  String get subReqCancelled => '⁧ملغى⁩';

  @override
  String subWaiverOff(int percent) {
    return '⁧خصم $percent% على شهر واحد⁩';
  }

  @override
  String subRequestedOn(String date) {
    return '⁧طُلب في $date⁩';
  }

  @override
  String subUseBy(String date) {
    return '⁧استخدمه قبل $date⁩';
  }

  @override
  String subUsedOn(String date) {
    return '⁧استُخدم في $date⁩';
  }

  @override
  String get subWaiverReadyToUse => '⁧جاهز للاستخدام⁩';

  @override
  String get subWaiverUsed => '⁧مُستخدم⁩';

  @override
  String get subWaiverNotApproved => '⁧غير مقبول⁩';

  @override
  String get subWaiverExpired => '⁧منتهي⁩';

  @override
  String get subWaiverWithdrawn => '⁧مسحوب⁩';

  @override
  String subSubmittedPayment(String name) {
    return '⁧تم إرسال الدفعة. سنشترك $name بعد التحقق منها.⁩';
  }

  @override
  String get subWaiverSent => '⁧تم إرسال طلب الإعفاء. سنراسلك بعد مراجعته.⁩';

  @override
  String applyRenewTitle(String name) {
    return '⁧تجديد اشتراك $name⁩';
  }

  @override
  String applyApplyTitle(String name) {
    return '⁧طلب اشتراك $name⁩';
  }

  @override
  String applyFullyWaivedBody(String name) {
    return '⁧يغطي إعفاء $name الشهر كاملًا، لذا لا حاجة للدفع. سيوافق المسؤول ويشترك $name لمدة شهر.⁩';
  }

  @override
  String applyPaymentBody(String amount, String name) {
    return '⁧أدخل تفاصيل دفعتك البالغة $amount. سيتحقق منها المسؤول ويشترك $name لمدة شهر.⁩';
  }

  @override
  String applyWaiverApplied(int percent) {
    return '⁧تم تطبيق إعفاء $percent%⁩';
  }

  @override
  String get applyNothingToPay => '⁧لا شيء للدفع هذا الشهر.⁩';

  @override
  String get applyWaiverUsedNote =>
      '⁧يُستخدم الإعفاء عند الموافقة على هذا الاشتراك.⁩';

  @override
  String get applyPaidTo => '⁧تم الدفع إلى⁩';

  @override
  String applyAmount(String currency) {
    return '⁧المبلغ ($currency)⁩';
  }

  @override
  String get applyAmountRequired => '⁧أدخل المبلغ المدفوع⁩';

  @override
  String get applyPaymentDate => '⁧تاريخ الدفع⁩';

  @override
  String get applyTransactionId => '⁧رقم المعاملة / المرجع⁩';

  @override
  String get applyTransactionIdHint => '⁧مثال: 9KD7X2LQ1P⁩';

  @override
  String get applyTransactionIdRequired => '⁧أدخل معرّف المعاملة⁩';

  @override
  String get applyPaidFrom => '⁧تم الدفع من⁩';

  @override
  String get applyPaidFromHint => '⁧رقم حسابك أو جوالك⁩';

  @override
  String get applyNote => '⁧ملاحظة⁩';

  @override
  String get applyProof => '⁧لقطة شاشة الدفع / الإيصال⁩';

  @override
  String get applySubmitPayment => '⁧إرسال الدفعة⁩';

  @override
  String get applySubmitFailed => '⁧تعذّر إرسال دفعتك⁩';

  @override
  String waiverTitle(String name) {
    return '⁧طلب إعفاء من الرسوم لـ $name⁩';
  }

  @override
  String waiverBody(String name) {
    return '⁧إذا كان دفع الرسوم كاملة صعبًا، فأخبرنا بوضعك. عند الموافقة تحصل على خصم 25–100% على اشتراك $name التالي لمدة شهر، يُستخدم خلال 30 يومًا.⁩';
  }

  @override
  String get waiverSituation => '⁧وضعك⁩';

  @override
  String get waiverSituationHint =>
      '⁧مثل دخل الأسرة، وعدد الأطفال الدارسين، والتغيرات الأخيرة…⁩';

  @override
  String waiverMinChars(String min) {
    return '⁧يرجى كتابة $min حرفًا على الأقل⁩';
  }

  @override
  String waiverDocuments(String max) {
    return '⁧مستندات داعمة (اختياري، حتى $max صور)⁩';
  }

  @override
  String waiverRemaining(int count, String name) {
    return '⁧يمكنك تقديم $count من الطلبات الإضافية لـ $name خلال الـ 12 شهرًا القادمة.⁩';
  }

  @override
  String get waiverSend => '⁧إرسال الطلب⁩';

  @override
  String get waiverFailed => '⁧تعذّر إرسال طلب الإعفاء⁩';

  @override
  String get dashChooseProfile => '⁧اختر ملف متعلم لعرض لوحة التحكم هذه.⁩';

  @override
  String get dashChooseProfileButton => '⁧اختر ملفًا⁩';

  @override
  String get dashLoadFailed => '⁧تعذّر تحميل لوحة التحكم⁩';

  @override
  String dashGreetingMorning(String name) {
    return '⁧صباح الخير، $name⁩';
  }

  @override
  String dashGreetingAfternoon(String name) {
    return '⁧طاب يومك، $name⁩';
  }

  @override
  String dashGreetingEvening(String name) {
    return '⁧مساء الخير، $name⁩';
  }

  @override
  String get dashFindFirstCourse => '⁧اعثر على دورتك الأولى لتبدأ التعلّم.⁩';

  @override
  String get dashNiceWork => '⁧عمل رائع اليوم — حافظ على هذا الزخم.⁩';

  @override
  String get dashPickUp => '⁧تابع من حيث توقفت.⁩';

  @override
  String get dashClassLiveNow => '⁧حصتك مباشرة الآن⁩';

  @override
  String dashClassStartsAt(String time) {
    return '⁧تبدأ حصتك الساعة $time⁩';
  }

  @override
  String get dashJoin => '⁧انضم⁩';

  @override
  String get dashView => '⁧عرض⁩';

  @override
  String get dashStatInProgress => '⁧دورات قيد التقدم⁩';

  @override
  String dashStatCompletedCount(int count) {
    return '⁧$count مكتملة⁩';
  }

  @override
  String get dashStatLessons => '⁧الدروس المكتملة⁩';

  @override
  String dashStatThisWeek(int count) {
    return '⁧$count هذا الأسبوع⁩';
  }

  @override
  String get dashStatCertificates => '⁧الشهادات المكتسبة⁩';

  @override
  String get dashStatViewCertificates => '⁧عرض الشهادات⁩';

  @override
  String get dashStatStreak => '⁧أيام متتالية⁩';

  @override
  String get dashStatKeepStreak => '⁧ادرس اليوم لتحافظ عليها⁩';

  @override
  String dashStatBest(int count) {
    return '⁧الأفضل: $count يوم⁩';
  }

  @override
  String get dashContinueTitle => '⁧تابع التعلّم⁩';

  @override
  String get dashViewAll => '⁧عرض الكل⁩';

  @override
  String get dashAllFinished => '⁧أنهيت كل دوراتك!⁩';

  @override
  String get dashNotStarted => '⁧لم تبدأ أي دورة بعد⁩';

  @override
  String get dashBrowseCourses => '⁧تصفّح الدورات⁩';

  @override
  String dashNext(String title) {
    return '⁧التالي: $title⁩';
  }

  @override
  String get dashLiveOnline => '⁧حصة مباشرة عبر الإنترنت⁩';

  @override
  String get dashNoLessons => '⁧لا توجد دروس بعد⁩';

  @override
  String get dashSchedule => '⁧الجدول⁩';

  @override
  String get dashResume => '⁧استئناف⁩';

  @override
  String get dashStart => '⁧ابدأ⁩';

  @override
  String get dashLiveTitle => '⁧الحصص المباشرة القادمة⁩';

  @override
  String get dashLiveNone => '⁧لا توجد حصص مباشرة قادمة.⁩';

  @override
  String get dashLiveNow => '⁧مباشر الآن⁩';

  @override
  String get dashDeadlinesTitle => '⁧المواعيد النهائية⁩';

  @override
  String get dashDeadlinesNone => '⁧لا شيء مستحق — أنت جاهز.⁩';

  @override
  String get dashDueToday => '⁧مستحق اليوم⁩';

  @override
  String get dashDueTomorrow => '⁧مستحق غدًا⁩';

  @override
  String dashDueIn(int count) {
    return '⁧مستحق خلال $count يوم⁩';
  }

  @override
  String get dashExam => '⁧اختبار⁩';

  @override
  String get dashAssignment => '⁧واجب⁩';

  @override
  String get dashActivityTitle => '⁧نشاطك⁩';

  @override
  String dashActivitySubtitle(int total, int weeks) {
    return '⁧الدروس المكتملة أسبوعيًا · $total في آخر $weeks أسابيع⁩';
  }

  @override
  String get dashThisWeekShort => '⁧هذا الأسبوع⁩';

  @override
  String get dashResultsTitle => '⁧أحدث النتائج⁩';

  @override
  String get dashResultsNone => '⁧ستظهر نتائج اختباراتك وواجباتك هنا.⁩';

  @override
  String get dashResultPassed => '⁧ناجح⁩';

  @override
  String get dashResultFailed => '⁧غير ناجح⁩';

  @override
  String get dashResultGraded => '⁧مُقيَّم⁩';

  @override
  String get dashResultAwaiting => '⁧بانتظار التقييم⁩';

  @override
  String get dashNotesTitle => '⁧أحدث الملاحظات⁩';

  @override
  String get dashRecommended => '⁧موصى به لك⁩';

  @override
  String get dashBrowseAll => '⁧تصفّح الكل⁩';

  @override
  String get dashLiveBadge => '⁧مباشر⁩';

  @override
  String get dashSwitchProfile => '⁧تبديل الملف الشخصي⁩';

  @override
  String get dashTimeTba => '⁧الموعد لاحقًا⁩';

  @override
  String get helpTitle => '⁧المساعدة والدعم⁩';

  @override
  String get helpFaq => '⁧الأسئلة الشائعة⁩';

  @override
  String get helpSearch => '⁧ابحث في الأسئلة…⁩';

  @override
  String helpNoMatch(String query) {
    return '⁧لا توجد أسئلة تطابق “$query”.⁩';
  }

  @override
  String get helpNone => '⁧لم تُنشر أي أسئلة بعد.⁩';

  @override
  String get helpContactUs => '⁧تواصل معنا⁩';

  @override
  String get helpPolicies => '⁧السياسات⁩';

  @override
  String get pageUnavailable => '⁧هذه الصفحة غير متاحة حاليًا.⁩';

  @override
  String pageUpdated(String date) {
    return '⁧آخر تحديث $date⁩';
  }

  @override
  String get languageChangeTo => '⁧تغيير اللغة⁩';

  @override
  String accessEndedTitle(String name) {
    return '⁧انتهى اشتراك $name⁩';
  }

  @override
  String accessGraceBody(String date) {
    return '⁧تبقى الدروس والحصص المباشرة متاحة حتى $date. جدّد الآن حتى لا يتوقف التعلّم.⁩';
  }

  @override
  String get accessExpiredBody =>
      '⁧الدروس والحصص المباشرة والواجبات والدردشة مغلقة. تبقى الاختبارات والنتائج والشهادات متاحة.⁩';

  @override
  String accessNoneTitle(String name) {
    return '⁧لا يوجد اشتراك لـ $name⁩';
  }

  @override
  String get accessNoneBody =>
      '⁧اشترك لفتح الدروس والحصص المباشرة والواجبات والدردشة.⁩';

  @override
  String get accessRenew => '⁧تجديد الاشتراك⁩';

  @override
  String get accessSubscribe => '⁧اشترك⁩';

  @override
  String get accessRenewToJoin => '⁧جدّد للانضمام⁩';

  @override
  String get accessLessonLockedTitle => '⁧هذا الدرس مغلق⁩';

  @override
  String accessLessonLockedBody(String name) {
    return '⁧انتهى اشتراك $name. جدّده للمتابعة — تقدّمك محفوظ. تبقى الاختبارات متاحة.⁩';
  }
}
