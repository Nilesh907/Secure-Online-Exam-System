const express=require("express")
const router=express.Router()
const reviewerController=require("../Controllers/reviewerController")


const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");


router.use(isLoggedIn);
router.use(checkRole(["Reviewer"]));


// IMPORTANT: put specific routes FIRST



// THEN generic routes
router.get("/", reviewerController.index);
router.get("/new", reviewerController.newForm);
router.post("/", reviewerController.createReviewer);

router.get("/:id/edit", reviewerController.editForm);
router.put("/:id", reviewerController.updateReviewer);
router.delete("/:id", reviewerController.deleteReviewer);
router.get("/:id", reviewerController.showReviewer);






module.exports=router




