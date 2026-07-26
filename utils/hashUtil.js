const crypto = require("crypto");

function generateHash(fileBuffer) {
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

module.exports = { generateHash };