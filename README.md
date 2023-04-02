# <a href="https://www.npmjs.com/package/license-keys">License Keys NPM-Package</a>

![npm](https://img.shields.io/npm/v/license-keys)
![npm](https://img.shields.io/npm/dt/license-keys)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/aaronmansfield5/License-Keys-NPM-Package)
![GitHub issues](https://img.shields.io/github/issues/aaronmansfield5/License-Keys-NPM-Package)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aaronmansfield5/License-Keys-NPM-Package)
![GitHub stars](https://img.shields.io/github/stars/aaronmansfield5/License-Keys-NPM-Package)

**license-keys** is an NPM package developed by [aaronmansfield5](https://github.com/aaronmansfield5) that allows you to generate unique, random license keys for your applications or services. You can store these keys in a MySQL database.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install `license-keys`.

```bash
npm install license-keys
```
## Usage
```javascript
const { createKey } = require("license-keys");

(async () => {
  try {
    const options = {
      length: 4,
      charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      MySQL: {
        host: "localhost",
        user: "root",
        password: "password",
        database: "myDatabase",
        tableName: "myTable",
        columnName: "myColumn",
      }
    };

    const key = await createKey(options);
    console.log("Generated key:", key);
  } catch (error) {
    console.error("Error generating key:", error);
  }
})();
```
## API
### createKey(options)
Generates a unique license key based on the provided options.

- **options** {Object}
  - **length** {number} - Length of each segment in the generated key (must be greater than or equal to 4).
  - **charset** {string} (optional) - Character set to use when generating the key (default: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`).
  - **MySQL** {Object} (optional) - MySQL-related options for storing keys.
    - **host** {string} - MySQL server host.
    - **user** {string} - MySQL server user.
    - **password** {string} - MySQL server password.
    - **database** {string} - MySQL database name.
    - **tableName** {string} - MySQL table name.
    - **columnName** {string} - MySQL column name.
  - **JSON** {Object} (optional) - JSON file storage options.
    - **path** {string} - File path for JSON storage (e.g. './data/userkeys.json').
    
Returns a `Promise` that resolves to the generated key.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Todo
- Add functionality for saving keys in JSON
- Add license verification
- Add encryption for key generation and verification
