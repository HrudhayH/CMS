const crypto = require('crypto');

/**
 * Generate a random password.
 * @param {number} length - Password length (default 12)
 * @returns {string} Random password with uppercase, lowercase, digits, and special chars
 */
function generatePassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '@#$%&*!?';
  const allChars = uppercase + lowercase + digits + special;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[crypto.randomInt(uppercase.length)];
  password += lowercase[crypto.randomInt(lowercase.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle the password
  const shuffled = password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');

  return shuffled;
}

module.exports = generatePassword;
