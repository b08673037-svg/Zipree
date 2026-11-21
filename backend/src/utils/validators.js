// Small, dependency-free validators.
// Each returns null if valid, or an error message string if invalid.
// Keeps validation logic out of controllers and prevents a heavy library.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value) {
  if (typeof value !== "string") return "Name is required.";
  const trimmed = value.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 60) return "Name must be at most 60 characters.";
  return null;
}

export function validateEmail(value) {
  if (typeof value !== "string") return "Email is required.";
  const trimmed = value.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return "Please provide a valid email address.";
  return null;
}

export function validatePassword(value) {
  if (typeof value !== "string") return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (value.length > 72) return "Password must be at most 72 characters.";
  if (!/[a-z]/.test(value)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(value)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(value)) return "Password must contain a number.";
  if (!/[^a-zA-Z0-9]/.test(value)) return "Password must contain a special character.";
  return null;
}

export function validatePhone(value) {
  if (value === undefined || value === null || value === "") return null; // optional
  if (typeof value !== "string") return "Phone must be a string.";
  const cleaned = value.replace(/[\s\-()+]/g, "");
  if (!/^\d{7,15}$/.test(cleaned)) return "Please provide a valid phone number.";
  return null;
}

// Runs a map of { field: validatorFn } against a body and returns the first error,
// or null if all pass. Beginner-friendly: one call, one error message out.
export function runValidators(body, rules) {
  for (const [field, fn] of Object.entries(rules)) {
    const error = fn(body[field]);
    if (error) return error;
  }
  return null;
}