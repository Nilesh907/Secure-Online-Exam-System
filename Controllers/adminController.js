const Paper = require("../models/Paper");
const AIReport = require("../models/aiReport");

// ======================
// Convert IST datetime-local → Date
// ======================
function parseISTDateTime(value) {
    if (!value) return null;

    return new Date(`${value}:00+05:30`);
}


// ======================
// SCHEDULE EXAM
// ======================
exports.scheduleExam = async (req, res) => {
    try {

        const { startTime, endTime } = req.body;

        console.log("========== SCHEDULE DEBUG ==========");
        console.log("Received startTime:", startTime);
        console.log("Received endTime:", endTime);

        const paper = await Paper.findById(req.params.id);

        if (!paper) {
            return res.status(404).send("Paper not found");
        }

        // Must be approved before scheduling
        if (paper.status !== "APPROVED") {
            return res.status(400).send("Paper must be approved first");
        }

        const parsedStartTime = parseISTDateTime(startTime);
        const parsedEndTime = parseISTDateTime(endTime);

        if (!parsedStartTime || !parsedEndTime) {
            return res.status(400).send("Start time and end time are required");
        }

        if (isNaN(parsedStartTime.getTime()) ||
            isNaN(parsedEndTime.getTime())) {
            return res.status(400).send("Invalid date/time");
        }

        if (parsedEndTime <= parsedStartTime) {
            return res.status(400).send(
                "End time must be after start time"
            );
        }

        paper.startTime = parsedStartTime;
        paper.endTime = parsedEndTime;
        paper.status = "SCHEDULED";

        await paper.save();

        console.log("Saved startTime:", paper.startTime.toISOString());
        console.log("Saved endTime:", paper.endTime.toISOString());
        console.log("===================================");

        res.redirect(`/papers/${paper._id}`);

    } catch (err) {

        console.log("Scheduling error:", err);

        res.status(500).send("Scheduling failed");
    }
};