const rateLimit = require("express-rate-limit");


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // max 200 requests
    message: "Too many requests, try again later"
});


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // only 5 attempts allowed
    message: "Too many login attempts, try later"
});


const examLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // only 5 attempts
    message: "Too many exam attempts, try later"
});

module.exports = {
    apiLimiter,
    loginLimiter,
    examLimiter
};