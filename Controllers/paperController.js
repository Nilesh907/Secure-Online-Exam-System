const Paper=require("../models/Paper.js")
const Teacher=require("../models/Teacher.js")
const Reviewer=require("../models/Reviewer.js")
const User=require("../models/User.js")
const { encryptFile,decryptFile, generateHash } = require("../services/encryptionService.js");
const fs = require("fs");

const path = require("path");
const mongoose = require("mongoose");

const ExamSession = require("../models/ExamSession.js");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

// ================= AUTHORIZATION HELPERS =================
// Single source of truth for "who can see/open this paper" so showPaper
// and viewPaper can't drift out of sync with each other or with index().

function canViewPaperMeta(session, paper) {
    if (session.role === "Admin") return true;
    if (session.role === "Teacher") {
        return String(paper.uploadedBy?._id || paper.uploadedBy) === String(session.userId);
    }
    if (session.role === "Reviewer") {
        return (
            paper.status === "UNDER_REVIEW" ||
            String(paper.reviewedBy?._id || paper.reviewedBy) === String(session.userId)
        );
    }
    if (session.role === "Student") {
        // Students may only ever see papers that are visible in their /papers index
        return ["SCHEDULED", "ACTIVE"].includes(paper.status);
    }
    return false;
}

// Deliberately stricter than canViewPaperMeta: this gates the endpoint that
// DECRYPTS and serves the actual exam PDF. Students must never take this
// path — their only route to the decrypted, watermarked file is the
// dedicated /exam/:paperId/stream flow (examController.getExam), which
// enforces token/session/device binding and watermarking. If a Student
// role reaches here, deny outright rather than reusing the metadata rule.
function canViewPaperFile(session, paper) {
    if (session.role === "Student") return false;
    return canViewPaperMeta(session, paper);
}

//GET ALL  PAPERS  /papers
// ====================== GET ALL PAPERS ======================
// GET /papers

module.exports.index = async (req, res) => {
    try {
        let papers = [];

        console.log("ROLE:", req.session.role);
        console.log("USER:", req.session.userId);

        // ================= ADMIN =================
        if (req.session.role === "Admin") {

            papers = await Paper.find()
                .select(
                    "title subject department status uploadedBy reviewedBy lastViewedAt createdAt startTime endTime"
                )
                .populate("uploadedBy", "name")
                .populate("reviewedBy", "name")
                .lean();

        }

        // ================= TEACHER =================
        else if (req.session.role === "Teacher") {

            papers = await Paper.find()
                .select(
                    "title subject department status uploadedBy reviewedBy lastViewedAt createdAt startTime endTime"
                )
                .populate("uploadedBy", "name")
                .populate("reviewedBy", "name")
                .lean();

        }

        // ================= REVIEWER =================
        else if (req.session.role === "Reviewer") {

            papers = await Paper.find({
                status: "UNDER_REVIEW"
            })
                .select(
                    "title subject department status uploadedBy reviewedBy lastViewedAt createdAt startTime endTime"
                )
                .populate("uploadedBy", "name")
                .populate("reviewedBy", "name")
                .lean();

        }

        // ================= STUDENT =================
        else if (req.session.role === "Student") {

            papers = await Paper.find({
                status: "SCHEDULED"
            })
                .select(
                    "title subject department status uploadedBy reviewedBy lastViewedAt createdAt startTime endTime"
                )
                .populate("uploadedBy", "name")
                .populate("reviewedBy", "name")
                .lean();

            console.log(
                "STUDENT PAPERS COUNT:",
                papers.length
            );
        }

        // ================= DEFAULT =================
        else {
            papers = [];
        }

        res.render("paper/index.ejs", {
            papers,
            currentUser: req.session
        });

    } catch (err) {

        console.log(
            "Error fetching papers:",
            err
        );

        res.status(500).send("Server Error");
    }
};

				
//GET NEW FORM   /paper/new

module.exports.newForm = async (req, res) => {
  try {
    const teachers = await User.find({ role: "Teacher" });
    const reviewers = await User.find({ role: "Reviewer" });

    res.render("paper/new", { teachers, reviewers });

  } catch (err) {
    console.log("Error loading form:", err);
  }
};

//POST  /papers =>create papers

