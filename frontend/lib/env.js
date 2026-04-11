const PLACEHOLDER_VALUES = new Set(['', 'value', 'your-value', 'undefined', 'null']);

function cleanEnvValue(value) {
  const normalized = String(value || '').trim();
  const unquoted = normalized.replace(/^['\"]|['\"]$/g, '').trim();
  return PLACEHOLDER_VALUES.has(unquoted.toLowerCase()) ? '' : unquoted;
}

function isLocalhostUrl(value) {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configured = cleanEnvValue(process.env.NEXT_PUBLIC_API_URL);

  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'production' && isLocalhostUrl(configured)) return '/api';
    return configured || '/api';
  }

  return (
    cleanEnvValue(process.env.INTERNAL_API_URL) ||
    configured ||
    (process.env.NODE_ENV === 'production'
      ? `http://127.0.0.1:${process.env.PORT || 10000}/api`
      : 'http://localhost:5000/api')
  );
}

export function getSocketBaseUrl() {
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl.replace(/\/api\/?$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');
}

export function getGoogleClientId() {
  return cleanEnvValue(
    process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID
  );
}
