# <a href="https://www.npmjs.com/package/license-keys">License Keys NPM-Package</a>

![npm](https://img.shields.io/npm/v/license-keys)
![npm](https://img.shields.io/npm/dt/license-keys)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/aaronmansfield5/License-Keys-NPM-Package)
![GitHub issues](https://img.shields.io/github/issues/aaronmansfield5/License-Keys-NPM-Package)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aaronmansfield5/License-Keys-NPM-Package)
![GitHub stars](https://img.shields.io/github/stars/aaronmansfield5/License-Keys-NPM-Package)

A simple and efficient library for generating license keys, developed by [aaronmansfield5](https://github.com/aaronmansfield5).

## Installation

To install the `license-keys` package, simply run:

```bash
npm install license-keys
```
## Usage
```js
const { createKey } = require("license-keys");

const options = {
  length: 4,
  charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  type: "SQL"
};

const key = createKey(options);
console.log(key);
```
## Options
- length: The length of each segment in the generated key (required, must be greater than or equal to 4)
- charset: The character set to use when generating the key (optional, default: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
- type: The type of the key, either 'SQL' or 'JSON' (optional, not yet in use, check Todo)

## Todo
- Add functionality for saving keys
- Add license verification
- Add encryption for key generation and verification