module.exports.createPaper = async (req, res) => {
    let inputPath;

    try {
        if (!req.file) return res.send("No file uploaded");

        inputPath = req.file.path;

        const crypto = require("crypto");


        // STORAGE DIR
        const storageDir = path.join(__dirname, "../storage");

        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        const encryptedPath = path.join(
            storageDir,
            `enc-${Date.now()}.pdf`
        );

        // ================= KEY SYSTEM =================

        // raw paper key
        const paperKey = crypto.randomBytes(32).toString("hex");

        // FINAL AES KEY
        const finalKey = crypto
            .createHmac(
                "sha256",
                process.env.SERVER_ENCRYPTION_SECRET
            )
            .update(String(paperKey))
            .digest();

        // ENCRYPT FILE
       
            const encryptionData = await encryptFile(
            inputPath,
            encryptedPath,
            finalKey
        );

        const fileIV = encryptionData.fileIV;
        const authTag = encryptionData.authTag;

        const encryptedHash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(encryptedPath))
        .digest("hex");

        console.log("Encrypted SHA:", encryptedHash);

    
        const watermarkText =
        "WM-" +
        Date.now() +
        "-" +
        crypto.randomBytes(8).toString("hex");

        const paper = new Paper({
            title: req.body.paper?.title || req.body.title,

            subject:
                req.body.paper?.subject ||
                req.body.subject,

            department:
                req.body.paper?.department ||
                req.body.department,

            encryptedFilePath: encryptedPath,
            classification:
            req.body.paper?.classification || "EXAM_CONFIDENTIAL",

            fileIV,
            authTag,

            paperKey,
            watermarkText,
            hash: encryptedHash,
            status: "SUBMITTED",

            uploadedBy: req.session.userId
        });

        await paper.save();

        await AuditLog.create({
        user:req.session.userId,
        paper:paper._id,
        action:"PAPER_CREATED",
        details:"Paper uploaded"
    
    });

        console.log("AUDIT WORKING");

        // DELETE ORIGINAL FILE
        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
        res.redirect(`/papers/${paper._id}/success`);

    } catch (err) {

        console.log("CREATE ERROR:", err);

        if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }

        res.send("Upload failed");
    }
};

module.exports.uploadSuccess = async (req, res) => {

    const paper =
        await Paper.findById(req.params.id);

    res.render(
        "paper/success",
        { paper }
    );
};


//GET  /papers/:id  SHOW SINGLE PAPER

module.exports.showPaper = async (req, res) => {
  try {
    const paperCheck = await Paper.findById(req.params.id);
    if (!paperCheck) {
      return res.redirect("/papers");
    }
    if (!canViewPaperMeta(req.session, paperCheck)) {
      return res.status(403).send("Not authorized to view this paper");
    }

    const paper = await Paper.findByIdAndUpdate(
      req.params.id,
      {
        $set: { lastViewedAt: new Date() }
      },
      {
        returnDocument: "after",
        runValidators: false
      }
    )
      .populate("uploadedBy")
      .populate("reviewedBy");

    if (!paper) {
      return res.redirect("/papers");
    }

    res.render("paper/show.ejs", {
      paper,
      currentUser: req.session
    });

  } catch (err) {
    console.log("Error fetching paper:", err);
  }
};

// GET   /paper/:id/edit => edit form

module.exports.editForm=async(req,res)=>{
	try{
		const {id}=req.params
		const paper=await Paper.findById(id)
		res.render("paper/edit.ejs",{paper})
	}catch(err){
		console.log("Error loading edit form :",err)
	}
}

//PUT/PATCH  /papers/:id => update paper

module.exports.updatePaper = async (req, res) => {
  const paper = await Paper.findById(req.params.id);
  if (!paper) return res.send("Paper not found");

  // =========================
  // 1. TEXT UPDATE (always)
  // =========================
  paper.title = req.body.paper.title;
  paper.description = req.body.paper.description;
  paper.subject = req.body.paper.subject;
  paper.department = req.body.paper.department;

  // =========================
  // 2. FILE REPLACEMENT (ONLY IF NEW FILE UPLOADED)
  // =========================
  if (req.file) {
    paper.fileVersions.push({
      path: paper.encryptedFilePath,
      uploadedAt: new Date(),
      uploadedBy: req.user._id
    });

    paper.encryptedFilePath = req.file.path;
  }

  await paper.save();

  res.redirect(`/papers/${paper._id}`);
};

