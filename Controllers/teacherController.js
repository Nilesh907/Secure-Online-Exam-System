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

module.exports.showTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate("user");
    res.render("teacher/show.ejs", { teacher });
  } catch (err) {
    console.log("err fetching in show teacher", err);  
  }
};

module.exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);
    res.render("teacher/edit.ejs", { teacher });
  } catch (err) {
    console.log("err fetching in edit form", err);
  }
};

module.exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await Teacher.findByIdAndUpdate(id, req.body.teacher);
    res.redirect("/teachers");
  } catch (err) {
    console.log("err fetching in update", err);
  }
};

module.exports.deleteTeacher = async (req, res) => {
  try {
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




































