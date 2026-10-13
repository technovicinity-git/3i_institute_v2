// Reads the backend's error envelope: { error: { code, message, details } }.

interface ApiErrorShape {
  response?: { data?: { error?: { code?: string; message?: string } } };
}

export function apiErrorCode(error: unknown): string | undefined {
  return (error as ApiErrorShape | null)?.response?.data?.error?.code;
}

export function apiErrorMessage(error: unknown): string | undefined {
  return (error as ApiErrorShape | null)?.response?.data?.error?.message;
}
