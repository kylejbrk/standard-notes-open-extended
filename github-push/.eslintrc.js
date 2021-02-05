module.exports = {
  "env": {
    "browser": true,
    "amd": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": [2, 2],
    "no-var": "error",
    "keyword-spacing": "error"
  },
  "globals": {
    "angular": true,
    "ComponentRelay": true,
    "GitHub": true
  }
};
