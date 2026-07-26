const crypto = require("crypto");

function deviceFingerprint(req, res, next) {

    const userAgent =
        req.headers["user-agent"] || "";

    const deviceId = crypto
        .createHash("sha256")
        .update(userAgent)
        .digest("hex");

    req.deviceId = deviceId;

    next();
}

module.exports = deviceFingerprint;

