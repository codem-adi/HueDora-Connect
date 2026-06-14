const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function addError(errors, field, message) {
  if (!errors[field]) errors[field] = message;
}

export function validateSignupForm(form) {
  const errors = {};
  const name = String(form.name || '').trim();
  const email = String(form.email || '').trim().toLowerCase();
  const password = String(form.password || '');
  const confirmPassword = String(form.confirmPassword || '');
  const phone = String(form.phone || '').trim();

  if (!name) addError(errors, 'name', 'Name is required');
  else if (name.length < 2) addError(errors, 'name', 'Name must be at least 2 characters');
  else if (name.length > 100) addError(errors, 'name', 'Name must be 100 characters or less');

  if (!email) addError(errors, 'email', 'Email is required');
  else if (!EMAIL_PATTERN.test(email)) addError(errors, 'email', 'Enter a valid email address');

  if (!password) addError(errors, 'password', 'Password is required');
  else if (password.length < 6) addError(errors, 'password', 'Password must be at least 6 characters');

  if (!confirmPassword) addError(errors, 'confirmPassword', 'Please confirm your password');
  else if (password !== confirmPassword) addError(errors, 'confirmPassword', 'Passwords do not match');

  if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    addError(errors, 'phone', 'Enter a valid phone number');
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateResetPasswordForm(form) {
  const errors = {};
  const email = String(form.email || '').trim().toLowerCase();
  const otp = String(form.otp || '').trim();
  const password = String(form.password || '');
  const confirmPassword = String(form.confirmPassword || '');

  if (!email) addError(errors, 'email', 'Email is required');
  else if (!EMAIL_PATTERN.test(email)) addError(errors, 'email', 'Enter a valid email address');

  if (!otp) addError(errors, 'otp', 'OTP is required');
  else if (!/^\d{6}$/.test(otp)) addError(errors, 'otp', 'Enter the 6-digit OTP from your email');

  if (!password) addError(errors, 'password', 'Password is required');
  else if (password.length < 6) addError(errors, 'password', 'Password must be at least 6 characters');

  if (!confirmPassword) addError(errors, 'confirmPassword', 'Please confirm your password');
  else if (password !== confirmPassword) addError(errors, 'confirmPassword', 'Passwords do not match');

  return { errors, isValid: Object.keys(errors).length === 0 };
}

export function validateUserForm(form, { requirePassword = false } = {}) {
  const errors = {};
  const name = String(form.name || '').trim();
  const email = String(form.email || '').trim().toLowerCase();
  const password = String(form.password || '');
  const phone = String(form.phone || '').trim();
  const role = String(form.role || '').trim();

  if (!name) addError(errors, 'name', 'Name is required');
  else if (name.length < 2) addError(errors, 'name', 'Name must be at least 2 characters');
  else if (name.length > 100) addError(errors, 'name', 'Name must be 100 characters or less');

  if (!email) addError(errors, 'email', 'Email is required');
  else if (!EMAIL_PATTERN.test(email)) addError(errors, 'email', 'Enter a valid email address');

  if (requirePassword || password) {
    if (!password) addError(errors, 'password', 'Password is required');
    else if (password.length < 6) addError(errors, 'password', 'Password must be at least 6 characters');
  }

  if (!role) addError(errors, 'role', 'Role is required');

  if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    addError(errors, 'phone', 'Enter a valid phone number');
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}