//DELETE  /papers/:id =>DELETE PAPER

module.exports.deletePaper=async(req,res)=>{
	try{
		const paper = await Paper.findById(req.params.id);

    await AuditLog.create({
    user:req.session.userId,
    paper:paper._id,
    action:"PAPER_DELETED",
    details:"Paper deleted"
});
    await Paper.findByIdAndDelete(req.params.id);
		res.redirect("/papers");
	}catch(err){
		console.log("Error deleting paper :",err)
	}
}

module.exports.viewPaper = async (req, res) => {

    try {

        const crypto = require("crypto");

        const paper = await Paper.findById(req.params.id);

        if (!paper) {
            return res.send("Paper not found");
        }

        if (!canViewPaperFile(req.session, paper)) {
            await AuditLog.create({
                user: req.session.userId,
                paper: paper._id,
                action: "PAPER_VIEW_DENIED",
                details: `Unauthorized access attempt by role ${req.session.role}`
            });
            return res.status(403).send("Not authorized to view this paper");
        }

        await AuditLog.create({
        user:req.session.userId,
        paper:paper._id,
        action:"PAPER_VIEWED",
        details:"Paper viewed"
    });

        const encryptedPath = path.resolve(
            paper.encryptedFilePath
        );

        if (!fs.existsSync(encryptedPath)) {
            return res.send("Encrypted file missing");
        }

        // ================= FINAL KEY =================

        const finalKey = crypto
            .createHmac(
                "sha256",
                process.env.SERVER_ENCRYPTION_SECRET
            )
            .update(String(paper.paperKey))
            .digest();

        const tempPath = path.join(
            __dirname,
            `../storage/temp-${Date.now()}.pdf`
        );

        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            finalKey,
            Buffer.from(paper.fileIV, "hex")
        );

        decipher.setAuthTag(
            Buffer.from(paper.authTag, "hex")
        );

        const { pipeline } = require("stream");

        pipeline(
            fs.createReadStream(encryptedPath),
            decipher,
            fs.createWriteStream(tempPath),

            (err) => {

                if (err) {

                    console.log(
                        "Decryption failed:",
                        err
                    );

                    return res.send(
                        "File cannot be decrypted"
                    );
                }

                res.sendFile(tempPath, (err) => {

                    if (
                        fs.existsSync(tempPath)
                    ) {
                        fs.unlinkSync(tempPath);
                    }

                });
            }
        );

    } catch (err) {

        console.log("VIEW ERROR:", err);

        res.send("Error opening paper");
    }
};

module.exports.approvePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.send("Paper not found");

    paper.status = "APPROVED";
    paper.reviewedBy = req.session.userId;

    await paper.save();

    await AuditLog.create({
    user:req.session.userId,
    paper:paper._id,
    action:"PAPER_APPROVED",
    details:"Reviewer approved paper"
});

    res.redirect("/reviewers");

  } catch (err) {
    console.log(err);
    res.send("Approval failed");
  }
};





module.exports.sendForCorrection = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.send("Paper not found");

    // 🔍 DEBUG (IMPORTANT)
    console.log("Incoming comment:", req.body.comment);

    paper.status = "NEEDS_CORRECTION";

    
    paper.reviewComment = req.body.comment;

    await paper.save();

    await AuditLog.create({
    user:req.session.userId,
    paper:paper._id,
    action:"CORRECTION_REQUESTED",
    details:req.body.comment
});

    console.log("Saved comment:", paper.reviewComment);

    res.redirect("/reviewers");

  } catch (err) {
    console.log(err);
    res.send("Correction failed");
  }
};



module.exports.submitPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.send("Paper not found");

    paper.status = "UNDER_REVIEW";

    await paper.save();

    res.redirect(`/papers/${paper._id}`); // ✔ OK

  } catch (err) {
    console.log(err);
    res.send("Submit failed");
  }
};


module.exports.resubmitPaper = async (req, res) => {
  const paper = await Paper.findById(req.params.id);

  if (!paper) {
    return res.status(404).send("Paper not found");
  }

  // safety check: only teacher can resubmit corrected papers
  if (paper.status !== "NEEDS_CORRECTION") {
    return res.status(400).send("Invalid resubmit action");
  }

  paper.status = "UNDER_REVIEW";

  await paper.save();

  res.redirect(`/papers/${paper._id}`);
};
