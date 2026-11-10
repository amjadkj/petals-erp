/**
 * Sanitizes metadata for audit logs.
 * Recursively redacts passwords, tokens, secrets, and full clinical text.
 */
export function sanitizeAuditMetadata(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeAuditMetadata(item));
  }

  const SENSITIVE_KEYS = new Set([
    'password',
    'passwordconfirm',
    'confirmpassword',
    'newpassword',
    'oldpassword',
    'token',
    'refreshtoken',
    'accesstoken',
    'twofactorsecret',
    'twofactorcode',
    'secret',
    'otp',
    'authorization',
  ]);

  const CLINICAL_TEXT_KEYS = new Set([
    'observation',
    'summary',
    'clinicalnotes',
    'notes',
    'diagnosis',
    'symptoms',
    'recommendations',
  ]);

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (CLINICAL_TEXT_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED_CLINICAL_TEXT]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

