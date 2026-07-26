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

// ================= STUDENT PAPER ACCESS (MOVE TO BOTTOM) =================
// IMPORTANT: keep wildcard routes LAST
router.get(
    "/paper/:paperId",
    checkRole(["Student"]),
    studentController.getPaper
);

module.exports = router;





















