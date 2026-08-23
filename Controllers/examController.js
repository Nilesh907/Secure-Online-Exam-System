const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const Paper = require("../models/Paper");
const ExamSession = require("../models/ExamSession");
const { decryptFile,generateHash } = require("../services/encryptionService"); 
const jwt = require("jsonwebtoken");
const AccessLog = require("../models/AccessLog");
const { PDFDocument, rgb } = require("pdf-lib");

/* ================= TOKEN PAGE ================= */
exports.getTokenPage = async (req, res) => {
    try {
        if (req.session.role !== "Student") {
            return res.send("Unauthorized");
        }

        const paper = await Paper.findById(req.params.paperId);
        if (!paper) return res.send("Paper not found");

        const session = await ExamSession.findOne({
            student: req.session.userId,
            paper: paper._id,
            isSubmitted: false
        });

        res.render("exam/token", {
            paper,
            token: session ? session.token : null
        });

    } catch (err) {
        console.log(err);
        res.send("Error loading token page");
    }
};

/* ================= GENERATE TOKEN ================= */
exports.generateToken = async (req, res) => {
    try {
        const paper = await Paper.findById(req.params.paperId);
        if (!paper) return res.send("Paper not found");

        const now = new Date();
        const allowedTime = new Date(paper.startTime.getTime() - 2 * 60 * 1000);

        if (now < allowedTime) {
            return res.send("Token allowed only 2 minutes before exam");
        }


        if (now > paper.endTime) {
            return res.send(
                "Exam has already ended"
            );

        let session = await ExamSession.findOne({
            student: req.session.userId,
            paper: paper._id,
            isSubmitted: false
        });

        if (session) {
            return res.render("exam/token", { paper, token: session.token });
        }

        const token = jwt.sign(
            {
                studentId: req.session.userId,
                paperId: paper._id
            },
            process.env.MASTER_SECRET,
            { expiresIn: "2m" }
        );

        await ExamSession.create({
            student: req.session.userId,
            paper: paper._id,
            token,
            tokenExpiry: new Date(Date.now() + 2 * 60 * 1000),
            tokenUsed: false,
            isSubmitted: false,
            ip: req.ip,
            ua: req.headers["user-agent"]
        });

        res.render("exam/token", { paper, token });

    } catch (err) {
        console.log(err);
        res.send("Error generating token");
    }
};

/* ================= START EXAM ================= */


exports.startExam = async (req, res) => {
    try {
        const { token } = req.body;

        const session = await ExamSession.findOne({
            student: req.session.userId,
            paper: req.params.paperId,
            isSubmitted: false
        });

        if (!session) {
            return res.status(404).send("Session not found");
        }

        // 1. Token expiry check
        if (new Date() > session.tokenExpiry) {
            return res.send("Token expired");
        }

        // 2. Already running exam check
        if (session.sessionId) {
            return res.status(403).send("Exam already running on another device");
        }

        // 3. 🔥 JWT VERIFY (IMPORTANT FIX)
        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.MASTER_SECRET
            );
        } catch (err) {
            return res.status(403).send("Invalid token (JWT verification failed)");
        }

        // 4. Match JWT payload with session
        if (
            decoded.studentId !== String(req.session.userId) ||
            decoded.paperId !== String(session.paper)
        ) {
            return res.status(403).send("Token mismatch");
        }

        // 5. DB token check (extra safety layer)
        
            try {

            const decoded = jwt.verify(
                token,
                process.env.MASTER_SECRET
            );

            if (
                String(decoded.studentId) !==
                String(req.session.userId)
            ) {
                return res.send("Invalid token");
            }

            if (
                String(decoded.paperId) !==
                String(req.params.paperId)
            ) {
                return res.send("Invalid paper");
            }

        } catch (err) {

            return res.send(
                "Invalid or expired token"
            );
        }

        // 7. Device validation (must be BEFORE activation)
        if (!session.deviceId) {
            session.deviceId = req.deviceId;
        } else if (session.deviceId !== req.deviceId) {
            return res.status(403).send("Device mismatch detected at start");
        }

        // 8. Activate exam session
        const newSessionId = crypto.randomBytes(16).toString("hex");

        session.tokenUsed = true;
        session.sessionId = newSessionId;
        session.examStartTime = new Date();

        await session.save();

        // 9. Bind session in express-session
        req.session.examSessionId = newSessionId;

        return res.redirect(`/exam/${session.paper}/attempt`);

    } catch (err) {
        console.log(err);
        return res.status(500).send("Error starting exam");
    }
};

/* ================= GET EXAM ================= */

