const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Paper = require("../models/Paper");

module.exports.index = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("user");
    res.render("teacher/index.ejs", { teachers });
  } catch (err) {
    console.log("err fetching in teacher", err);
  }
};

module.exports.newForm = async (req, res) => {
  try {
    const users = await User.find({ role: "Teacher" });
    res.render("teacher/new.ejs", { users });
  } catch (err) {
    console.log("err fetching in new form", err);
  }
};

module.exports.createTeacher = async (req, res) => {
  try {
    const teacher = new Teacher(req.body.teacher);
    await teacher.save();
    res.redirect(`/teachers/${teacher._id}`);
  } catch (err) {
    console.log("err fetching in create teacher", err);
  }
};

// Only Admin, or the teacher viewing/editing their own record. Prevents
// one Teacher from reading/editing/deleting a colleague's account.
function isSelfOrAdmin(req, teacher) {
  if (req.session.role === "Admin") return true;
  return String(teacher.user?._id || teacher.user) === String(req.session.userId);
}

module.exports.showTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("user");
    if (!teacher) return res.status(404).send("Teacher not found");
    if (!isSelfOrAdmin(req, teacher)) {
      return res.status(403).send("Not authorized");
    }
    res.render("teacher/show.ejs", { teacher });
  } catch (err) {
    console.log("err fetching in show teacher", err);  
  }
};

module.exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).populate("user");
    if (!teacher) return res.status(404).send("Teacher not found");
    if (!isSelfOrAdmin(req, teacher)) {
      return res.status(403).send("Not authorized");
    }
    res.render("teacher/edit.ejs", { teacher });
  } catch (err) {
    console.log("err fetching in edit form", err);
  }
};

module.exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).populate("user");
    if (!teacher) return res.status(404).send("Teacher not found");
    if (!isSelfOrAdmin(req, teacher)) {
      return res.status(403).send("Not authorized");
    }
    await Teacher.findByIdAndUpdate(id, req.body.teacher);
    res.redirect("/teachers");
  } catch (err) {
    console.log("err fetching in update", err);
  }
};

module.exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("user");
    if (!teacher) return res.status(404).send("Teacher not found");
    if (!isSelfOrAdmin(req, teacher)) {
      return res.status(403).send("Not authorized");
    }
    await Teacher.findByIdAndDelete(req.params.id);
    res.redirect("/teachers");
  } catch (err) {
    console.log("err fetching in delete", err);
  }
};



module.exports.getMyCorrectionPapers = async (req, res) => {
  try {
    const papers = await Paper.find({
      uploadedBy: req.session.userId,   
      status: "NEEDS_CORRECTION"
    });

    res.render("teacher/correctionPapers", { papers });

  } catch (err) {
    console.log("Error fetching correction papers:", err);
    res.send("Error loading correction papers");
  }
};




































