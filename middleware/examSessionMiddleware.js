const ExamSession = require("../models/ExamSession");

module.exports = async (req, res, next) => {
    try {

        const session = await ExamSession.findOne({
            student: req.session.userId,
            paper: req.params.paperId,
            isSubmitted: false
        });

        if (!session) {
            return res.status(403).send("No active exam session");
        }

        // ================= DEBUG (dev only) =================
        if (process.env.NODE_ENV !== "production") {
            console.log("\n===== EXAM SESSION DEBUG =====");
            console.log("DB sessionId:", session.sessionId);
            console.log("Client sessionId:", req.session.examSessionId);
            console.log("DB deviceId:", session.deviceId);
            console.log("Client deviceId:", req.deviceId);
            console.log("Risk Score:", session.riskScore);
            console.log("Suspended:", session.isSuspended);
            console.log("==============================\n");
        }

        // ================= BLOCK IF SUSPENDED =================
        if (session.isSuspended) {
            return res.status(403).send(
                "Session suspended due to suspicious activity"
            );
        }

        // ================= SESSION (TAB/DEVICE SESSION LOCK) =================
        if (
            session.sessionId &&
            req.session.examSessionId &&
            session.sessionId !== req.session.examSessionId
        ) {
            return res.status(403).send(
                "Exam already active in another tab/device"
            );
        }

        // ================= DEVICE BINDING (IMPORTANT FIX) =================

        // FIRST TIME DEVICE SET (bind device to session)
        if (!session.deviceId) {

            session.deviceId = req.deviceId;
            await session.save();

        } 
        // DEVICE MISMATCH BLOCK
        else if (session.deviceId !== req.deviceId) {

            console.log("DEVICE MISMATCH DETECTED");

            return res.status(403).send(
                "Device mismatch detected"
            );
        }

        // ================= RISK LOG =================
        console.log(
            "RISK SCORE:",
            session.riskScore || 0,
            "LEVEL:",
            session.riskLevel || "LOW"
        );

        next();

    } catch (err) {

        console.log("Session validation error:", err);

        res.status(500).send("Session validation error");
    }
};