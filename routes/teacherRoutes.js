const express=require("express")
const router=express.Router()
const teacherController=require("../Controllers/teacherController")


const { isLoggedIn, checkRole } = require("../middleware/authMiddleware");


router.use(isLoggedIn);
router.use(checkRole(["Teacher"]));


router.get("/",teacherController.index)
router.get("/new",teacherController.newForm)
router.post("/",teacherController.createTeacher)
router.get("/:id",teacherController.showTeacher)
router.get("/:id/edit",teacherController.editForm)
router.put("/:id",teacherController.updateTeacher)
router.delete("/:id",teacherController.deleteTeacher)
router.get("/corrections", 
    isLoggedIn, 
    checkRole(["Teacher"]), 
    teacherController.getMyCorrectionPapers);


module.exports=router;















































