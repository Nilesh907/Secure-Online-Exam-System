const Paper = require("../models/Paper"); 
const AIReport = require("../models/aiReport"); 
 
// ====================== SCHEDULE EXAM ====================== 
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

        if (paper.status !== "APPROVED") {
            return res.status(400).send("Paper must be approved first");
        }

        const parsedStartTime = parseISTDateTime(startTime);
        const parsedEndTime = parseISTDateTime(endTime);

        if (
            !parsedStartTime ||
            !parsedEndTime ||
            isNaN(parsedStartTime.getTime()) ||
            isNaN(parsedEndTime.getTime())
        ) {
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

        console.log(
            "Saved startTime UTC:",
            paper.startTime.toISOString()
        );

        console.log(
            "Saved endTime UTC:",
            paper.endTime.toISOString()
        );

        console.log("===================================");

        res.redirect(`/papers/${paper._id}`);

    } catch (err) {
        console.log("Scheduling error:", err);
        res.status(500).send("Scheduling failed");
    }
};
 
// ====================== ADMIN AI DASHBOARD ====================== 
exports.dashboard = async (req, res) => { 
    try { 
 
        const reports = await AIReport 
            .find() 
            .populate("studentId") 
            .sort({ createdAt: -1 }); 
 
        const totalReports = reports.length; 
 
        const highRisk = reports.filter( 
            report => report.threatLevel === "HIGH" 
        ).length; 
 
        const mediumRisk = reports.filter( 
            report => report.threatLevel === "MEDIUM" 
        ).length; 
 
        const lowRisk = reports.filter( 
            report => report.threatLevel === "LOW" 
        ).length; 
 
        // ================= BAR CHART DATA ================= 
         
        const studentNames = reports.map(report => { 
 
    if (!report.studentId) return "Unknown"; 
 
    const names = report.studentId.name.split(" "); 
 
    if (names.length === 1) return names[0]; 
 
    return `${names[0]} ${names[1][0]}.`; 
 
}); 
 
        const riskScores = reports.map(report => report.riskScore); 
 
        // ================= PIE CHART DATA ================= 
        const threatCounts = { 
            LOW: lowRisk, 
            MEDIUM: mediumRisk, 
            HIGH: highRisk 
        }; 
 
        res.render("admin/dashboard", { 
            reports, 
            totalReports, 
            highRisk, 
            mediumRisk, 
            lowRisk, 
            studentNames, 
            riskScores, 
            threatCounts 
        }); 
 
    } catch (err) { 
        console.log(err); 
        res.status(500).send("Dashboard Error"); 
    } 
}; 
 
// ====================== VIEW SINGLE REPORT ====================== 
exports.viewReport = async (req, res) => { 
    try { 
 
        const report = await AIReport 
            .findById(req.params.id) 
            .populate("studentId"); 
 
        if (!report) { 
            return res.status(404).send("AI Report not found"); 
        } 
 
        res.render("admin/report", { 
            report 
        }); 
 
    } catch (err) { 
        console.log(err); 
        res.status(500).send("Something went wrong"); 
    } 
};