const express = require("express");
const router = express.Router();

const adminController = require("../Controllers/adminController");
const upload = require("../middleware/upload");
const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");
const examAccess = require("../middleware/examAccess");
const examController = require("../Controllers/examController");
const paperController = require("../Controllers/paperController");
const { verifySHA } = require("../middleware/security");

// ====================== LIST ALL PAPERS ======================
router.get("/", isLoggedIn, paperController.index);

// ====================== NEW PAPER ======================
router.get("/new", isLoggedIn, checkRole(["Teacher"]), paperController.newForm);
router.post("/:id/submit", isLoggedIn, checkRole(["Teacher"]), paperController.submitPaper);

router.post(
  "/",
  isLoggedIn,
  checkRole(["Teacher"]),
  upload.single("paper"),
  verifySHA,
  paperController.createPaper
);


// Reviewer approves

router.post("/:id/approve",
  isLoggedIn, 
  checkRole(["Reviewer"]), 
  paperController.approvePaper);

router.post("/:id/reject", 
  isLoggedIn,
  checkRole(["Reviewer"]), 
  paperController.sendForCorrection);

router.post(
  "/:id/resubmit",
  isLoggedIn,
  checkRole(["Teacher"]),
  paperController.resubmitPaper
);


// ====================== VIEW PAPER ======================
router.get("/:id", isLoggedIn, paperController.showPaper);



router.get(
    "/:id/success",
    paperController.uploadSuccess
);


router.get("/:id/view",
  isLoggedIn,
  paperController.viewPaper
);

// ====================== EDIT / UPDATE / DELETE ======================
router.get(
  "/:id/edit",
  isLoggedIn,
  checkRole(["Teacher"]),
  paperController.editForm
);

router.put(
  "/:id",
  isLoggedIn,
  checkRole(["Teacher"]),
  paperController.updatePaper
);

router.delete(
  "/:id",
  isLoggedIn,
  checkRole(["Teacher"]),
  paperController.deletePaper
);

module.exports = router;