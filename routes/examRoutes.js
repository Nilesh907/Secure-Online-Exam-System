const express = require("express");
const router = express.Router();
const examController = require("../Controllers/examController");
const { examLimiter } = require("../middleware/rateLimiter");
const examSessionMiddleware = require("../middleware/examSessionMiddleware");

const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");

const examViolationController = require("../Controllers/examViolationController");



// unified auth middleware
const requireStudent = [
    isLoggedIn,
    checkRole(["Student"])
];

/* ================= TOKEN ================= */
router.get("/:paperId/token", ...requireStudent, examController.getTokenPage);
router.post("/:paperId/generate-token", ...requireStudent, examController.generateToken);

/* ================= START ================= */
router.post("/:paperId/start", ...requireStudent, examLimiter, examController.startExam);

/* ================= OPEN PAPER ================= */

router.post(
    "/violation/:paperId",
    ...requireStudent,
    examViolationController
);

router.get(
    "/:paperId/attempt",
    ...requireStudent,
    examSessionMiddleware,
    examController.renderAttemptPage
);

router.get(
    "/:paperId/stream",
    ...requireStudent,
    examSessionMiddleware,
    examController.getExam
);

/* ================= SUBMIT ================= */
router.post(
    "/:paperId/submit",
    ...requireStudent,
    examSessionMiddleware,
    examController.submitExam
);

module.exports = router;
