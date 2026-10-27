// Input validation utilities based on project requirements

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]/;
const uppercaseRegex = /[A-Z]/;

function validateName(name) {
  if (typeof name !== 'string') {
    return { valid: false, message: 'Name must be text.' };
  }
  const clean = name.trim();
  if (clean.length < 20 || clean.length > 60) {
    return {
      valid: false,
      message: `Name must be between 20 and 60 characters (currently ${clean.length}).`,
    };
  }
  return { valid: true, value: clean };
}

function validateAddress(address) {
  if (typeof address !== 'string') {
    return { valid: false, message: 'Address must be text.' };
  }
  const clean = address.trim();
  if (!clean) {
    return { valid: false, message: 'Address is required.' };
  }
  if (clean.length > 400) {
    return {
      valid: false,
      message: `Address cannot exceed 400 characters (currently ${clean.length}).`,
    };
  }
  return { valid: true, value: clean };
}

function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, message: 'Email must be text.' };
  }
  const clean = email.trim().toLowerCase();
  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, value: clean };
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be text.' };
  }
  if (password.length < 8 || password.length > 16) {
    return {
      valid: false,
      message: `Password must be 8 to 16 characters long (currently ${password.length}).`,
    };
  }
  if (!uppercaseRegex.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter.',
    };
  }
  if (!specialCharsRegex.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character (!@#$%^&* etc.).',
    };
  }
  return { valid: true };
}

function validateRating(rating) {
  const parsed = Number(rating);
  if (!Number.isInteger(parsed)) {
    return { valid: false, message: 'Rating must be a whole number.' };
  }
  if (parsed < 1 || parsed > 5) {
    return { valid: false, message: 'Rating must be between 1 and 5.' };
  }
  return { valid: true, value: parsed };
}

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
};
