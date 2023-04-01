const crypto = require("crypto");

/**
 * Generates a key based on the provided options.
 *
 * @param {{length: number, charset?: string, type: 'SQL' | 'JSON'}} options - The data used to generate the key, according to the user.
 * @returns {string}
 */
function createKey(options) {
    // Validate input parameters
    if (options.length === undefined || options.length === null) {
        throw new Error("Length must be required.");
    }
    if (options.length < 4) {
        throw new Error("Length must be greater than or equal to 4.");
    }
    /*if (!options.type) {
        throw new Error("Type must be included.");
    }*/

    // Set the default charset if not provided
    const charset = options.charset || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // Generate and return the key
    return generateKey(charset, options.length);
}

/**
 * Generates a key using the provided charset and length.
 *
 * @param {string} charset - The character set to use when generating the key.
 * @param {number} length - The length of each segment in the generated key.
 * @returns {string}
 * @private
 */
function generateKey(charset, length) {
    const segmentCount = 4; // Number of segments in the generated key
    const keyLength = length * segmentCount + segmentCount - 1;

    // Allocate a buffer to hold random values
    const buffer = Buffer.allocUnsafe(keyLength * 4);

    // Fill the buffer with random values
    crypto.randomFillSync(buffer, 0, keyLength * 4);

    const key = new Array(keyLength);
    let randIdx = 0;

    // Use a for loop to iterate through the key length
    for (let i = 0; i < keyLength; i++) {
        // Add a separator between segments
        if (i % (length + 1) === length) {
            key[i] = "-";
        } else {
            // Add a random character from the charset
            key[i] = charset[buffer.readUInt32LE(randIdx) % charset.length];
            randIdx += 4;
        }
    }

    return key.join("");
}

module.exports = {
    createKey
};