exports.getExam = async (req, res) => {
    let tempPath;

    try {
        const paper = await Paper.findById(req.params.paperId);
        if (!paper) return res.status(404).send("Paper not found");

        const now = new Date();

        if (now < paper.startTime || now > paper.endTime) {
            return res.status(403).send("Exam not active");
        }

        const userId = req.session?.userId;
        if (!userId) return res.status(401).send("Unauthorized");

        const session = await ExamSession.findOne({
            student: userId,
            paper: paper._id,
            tokenUsed: true,
            isSubmitted: false
        });

        if (!session) {
            return res.status(403).send("Unauthorized exam access");
        }

        const currentUA = req.headers["user-agent"];

        // ================= FIRST TIME DEVICE BIND =================
        if (!session.ua || !session.deviceId) {

            session.ua = currentUA;
            session.deviceId = req.deviceId;

            await session.save();
        }

        // ================= UA CHECK =================
        const storedUA = session.ua
            ? session.ua.split(" ").slice(0, 3).join()
            : "";

        const currentShortUA = currentUA
            ? currentUA.split(" ").slice(0, 3).join()
            : "";

        if (storedUA && storedUA !== currentShortUA) {

            console.log("UA MISMATCH DETECTED");

            return res.status(403).send("Device changed detected");
        }

        // ================= DEVICE CHECK =================
        console.log("SESSION DEVICE ID:", session.deviceId);
        console.log("REQUEST DEVICE ID:", req.deviceId);

        if (
            session.deviceId &&
            String(session.deviceId) !== String(req.deviceId)
        ) {

            console.log("DEVICE MISMATCH DETECTED");

            // ================= RISK UPDATE =================
            session.riskScore = Math.min(session.riskScore + 30, 100);
            session.riskLevel = "HIGH";
            session.violationReason = "Multiple device attempt";

            await session.save();

            // ================= AUDIT LOG =================
            await AuditLog.create({
                user: req.session.userId,
                paper: paper._id,
                action: "MULTIPLE_DEVICE_ATTEMPT",
                details: {
                    message: "Exam accessed from another device/browser",
                    serverDevice: session.deviceId,
                    clientDevice: req.deviceId,
                    time: new Date()
                }
            });

            // ================= AI ANALYSIS =================
            const aiResult = await analyzeRisk({
                riskScore: session.riskScore,
                riskLevel: session.riskLevel,
                tabSwitchCount: session.tabSwitchCount,
                violationReason: session.violationReason
            });

            await AuditLog.create({
                user: req.session.userId,
                paper: paper._id,
                action: "AI_SECURITY_REPORT",
                details: aiResult
            });

            return res.status(403).send(
                "Exam already active on another device"
            );
        }

        // DEBUG LOG
        console.log("DEVICE ID:", req.deviceId);
        console.log("SESSION DEVICE ID:", session.deviceId);

        // ================= SECURITY KEY =================
        const finalKey = crypto
            .createHmac("sha256", process.env.SERVER_ENCRYPTION_SECRET)
            .update(String(paper.paperKey))
            .digest();

        // ================= (REST OF YOUR CODE UNCHANGED) =================
        console.log("\n========== EXAM SECURITY LAYER ==========");
        console.log("User ID:", userId);
        console.log("Paper ID:", String(paper._id));
        console.log("Final AES Key Length:", finalKey.length);
        console.log("Device User-Agent:", currentUA);
        console.log("====\n");

        if (!paper.encryptedFilePath || !fs.existsSync(paper.encryptedFilePath)) {
            return res.status(404).send("Encrypted file missing");
        }

        const fileBuffer = fs.readFileSync(paper.encryptedFilePath);

        const currentHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        if (currentHash !== paper.hash) {
            return res.status(403).send("Paper integrity verification failed");
        }

        tempPath = path.join(__dirname, `../storage/temp-${Date.now()}.pdf`);

        await decryptFile(
            paper.encryptedFilePath,
            tempPath,
            finalKey,
            paper.fileIV,
            paper.authTag
        );

        const pdfBytes = fs.readFileSync(tempPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();

        const watermark = `
        User: ${String(userId).slice(0, 5)}...
        Time: ${new Date().toLocaleString()}
        Session: ${String(session.sessionId).slice(0, 6)}
        `;

        pages.forEach(page => {
            const { width, height } = page.getSize();

            page.drawText(watermark, {
                x: width / 4,
                y: height / 2,
                size: 18,
                color: rgb(1, 0, 0),
                opacity: 0.25
            });
        });

        const updatedPdf = await pdfDoc.save();
        fs.writeFileSync(tempPath, updatedPdf);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");

        const stream = fs.createReadStream(tempPath);
        stream.pipe(res);

        res.on("finish", () => {
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlink(tempPath, () => {});
            }
        });

        stream.on("error", () => {
            if (tempPath && fs.existsSync(tempPath)) {
                fs.unlink(tempPath, () => {});
            }
        });

    } catch (err) {
        console.error("GET EXAM ERROR:", err);

        if (tempPath && fs.existsSync(tempPath)) {
            fs.unlink(tempPath, () => {});
        }

        res.status(500).send("Error opening exam");
    }
};




exports.submitExam = async (req, res) => {
    try {
        const session = await ExamSession.findOne({
            student: req.session.userId,
            paper: req.params.paperId,
            isSubmitted: false
        });

        if (!session) {
            return res.send("Session not found");
        }

        session.isSubmitted = true;
        session.sessionId = null; 
        session.tokenUsed = false;

        await session.save();

        req.session.examSessionId = null;

        res.send("Exam submitted successfully");

    } catch (err) {
        console.log(err);
        res.send("Error submitting exam");
    }
};


exports.renderAttemptPage = async (req, res) => {

    try {

        const paper = await Paper.findById(
            req.params.paperId
        );

        if (!paper) {

            return res.send(
                "Paper not found"
            );
        }

        // Check active session
        const session =
            await ExamSession.findOne({

                student: req.session.userId,

                paper: paper._id
            });

        // No session
        if (!session) {

            return res
                .status(403)
                .send(
                    "No exam session found"
                );
        }

        // Already submitted
        if (session.isSubmitted) {

            return res
                .status(403)
                .send(
                    "Exam already submitted. Reopening is not allowed."
                );
        }

        // Invalid session
        if (
            !session.sessionId
        ) {

            return res
                .status(403)
                .send(
                    "Invalid exam session"
                );
        }

                
                res.set({
            "Cache-Control":
                "no-store, no-cache, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        });

        res.render(
            "exam/attempt",
            { paper }
        );

    } catch (err) {

        console.log(err);

        res.send(
            "Error loading exam page"
        );
    }
};

