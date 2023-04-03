# <a href="https://www.npmjs.com/package/license-keys">License Keys NPM-Package</a>

![npm](https://img.shields.io/npm/v/license-keys)
![npm](https://img.shields.io/npm/dt/license-keys)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/aaronmansfield5/License-Keys-NPM-Package)
![GitHub issues](https://img.shields.io/github/issues/aaronmansfield5/License-Keys-NPM-Package)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aaronmansfield5/License-Keys-NPM-Package)
![GitHub stars](https://img.shields.io/github/stars/aaronmansfield5/License-Keys-NPM-Package)

`License Keys NPM-Package` is a Node.js package that allows you to generate, encrypt, and verify license keys using MySQL and OpenPGP.js.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [createKey](#createkey)
  - [verifyKey](#verifykey)
  - [generateKeyPair](#generatekeypair)
- [Contributing](#contributing)

## Installation

```bash
npm install license-keys
```

## Usage

```javascript
const { createKey, verifyKey, generateKeyPair } = require("license-keys");

// Generate a PGP key pair
(async () => {
    const keyPair = await generateKeyPair("John Doe", "john.doe@example.com", "secure-passphrase");
    console.log(keyPair);
})();

// Generate a license key and store it in a MySQL database
(async () => {
    const options = {
        length: 4,
        charset: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        MySQL: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "license_keys",
            tableName: "user_keys",
            columnName: "license_key"
        },
        OpenPGP: {
            publicKey: "-----BEGIN PGP PUBLIC KEY BLOCK----- ... -----END PGP PUBLIC KEY BLOCK-----"
        }
    };

    const key = await createKey(options);
    console.log(key);
})();

// Verify a license key
(async () => {
    const options = {
        key: "ABC1-DEF2-GHI3-JKL4",
        MySQL: {
            host: "localhost",
            user: "root",
            password: "password",
            database: "license_keys",
            tableName: "user_keys",
            columnName: "license_key"
        },
        OpenPGP: {
            privateKey: "-----BEGIN PGP PRIVATE KEY BLOCK----- ... -----END PGP PRIVATE KEY BLOCK-----",
            passphrase: "secure-passphrase"
        }
    };

    const result = await verifyKey(options);
    console.log(result);
})();
```

## API

### createKey

Generates a license key based on the provided options, encrypts it with a public key (if provided), and stores it in the MySQL database.

```javascript
createKey(options)
```

Parameters
- `options`: (Object)
  - `length`: (number) The length of each segment in the generated key.
  - `charset`: (string, optional) The character set to use when generating the key.
  - `MySQL`: (Object) MySQL-related options.
    - `host`: (string) MySQL server host.
    - `user`: (string) MySQL user.
    - `password`: (string) MySQL password.
    - `database`: (string) MySQL database.
    - `tableName`: (string) MySQL table name.
    - `columnName`: (string) MySQL table column name.
  - `OpenPGP`: (Object)
    - `publicKey`: (string) PGP public key.

#### Returns

- A promise that resolves to an object containing:
  - `plainText`: (string) The generated plain text key.
  - `encrypted`: (string) The encrypted key (if a public key is provided).

### verifyKey

Receives a license key and checks if it exists within the MySQL database, then verifies it and removes it.

```javascript
verifyKey(options)
```

Parameters
- `options`: (Object)
  - `key`: (string) The license key to verify.
  - `MySQL`: (Object) MySQL-related options.
    - `host`: (string) MySQL server host.
    - `user`: (string) MySQL user.
    - `password`: (string) MySQL password.
    - `database`: (string) MySQL database.
    - `tableName`: (string) MySQL table name containing the license keys.
    - `columnName`: (string) MySQL table column name containing the license keys.
  - `OpenPGP`: (Object) OpenPGP-related options.
    - `privateKey`: (string) The private key used for decrypting the license key.
    - `passphrase`: (string) The passphrase used for decrypting the license key.

#### Returns

- `Promise<boolean>`: A promise that resolves to a boolean indicating if the license key was verified and removed from the MySQL database.

### generateKeyPair

Generates a PGP key pair.

```javascript
generateKeyPair(name, email, passphrase)
```

Parameters
- `name`: (string) The user name associated with the key.
the key pair.
- `email`: (string) The email address associated with the key pair.
- `passphrase`: (string) The passphrase to use for protecting the private key.

#### Returns

- `Promise<{publicKey: string, privateKey: string}>`: A promise that resolves to an object containing the generated public and private keys as strings.

## Contributing

Contributions are welcome! If you have any suggestions, improvements, or issues, feel free to open a pull request or create an issue on the GitHub repository.
