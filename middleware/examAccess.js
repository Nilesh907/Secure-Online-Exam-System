const Paper = require("../models/Paper");

module.exports = async (req, res, next) => {
    try {
        const paper = await Paper.findById(req.params.id);

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        const now = new Date();

        if (paper.status !== "APPROVED" && paper.status !== "SCHEDULED") {
            return res.status(403).send("Not available");
        }

        if (now < paper.startTime) {
            return res.status(403).send("Exam not started yet");
        }

        if (now > paper.endTime) {
            return res.status(403).send("Exam ended");
        }

        // mark active only when user actually enters exam
        if (paper.status !== "ACTIVE") {
            paper.status = "ACTIVE";
            await paper.save();
        }

        return next();

    } catch (err) {
        console.error(err);
        return res.status(500).send("Server error");
    }
};