const crypto = require("crypto");
const mysql = require("mysql");
const util = require("util");

/**
 * Generates a key based on the provided options.
 *
 * @param {{length: number, charset?: string, MySQL: {host: string, user: string, password: string, database: string, tableName: string, columnName: string}, JSON: {path: string}}} options - The data used to generate the key, according to the user.
 * @param {number} options.length - Length of the key.
 * @param {string} [options.charset] - Optional character set for the key.
 * @param {Object} options.MySQL - MySQL-related options.
 * @param {Object} options.JSON - File path for JSON storage (etc './data/userkeys.json').
 * @returns {Promise<string>}
 */
async function createKey(options) {
    // Validate input parameters
    if (options.length === undefined || options.length === null) {
        throw new Error("Length must be required.");
    }
    if (options.length < 4) {
        throw new Error("Length must be greater than or equal to 4.");
    }

    // Set the default charset if not provided
    const charset = options.charset || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // Generate and return the key
    const key = generateKey(charset, options.length);
    if (!options.MySQL/* && !options.JSON*/) return key;
    if (options.MySQL) {
        if (!options.MySQL.host) throw new Error("Host must be required.");
        if (!options.MySQL.user) throw new Error("User must be required.");
        if (!options.MySQL.database) throw new Error("Database must be required.");
        if (!options.MySQL.tableName) throw new Error("Table Name must be required.");
        if (!options.MySQL.columnName) throw new Error("Column Name must be required.");
        const con = mysql.createConnection({
            host: options.MySQL.host,
            user: options.MySQL.user,
            password: options.MySQL.password || '',
            database: options.MySQL.database,
        });

        const query = util.promisify(con.query).bind(con);
        const connect = util.promisify(con.connect).bind(con);
        const end = util.promisify(con.end).bind(con);

        try {
            await connect();
            const result = await query(`SELECT * FROM \`${options.MySQL.tableName}\` WHERE \`${options.MySQL.tableName}\`.${options.MySQL.columnName}='${key}';`);
            if (result.length >= 1) {
                return createKey(options);
            } else {
                await query(`INSERT INTO \`${options.MySQL.tableName}\`(\`${options.MySQL.columnName}\`) VALUES ('${key}')`);
                return key;
            }
        } finally {
            await end();
        }
    }
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
    const charsetLength = charset.length;

    const key = new Array(keyLength);

    // Use a for loop to iterate through the key length
    for (let i = 0; i < keyLength; i++) {
        // Add a separator between segments
        if (i % (length + 1) === length) {
            key[i] = "-";
        } else {
            // Add a random character from the charset
            const randValue = crypto.randomInt(charsetLength);
            key[i] = charset[randValue];
        }
    }

    return key.join("");
}

module.exports = {
    createKey,
};
