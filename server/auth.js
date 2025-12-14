/**
 * Authentication module for SeWenta/Tâb server
 * Handles user registration and password verification
 */

const crypto = require('crypto');
const data = require('./data');

/**
 * Hash password using MD5
 * @param {string} password
 * @returns {string}
 */
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

/**
 * Register a new user or verify existing user
 * @param {string} nick
 * @param {string} password
 * @returns {{ success: boolean, error?: string }}
 */
function register(nick, password) {
    if (!nick || !password) {
        return { success: false, error: 'Nick and password are required' };
    }

    const hash = hashPassword(password);
    const existingHash = data.getUser(nick);

    if (existingHash) {
        // User exists - verify password
        if (existingHash !== hash) {
            return { success: false, error: 'User registered with a different password' };
        }
        return { success: true };
    }

    // New user - register
    data.setUser(nick, hash);
    return { success: true };
}

/**
 * Verify user credentials
 * @param {string} nick
 * @param {string} password
 * @returns {boolean}
 */
function verifyUser(nick, password) {
    if (!nick || !password) return false;

    const hash = hashPassword(password);
    const storedHash = data.getUser(nick);

    return storedHash === hash;
}

/**
 * Generate game ID using MD5
 * @param {string} value
 * @returns {string}
 */
function generateGameId(value) {
    return crypto.createHash('md5').update(value).digest('hex');
}

module.exports = {
    hashPassword,
    register,
    verifyUser,
    generateGameId
};
