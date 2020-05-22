module.exports = {
    "env": {
        "node": true,
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "prettier",
        "plugin:prettier/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module",
        "allowImportExportEverywhere": false,
        "ecmaFeatures": {
            "globalReturn": false,
        },
        "babelOptions": {
            "configFile": "path/to/config.js",
        },
        "ecmaVersion": 2018
    },
    "plugins": [
        "prettier"
    ],
    "rules": {
        "prettier/prettier": "error",
    }
};
