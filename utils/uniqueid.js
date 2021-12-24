/**
 *
 * @returns a unique ID for a user.
 */

module.exports = function() {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
}