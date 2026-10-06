import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/check_email_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/instructor_login_page.dart';
import '../../features/auth/presentation/pages/instructor_register_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/pages/verify_email_page.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/courses/presentation/pages/course_details_page.dart';
import '../../features/courses/presentation/pages/courses_page.dart';
import '../../features/courses/presentation/widgets/landing_layout.dart';
import '../../features/chat/presentation/pages/learner_chat_page.dart';
import '../../features/certificates/presentation/pages/certificates_page.dart';
import '../../features/dashboard/presentation/pages/learner_dashboard_page.dart';
import '../../features/dashboard/presentation/pages/learner_assignments_page.dart';
import '../../features/dashboard/presentation/pages/learner_exams_page.dart';
import '../../features/dashboard/presentation/widgets/learner_dashboard_layout.dart';
import '../../features/assignments/presentation/pages/course_assignments_page.dart';
import '../../features/exams/presentation/pages/course_exams_page.dart';
import '../../features/exams/presentation/pages/exam_result_page.dart';
import '../../features/exams/presentation/pages/take_exam_page.dart';
import '../../features/learning/presentation/pages/lesson_page.dart';
import '../../features/learning/presentation/pages/online_classes_page.dart';
import '../../features/learning/presentation/pages/regular_courses_page.dart';
import '../../features/profiles/presentation/pages/add_learner_page.dart';
import '../../features/profiles/presentation/pages/profile_selection_page.dart';
import '../../features/profiles/presentation/pages/profile_management_page.dart';
import '../../features/profiles/presentation/pages/edit_learner_page.dart';
import '../../features/profiles/presentation/pages/delete_learner_page.dart';
import '../../features/profiles/presentation/pages/account_settings_page.dart';
import '../../features/profiles/presentation/pages/login_security_page.dart';
import '../../features/profiles/presentation/widgets/profile_layout.dart';
import '../../features/wishlist/presentation/pages/wishlist_page.dart';
import '../pages/startup_page.dart';
import '../../features/instructor_dashboard/presentation/pages/instructor_dashboard_page.dart';
import '../../features/instructor_dashboard/presentation/widgets/instructor_dashboard_layout.dart';
import '../../features/instructor_courses/presentation/pages/instructor_courses_page.dart';
import '../../features/instructor_courses/presentation/pages/instructor_course_form_page.dart';
import '../../features/instructor_courses/presentation/pages/instructor_assignments_page.dart';
import '../../features/instructor_courses/presentation/pages/instructor_batches_pages.dart';
import '../../features/instructor_courses/presentation/pages/instructor_exams_pages.dart';
import '../../features/instructor_courses/presentation/pages/instructor_live_classes_page.dart';
import '../../features/instructor_courses/presentation/pages/instructor_materials_page.dart';
import '../../features/instructor_courses/presentation/pages/instructor_questions_pages.dart';
import '../../features/instructor_courses/presentation/pages/instructor_students_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/startup',
    routes: [
      GoRoute(
        path: '/startup',
        builder: (context, state) => const StartupPage(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(
        path: '/instructor/login',
        builder: (context, state) => const InstructorLoginPage(),
      ),
      GoRoute(
        path: '/instructor/register',
        builder: (context, state) => const InstructorRegisterPage(),
      ),
      ShellRoute(
        builder: (context, state, child) =>
            InstructorDashboardLayout(child: child),
        routes: [
          GoRoute(
            path: '/instructor/dashboard',
            builder: (context, state) => const InstructorDashboardPage(),
          ),
          GoRoute(
            path: '/instructor/courses',
            builder: (context, state) => const InstructorCoursesPage(),
          ),
          GoRoute(
            path: '/instructor/courses/create',
            builder: (context, state) => const InstructorCourseFormPage(),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/edit',
            builder: (context, state) => InstructorCourseFormPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/assignments',
            builder: (context, state) => InstructorAssignmentsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/assignments/create',
            builder: (context, state) => InstructorAssignmentCreatePage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/assignments/:assignmentId',
            builder: (context, state) => InstructorAssignmentDetailPage(
              courseId: state.pathParameters['courseId']!,
              assignmentId: state.pathParameters['assignmentId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/materials',
            builder: (context, state) => InstructorMaterialsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/materials/upload',
            builder: (context, state) => InstructorMaterialUploadPage(
              courseId: state.pathParameters['courseId']!,
              type: state.uri.queryParameters['type'] == 'video'
                  ? 'video'
                  : 'document',
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/questions',
            builder: (context, state) => InstructorQuestionsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/questions/create',
            builder: (context, state) => InstructorQuestionFormPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/questions/:questionId/edit',
            builder: (context, state) => InstructorQuestionFormPage(
              courseId: state.pathParameters['courseId']!,
              questionId: state.pathParameters['questionId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/exams',
            builder: (context, state) => InstructorExamsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/exams/create',
            builder: (context, state) => InstructorExamFormPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/exams/:examId/edit',
            builder: (context, state) => InstructorExamFormPage(
              courseId: state.pathParameters['courseId']!,
              examId: state.pathParameters['examId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/exams/:examId/attempts',
            builder: (context, state) => InstructorExamAttemptsPage(
              courseId: state.pathParameters['courseId']!,
              examId: state.pathParameters['examId']!,
            ),
          ),
          GoRoute(
            path:
                '/instructor/courses/:courseId/exams/:examId/attempts/:attemptId/grade',
            builder: (context, state) => InstructorGradeAttemptPage(
              courseId: state.pathParameters['courseId']!,
              examId: state.pathParameters['examId']!,
              attemptId: state.pathParameters['attemptId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/students',
            builder: (context, state) => InstructorStudentsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/batches',
            builder: (context, state) => InstructorBatchesPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/batches/create',
            builder: (context, state) => InstructorBatchCreatePage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/batches/:batchId/edit',
            builder: (context, state) => InstructorBatchEditPage(
              courseId: state.pathParameters['courseId']!,
              batchId: state.pathParameters['batchId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/courses/:courseId/batches/:batchId',
            builder: (context, state) => InstructorBatchDetailPage(
              courseId: state.pathParameters['courseId']!,
              batchId: state.pathParameters['batchId']!,
            ),
          ),
          GoRoute(
            path: '/instructor/chat',
            builder: (context, state) => LearnerChatPage(
              courseId: state.uri.queryParameters['courseId'] ?? '',
              courseTitle: state.uri.queryParameters['courseTitle'] ?? 'Course',
              batchId: state.uri.queryParameters['batchId'],
              batchName: state.uri.queryParameters['batchName'] ?? 'Batch',
            ),
          ),
          GoRoute(
            path: '/instructor/attendance/:sessionId',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Attendance'),
          ),
          GoRoute(
            path: '/instructor/live-classes',
            builder: (context, state) => const InstructorLiveClassesPage(),
          ),
          GoRoute(
            path: '/instructor/questions',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Questions'),
          ),
          GoRoute(
            path: '/instructor/certificates',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Certificates'),
          ),
          GoRoute(
            path: '/instructor/students',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Students'),
          ),
          GoRoute(
            path: '/instructor/notifications',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Notifications'),
          ),
          GoRoute(
            path: '/instructor/settings',
            builder: (context, state) =>
                const InstructorSectionPlaceholderPage(title: 'Settings'),
          ),
        ],
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/check-email',
        builder: (context, state) => CheckEmailPage(
          email: state.uri.queryParameters['email'] ?? '',
          instructor: state.uri.queryParameters['instructor'] == 'true',
        ),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) =>
            ResetPasswordPage(token: state.uri.queryParameters['token'] ?? ''),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) =>
            VerifyEmailPage(token: state.uri.queryParameters['token']),
      ),
      ShellRoute(
        builder: (context, state, child) => ProfileLayout(child: child),
        routes: [
          GoRoute(
            path: '/profiles',
            builder: (context, state) => const ProfileSelectionPage(),
          ),
          GoRoute(
            path: '/profiles/add',
            builder: (context, state) => const AddLearnerPage(),
          ),
          GoRoute(
            path: '/profile-management',
            builder: (context, state) => const ProfileManagementPage(),
          ),
          GoRoute(
            path: '/profiles/:profileId/edit',
            builder: (context, state) => EditLearnerPage(
              profileId: state.pathParameters['profileId']!,
              resetPinOnOpen:
                  state.uri.queryParameters['action'] == 'reset-pin',
            ),
          ),
          GoRoute(
            path: '/delete-profile',
            builder: (context, state) => DeleteLearnerPage(
              profileId: state.uri.queryParameters['profileId'] ?? '',
            ),
          ),
          GoRoute(
            path: '/account-settings',
            builder: (context, state) => const AccountSettingsPage(),
          ),
          GoRoute(
            path: '/login-security',
            builder: (context, state) => const LoginSecurityPage(),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) =>
            LearnerDashboardLayout(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const LearnerDashboardPage(),
          ),
          GoRoute(
            path: '/assignments',
            builder: (context, state) => const LearnerAssignmentsPage(),
          ),
          GoRoute(
            path: '/exams',
            builder: (context, state) => const LearnerExamsPage(),
          ),
          GoRoute(
            path: '/certificates',
            builder: (context, state) => const CertificatesPage(),
          ),
          GoRoute(
            path: '/wishlist',
            builder: (context, state) => const WishlistPage(),
          ),
          GoRoute(
            path: '/my-courses',
            builder: (context, state) => const RegularCoursesPage(),
          ),
          GoRoute(
            path: '/my-courses/:courseId/exams',
            builder: (context, state) => CourseExamsPage(
              courseId: state.pathParameters['courseId']!,
              onlineClass: state.uri.queryParameters['online'] == 'true',
            ),
          ),
          GoRoute(
            path: '/my-courses/:courseId/assignments',
            builder: (context, state) => CourseAssignmentsPage(
              courseId: state.pathParameters['courseId']!,
            ),
          ),
          GoRoute(
            path: '/my-courses/:courseId/exams/:examId/take',
            builder: (context, state) => TakeExamPage(
              courseId: state.pathParameters['courseId']!,
              examId: state.pathParameters['examId']!,
              onlineClass: state.uri.queryParameters['online'] == 'true',
            ),
          ),
          GoRoute(
            path: '/my-courses/:courseId/exams/:examId/result',
            builder: (context, state) => ExamResultPage(
              courseId: state.pathParameters['courseId']!,
              examId: state.pathParameters['examId']!,
              onlineClass: state.uri.queryParameters['online'] == 'true',
            ),
          ),
          GoRoute(
            path: '/my-courses/:courseId/lessons/:lessonId',
            builder: (context, state) => LessonPage(
              courseId: state.pathParameters['courseId']!,
              lessonId: state.pathParameters['lessonId']!,
            ),
          ),
          GoRoute(
            path: '/online-classes',
            builder: (context, state) => const OnlineClassesPage(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => LearnerChatPage(
              courseId: state.uri.queryParameters['courseId'] ?? '',
              courseTitle: state.uri.queryParameters['courseTitle'] ?? 'Course',
              batchId: state.uri.queryParameters['batchId'],
              batchName: state.uri.queryParameters['batchName'] ?? 'Batch',
            ),
          ),
        ],
      ),
      ShellRoute(
        builder: (context, state, child) => LandingLayout(child: child),
        routes: [
          GoRoute(
            path: '/courses',
            builder: (context, state) => const CoursesPage(),
          ),
          GoRoute(
            path: '/courses/:courseId',
            builder: (context, state) =>
                CourseDetailsPage(courseId: state.pathParameters['courseId']!),
          ),
        ],
      ),
    ],
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final path = state.uri.path;
      final account = auth.asData?.value;
      const openRoutes = {
        '/login',
        '/register',
        '/instructor/login',
        '/instructor/register',
        '/check-email',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
      };

      if (auth.isLoading) return path == '/startup' ? null : '/startup';
      if (path == '/startup') {
        if (account == null) return '/login';
        return account.role == 'Instructor'
            ? '/instructor/dashboard'
            : '/profiles';
      }
      if (account == null && !openRoutes.contains(path)) {
        return path.startsWith('/instructor/') ? '/instructor/login' : '/login';
      }
      if (account?.role == 'Instructor') {
        if ((!path.startsWith('/instructor/') &&
                !path.startsWith('/courses')) ||
            path == '/instructor/login' ||
            path == '/instructor/register') {
          return '/instructor/dashboard';
        }
      }
      if (account?.role == 'Account Holder' &&
          path == '/instructor/dashboard') {
        return '/profiles';
      }
      if (account != null && (path == '/login' || path == '/register')) {
        return '/profiles';
      }
      return null;
    },
  );
  ref.listen(authControllerProvider, (_, _) => router.refresh());
  ref.onDispose(router.dispose);
  return router;
});
