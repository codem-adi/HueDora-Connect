export function clearAuthSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export function handleUnauthorized() {
  clearAuthSession();
  if (unauthorizedHandler) {
    unauthorizedHandler();
    return;
  }
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export function isAuthLoginRequest(config) {
  const url = config?.url || '';
  return url.includes('/auth/login');
}

export function isUnauthorizedResponse(error) {
  const status = error.response?.status;
  const message = String(error.response?.data?.message || '').toLowerCase();

  return (
    status === 401
    || message.includes('authentication required')
    || message.includes('invalid token')
    || message.includes('token expired')
    || message.includes('jwt expired')
    || message.includes('unauthenticated')
  );
}
