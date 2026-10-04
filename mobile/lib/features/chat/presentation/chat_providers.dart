import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/presentation/providers/auth_providers.dart';
import '../data/chat_repository.dart';

final chatRepositoryProvider = Provider(
  (ref) => ChatRepository(ref.watch(apiClientProvider)),
);
