const crypto = require("crypto");
const mysql = require("mysql");
const util = require("util");
const {
    createMessage,
    encrypt,
    readKey,
    readPrivateKey,
    decryptKey,
    generateKey,
    decrypt,
    readMessage
} = require("openpgp");

/**
 * Generates a PGP key pair.
 *
 * @param {string} name - The user name associated with the key.
 * @param {string} email - The user email associated with the key.
 * @param {string} passphrase - The passphrase to protect the private key.
 * @returns {Promise<{ publicKey: string, privateKey: string }>}
 */
async function generateKeyPair(name, email, passphrase) {
    const user = {
        name: name,
        email: email,
    };

    const options = {
        userIDs: [user],
        curve: "ed25519",
        passphrase: passphrase,
    }

    const key = await generateKey(options);

    return {
        publicKey: key.publicKey,
        privateKey: key.privateKey,
    };
}

/**
 * Encrypts a plain text key with a public key using OpenPGP.js.
 *
 * @param {string} plainKey - The plain text key to encrypt.
 * @param {string} publicKey - The public key to encrypt the key with.
 * @returns {Promise<string>} - The encrypted key.
 * @private
 */
async function encryptData(plainKey, publicKey) {
    const publicKeyObj = await readKey({
        armoredKey: publicKey
    });
    const encrypted = await encrypt({
        message: await createMessage({
            text: plainKey
        }),
        encryptionKeys: publicKeyObj,
    });
    return encrypted;
}

/**
 * Decrypts encrypted text with a private key and passphrase using OpenPGP.js.
 * 
 * @param {string} encryptedKey - The encrypted text to decrypt.
 * @param {string} privateKey - The private key to decrypt the text with.
 * @param {string} passphrase - The passphrase to decrypt the text with.
 * @returns  {Promise<string>}
 * @private
 */
async function decryptData(encryptedKey, privateKeyArmored, passphrase) {
    if (!privateKeyArmored) throw new Error("Private Key required to decrypt.")
    const privateKey = await decryptKey({
        privateKey: await readPrivateKey({
            armoredKey: privateKeyArmored
        }),
        passphrase
    });
    const message = await readMessage({
        armoredMessage: encryptedKey
    });
    const {
        data: decrypted,
        signatures
    } = await decrypt({
        message,
        decryptionKeys: privateKey
    });

    return decrypted
}

/**
 * Generates a key based on the provided options.
 *
 * @param {{length: number, charset?: string, MySQL: {host: string, user: string, password: string, database: string, tableName: string, columnName: string}, OpenPGP: {publicKey: string}}} options - The data used to generate the key, according to the user.
 * @param {number} options.length - Length of the key.
 * @param {string} [options.charset] - Optional character set for the key.
 * @param {Object} options.MySQL - MySQL-related options.
 * @returns {Promise<{plainText: string, encrypted: string}>}
 */
async function createKey(options) {
    // Validate input parameters
    if (options.length === undefined || options.length === null) {
        throw new Error("Length is required.");
    }
    if (options.length < 4) {
        throw new Error("Length must be greater than or equal to 4.");
    }

    // Set the default charset if not provided
    const charset = options.charset || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // Generate and return the key
    const key = genKey(charset, options.length);
    const encryptedKey = options.OpenPGP.publicKey ? await encryptData(key, options.OpenPGP.publicKey) : key;
    if (!options.MySQL) return {
        plainText: key,
        encrypted: encryptedKey
    };
    if (options.MySQL) {
        if (!options.MySQL.host) throw new Error("Host is required.");
        if (!options.MySQL.user) throw new Error("User is required.");
        if (!options.MySQL.database) throw new Error("Database is required.");
        if (!options.MySQL.tableName) throw new Error("Table Name is required.");
        if (!options.MySQL.columnName) throw new Error("Column Name is required.");
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
                await query(`INSERT INTO \`${options.MySQL.tableName}\`(\`${options.MySQL.columnName}\`) VALUES ('${encryptedKey}')`);
                return {
                    plainText: key,
                    encrypted: encryptedKey
                };
            }
        } finally {
            await end();
        }
    }
}

/**
 * Receives a license key and checks if it exists within the MySQL db, then verifying it and removing it.
 *
 * @param {{key: string, MySQL: {host: string, user: string, password: string, database: string, tableName: string, columnName: string}, OpenPGP: {privateKey: string, passphrase: string}}} options - The data used to generate the key, according to the user.
 * @param {Object} options.MySQL - MySQL-related options.
 * @returns {Promise<boolean>}
 */
async function verifyKey(options) {
    if (!options.key) throw new Error("License key is required.")
    if (!options.MySQL) throw new Error("MySQL details required.")
    if (!options.OpenPGP) throw new Error("OpenPGP details required.")
    if (!options.MySQL.host) throw new Error("Host is required.");
    if (!options.MySQL.user) throw new Error("User is required.");
    if (!options.MySQL.database) throw new Error("Database is required.");
    if (!options.MySQL.tableName) throw new Error("Table Name is required.");
    if (!options.MySQL.columnName) throw new Error("Column Name is required.");
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
        await connect()
        const result = await query("SELECT `data` FROM `userkeys`")
        if (result.length >= 1) {
            const isIncluded = (await Promise.all(result.map(encrypted => decryptData(encrypted.data, options.OpenPGP.privateKey, options.OpenPGP.passphrase)))).some(decryptedData => decryptedData == options.key);
            if(isIncluded) {
                const matchingIndex = (await Promise.all(result.map(encrypted => decryptData(encrypted.data, options.OpenPGP.privateKey, options.OpenPGP.passphrase)))).findIndex((decryptedData) => decryptedData == options.key);
                const encryptedData = matchingIndex !== -1 ? result[matchingIndex].data : null;
                await query(`DELETE FROM \`userkeys\` WHERE \`${options.MySQL.tableName}\`.${options.MySQL.columnName}='${encryptedData}'`)
            }
            return isIncluded;
        } else {
            return false;
        }
    } catch (ex) {
        throw new Error(ex)
    } finally {
        await end();
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
function genKey(charset, length) {
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
    verifyKey,
    generateKeyPair
};
