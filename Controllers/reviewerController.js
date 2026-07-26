const Reviewer = require("../models/Reviewer");
const User = require("../models/User");
const Paper = require("../models/Paper");

module.exports.index = async (req, res) => {
  try {
    const reviewers = await Reviewer.find().populate("user");

    
    const papers = await Paper.find({ status: "UNDER_REVIEW" });

    res.render("reviewer/index.ejs", { reviewers, papers });

  } catch (err) {
    console.log("err fetching in reviewer", err);
  }
};

module.exports.newForm = async (req, res) => {
  try {
    const users = await User.find({ role: "Reviewer" });
    res.render("reviewer/new.ejs", { users });
  } catch (err) {
    console.log("err fetching in new form", err);
  }
};

module.exports.createReviewer = async (req, res) => {
  try {
    const reviewer = new Reviewer(req.body.reviewer);
    await reviewer.save();
    res.redirect(`/reviewers/${reviewer._id}`);
  } catch (err) {
    console.log("err fetching in create", err);
  }
};

module.exports.showReviewer = async (req, res) => {
  try {
    const reviewer = await Reviewer.findById(req.params.id).populate("user");
    res.render("reviewer/show.ejs", { reviewer });
  } catch (err) {
    console.log("err fetching in show", err);
  }
};

module.exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const reviewer = await Reviewer.findById(id);
    res.render("reviewer/edit.ejs", { reviewer });
  } catch (err) {
    console.log("err fetching in edit", err);
  }
};

module.exports.updateReviewer = async (req, res) => {
  try {
    const { id } = req.params;

    await Reviewer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    res.redirect(`/reviewers/${id}`);
  } catch (err) {
    console.log("err fetching in update", err);
  }
};

module.exports.deleteReviewer = async (req, res) => {
  try {
    await Reviewer.findByIdAndDelete(req.params.id);
    res.redirect("/reviewers");
  } catch (err) {
    console.log("err fetching in delete");
  }
};












































































