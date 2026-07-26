const crypto = require("crypto");

function generateToken() {
  return crypto.randomInt(100000, 999999).toString();
}

module.exports = generateToken;

