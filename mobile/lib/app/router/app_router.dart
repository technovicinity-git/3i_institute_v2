import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/pages/check_email_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/pages/verify_email_page.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../pages/startup_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final router = GoRouter(
    initialLocation: '/startup',
    routes: [
      GoRoute(path: '/startup', builder: (context, state) => const StartupPage()),
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterPage()),
      GoRoute(
        path: '/check-email',
        builder: (context, state) => CheckEmailPage(email: state.uri.queryParameters['email'] ?? ''),
      ),
      GoRoute(path: '/forgot-password', builder: (context, state) => const ForgotPasswordPage()),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) => ResetPasswordPage(token: state.uri.queryParameters['token'] ?? ''),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) => VerifyEmailPage(token: state.uri.queryParameters['token']),
      ),
      GoRoute(path: '/home', builder: (context, state) => const HomePage()),
    ],
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      final path = state.uri.path;
      final account = auth.asData?.value;
      const openRoutes = {
        '/login',
        '/register',
        '/check-email',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
      };

      if (auth.isLoading) return path == '/startup' ? null : '/startup';
      if (path == '/startup') return account == null ? '/login' : '/home';
      if (account == null && !openRoutes.contains(path)) return '/login';
      if (account != null && (path == '/login' || path == '/register')) return '/home';
      return null;
    },
  );
  ref.listen(authControllerProvider, (_, __) => router.refresh());
  ref.onDispose(router.dispose);
  return router;
});
