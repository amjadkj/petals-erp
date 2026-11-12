/** Read the x-csrf-token from document.cookie */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)x-csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
