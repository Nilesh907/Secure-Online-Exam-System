const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController.js");

const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");

router.get("/", isLoggedIn, checkRole(["Admin"]), userController.index);

router.get("/new",isLoggedIn, checkRole(["Admin"]), userController.newForm);

router.post("/",isLoggedIn, checkRole(["Admin"]), userController.createUser);

router.get("/:id",isLoggedIn, checkRole(["Admin"]), userController.showUser);

router.get("/:id/edit", checkRole(["Admin"]), userController.editForm);

router.put("/:id",isLoggedIn, checkRole(["Admin"]), userController.updateUser);

router.delete("/:id",isLoggedIn, checkRole(["Admin"]), userController.deleteUser);

module.exports = router;

































































