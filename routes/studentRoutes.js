const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/studentControllers");

const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");

// 🔥 Apply auth FIRST (good)
router.use(isLoggedIn);

// ================= ADMIN ONLY =================
router.get("/new", checkRole(["Admin"]), studentController.newForm);
router.post("/", checkRole(["Admin"]), studentController.createStudent);
router.delete("/:id", checkRole(["Admin"]), studentController.deleteStudent);

// ================= ADMIN + TEACHER =================
router.get("/", checkRole(["Admin", "Teacher"]), studentController.index);
router.get("/:id", checkRole(["Admin", "Teacher"]), studentController.showStudent);
router.get("/:id/edit", checkRole(["Admin"]), studentController.editForm);
router.put("/:id", checkRole(["Admin"]), studentController.updateStudent);

// ================= STUDENT PAPER ACCESS =================
// REMOVED: GET /paper/:paperId (studentController.getPaper).
// This duplicated exam-paper decryption outside the protected
// /exam/:paperId/* flow (no token/session/device/watermark checks,
// and used the wrong decryption key/signature). Students must access
// exam papers exclusively through examController.getExam, which
// enforces all of those checks correctly. See security audit P0-4.

module.exports = router;





















