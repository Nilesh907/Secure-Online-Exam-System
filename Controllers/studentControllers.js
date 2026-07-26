const Student = require("../models/Student");
const User = require("../models/User");
const Paper = require("../models/Paper");
const path = require("path");
const fs = require("fs");
const { decryptFile } = require("../services/encryptionService");

/* ================= INDEX ================= */
module.exports.index = async (req, res) => {
    try {
        const students = await Student.find().populate("user");
        res.render("student/index.ejs", { students, session: req.session });
    } catch (err) {
        console.log("err fetching in index", err);
    }
};

/* ================= NEW FORM ================= */
module.exports.newForm = async (req, res) => {
    try {
        const users = await User.find({ role: "Student" });
        res.render("student/new.ejs", { users });
    } catch (err) {
        console.log("err fetching in new", err);
    }
};

/* ================= CREATE ================= */
module.exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body.student);
        await student.save();
        res.redirect(`/students/${student._id}`);
    } catch (err) {
        console.log("err creating student", err);
    }
};

/* ================= SHOW ================= */
module.exports.showStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("user");
        res.render("student/show.ejs", { student });
    } catch (err) {
        console.log("err fetching in show", err);
    }
};

/* ================= EDIT FORM ================= */
module.exports.editForm = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findById(id).populate("user");

        if (!student) return res.send("Student not found");

        
        if (
            req.session.role !== "Admin" &&
            req.session.userId.toString() !== student.user._id.toString()
        ) {
            return res.status(403).send("Unauthorized");
        }

        res.render("student/edit.ejs", { student });
    } catch (err) {
        console.log("err fetching in edit form", err);
    }
};

/* ================= UPDATE STUDENT ================= */
module.exports.updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findById(studentId).populate("user");
        if (!student) return res.send("Student not found");

        
        if (
            req.session.role !== "Admin" &&
            req.session.userId.toString() !== student.user._id.toString()
        ) {
            return res.status(403).send("Unauthorized");
        }

        
        await Student.findByIdAndUpdate(studentId, req.body.student);

        res.redirect("/students");

    } catch (err) {
        console.log(err);
        res.send("Update error");
    }
};

/* ================= DELETE STUDENT ================= */
module.exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findById(studentId).populate("user");
        if (!student) return res.send("Student not found");

        
        if (
            req.session.role !== "Admin" &&
            req.session.userId.toString() !== student.user._id.toString()
        ) {
            return res.status(403).send("Unauthorized");
        }

    
        await User.findByIdAndDelete(student.user._id);
        await Student.findByIdAndDelete(studentId);

        res.redirect("/students");

    } catch (err) {
        console.log(err);
        res.send("Delete error");
    }
};

/* ================= GET PAPER ================= */
module.exports.getPaper = async (req, res) => {
    try {
        const studentId = req.session.userId;
        if (!studentId) return res.status(401).send("Not logged in");

        const paperId = req.params.paperId;
        const paper = await Paper.findById(paperId);
        if (!paper) return res.status(404).send("Paper not found");

        
        const encryptedPath = paper.encryptedFilePath;
        const iv = Buffer.from(paper.iv, "hex");

        if (!fs.existsSync(encryptedPath)) {
            return res.status(404).send("Encrypted file missing");
        }

        const decryptedPath = path.join(
            __dirname,
            "..",
            "uploads",
            "temp",
            `${paper._id}_${studentId}.pdf`
        );

        fs.mkdirSync(path.dirname(decryptedPath), { recursive: true });

        
        await decryptFile(encryptedPath, decryptedPath, process.env.MASTER_SECRET, iv);

        res.download(decryptedPath, paper.title + ".pdf", (err) => {
            if (err) console.error(err);
            fs.unlinkSync(decryptedPath);
        });

    } catch (err) {
        console.error("Student getPaper error:", err);
        res.status(500).send("Failed to fetch paper");
    }
};





























































































