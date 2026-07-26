const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");
// const { isLoggedIn } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");

const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");


router.get("/login", authController.showLoginForm);
router.get("/register", authController.showRegisterForm);

router.post("/login", loginLimiter, authController.login);
router.post("/register", authController.register);

router.post("/logout", isLoggedIn, authController.logout);

router.get("/history", isLoggedIn, authController.getHistory);

module.exports = router;













