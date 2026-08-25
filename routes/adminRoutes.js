const express = require("express");
const router = express.Router();

const adminController = require("../Controllers/adminController");

function ensureAdmin(req, res, next) {
  if (!req.session || req.session.role !== "Admin") {
    return res.status(403).send("Only admin allowed");
  }
  next();
}

// ====================== SCHEDULE EXAM ======================


router.get(
  "/papers/:id/schedule",
  ensureAdmin,
  async (req, res) => {

    const Paper = require("../models/Paper");

    const paper = await Paper.findById(req.params.id);

    res.render("admin/schedule", { paper });

  }
);


router.post(
  "/papers/:id/schedule",
  ensureAdmin,
  adminController.scheduleExam
);

// ====================== ADMIN AI DASHBOARD ======================

router.get(
    "/dashboard",
    ensureAdmin,
    adminController.dashboard
);

router.get(
    "/report/:id",
    ensureAdmin,
    adminController.viewReport
);


module.exports = router;
