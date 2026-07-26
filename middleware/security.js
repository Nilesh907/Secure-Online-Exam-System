const crypto = require("crypto");
const fs = require("fs");

function verifySHA(req, res, next) {

    if (!req.file) {
        return next();
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const shaHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");

    console.log("SHA256:", shaHash);

    req.shaHash = shaHash;

    next();
}

module.exports = { verifySHA };