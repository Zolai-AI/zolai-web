// Type guard for API success/error union responses
export function isSuccess<T>(response: { success: boolean; data?: T; error?: unknown } | undefined): response is { success: true; data: T } {
  return response?.success === true;
}
