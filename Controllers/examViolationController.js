const ExamSession = require("../models/ExamSession");
const { analyzeRisk } = require("../services/aiSecurityAdvisor");
const AuditLog = require("../models/AuditLog");
const AIReport = require("../models/aiReport");
const {

predictLeak

} = require("../services/aiLeakPrediction");


const RISK_WEIGHTS = {

    TAB_SWITCH: 10,
    DEVTOOLS: 15,
    FULLSCREEN_EXIT: 25,
    RIGHT_CLICK: 5

};

module.exports = async (req, res) => {
    console.log("VIOLATION ROUTE HIT");

    try {

        const { type } = req.body;

        const { paperId } = req.params;

        const session =
            await ExamSession.findOne({

                student: req.session.userId,

                paper: paperId,

                isSubmitted: false
            });

        if (!session) {

            return res.status(404).json({

                count: 0,

                suspended: false,

                message: "Session not found"
            });
        }

        /* ================= TAB SWITCH ================= */

        if (type === "TAB_SWITCH") {

            session.tabSwitchCount += 1;

            session.riskScore += RISK_WEIGHTS.TAB_SWITCH;

            session.violationReason = "Tab switching detected";

            session.riskScore = Math.min(session.riskScore, 100);
        }

        /* ================= FULLSCREEN EXIT ================= */

        if (type === "FULLSCREEN_EXIT") {

            session.riskScore += RISK_WEIGHTS.FULLSCREEN_EXIT;
            session.riskScore = Math.min(session.riskScore, 100);

            session.violationReason =
                "Fullscreen exit detected";
        }

        /* ================= DEVTOOLS ================= */

        if (type === "DEVTOOLS") {

            session.riskScore += RISK_WEIGHTS.DEVTOOLS;
            session.riskScore = Math.min(session.riskScore, 100);

            session.violationReason =
                "Developer tools attempt";
        }

        /* ================= RIGHT CLICK ================= */

        if (type === "RIGHT_CLICK") {

            session.riskScore += RISK_WEIGHTS.RIGHT_CLICK;
            session.riskScore = Math.min(session.riskScore, 100);

            session.violationReason =
                "Right click attempt";
        }

        /* ================= RISK LEVEL ================= */

        if (session.riskScore <= 20) {

            session.riskLevel = "LOW";

        } else if (
            session.riskScore <= 50
        ) {

            session.riskLevel =
                "MEDIUM";

        } else {

            session.riskLevel =
                "HIGH";
        }

        /* ================= AUTO SUSPEND ================= */

        if (

            session.tabSwitchCount >= 5 ||

            session.riskScore >= 60

        ) {

            session.isSuspended = true;
        }

        await session.save();

        const aiResult = await analyzeRisk({
            riskScore: session.riskScore,
            riskLevel: session.riskLevel,
            tabSwitchCount: session.tabSwitchCount,
            violationReason: session.violationReason,
            deviceChanged: session.violationReason === "Multiple device attempt",
            devToolsDetected: type === "DEVTOOLS",
            fullscreenExit:  type === "FULLSCREEN_EXIT"
        });

        const leakPrediction = await predictLeak({

        riskScore: session.riskScore,

        tabSwitchCount: session.tabSwitchCount,

        violationReason: session.violationReason,

        suspended: session.isSuspended

    });
        

        await AuditLog.create({

        user:req.session.userId,

        paper:paperId,

        action:"AI_SECURITY_REPORT",

        details:aiResult

        });    

        await AuditLog.create({

        user:req.session.userId,

        paper:paperId,

        action:"AI_LEAK_PREDICTION",

        details:leakPrediction

        });


        
        const cleanThreatLevel = aiResult.threatLevel
        .replace("🟢 ", "")
        .replace("🟡 ", "")
        .replace("🔴 ", "");

        console.log("========== AI REPORT DATA ==========");
        console.log(aiResult);
        console.log(leakPrediction);
        console.log("====================================");

        
        await AIReport.create({

    studentId: req.session.userId,

    riskScore: session.riskScore,

    threatLevel: cleanThreatLevel,

    // ================= AI Security Report =================

    prediction: aiResult.prediction,

    reason: aiResult.reason,

    recommendation: aiResult.recommendation,

    confidence: parseInt(aiResult.confidence),

    recommendedAction: aiResult.nextAction,

    provider: aiResult.provider,

    // ================= AI Leak Prediction =================

    leakPrediction: leakPrediction.leakProbability,

    futureRisk: leakPrediction.futureRisk,

    leakPredictionText: leakPrediction.prediction,

    leakRecommendation: leakPrediction.recommendation,

    leakProvider: leakPrediction.provider,

    // ================= Other =================

    violationType: type

});


        console.log("\n========== AI SECURITY REPORT ==========");

        console.log("Threat Level :", aiResult.threatLevel);

        console.log("\nReason:");

        aiResult.reason.forEach(item => {

            console.log("•", item);

        });

        console.log("\nRecommendation:");

        aiResult.recommendation.forEach(item => {

            console.log("•", item);

        });

        console.log("\nPrediction :", aiResult.prediction);

        console.log("Next Action :", aiResult.nextAction);

        console.log("Confidence :", aiResult.confidence);

        console.log("Generated At :", aiResult.generatedAt);

        console.log("========================================\n");


        /* ===========================================================
                            AI LEAK PREDICTION
        =========================================================== */

        console.log("\n========== AI LEAK PREDICTION ==========");

        console.log(
            "Leak Probability :",
            leakPrediction.leakProbability
        );

        console.log(
            "Future Risk :",
            leakPrediction.futureRisk
        );

        console.log(
            "Prediction :",
            leakPrediction.prediction
        );

        console.log("\nRecommendation :");

        leakPrediction.recommendation.forEach(item => {

            console.log("•", item);

        });

        console.log(
            "\nGenerated :",
            leakPrediction.generatedAt
        );

        console.log("========================================\n");

            
        console.log(
            "\n========== RISK ENGINE =========="
        );
        console.log("VIOLATION TYPE:", req.body.type);

        console.log(
            "Student:",
            req.session.userId
        );

        console.log(
            "Violation:",
            type
        );

        console.log(
            "Tab Switch Count:",
            session.tabSwitchCount
        );

        console.log(
            "Risk Score:",
            session.riskScore
        );

        console.log(
            "Risk Level:",
            session.riskLevel
        );

        console.log(
            "Suspended:",
            session.isSuspended
        );

        console.log(
            "=================================\n"
        );

        return res.json({

            count:
                session.tabSwitchCount,

            riskScore:
                session.riskScore,

            riskLevel:
                session.riskLevel,

            suspended:
                session.isSuspended
        });

    } catch (err) {

        console.log(
            "Violation Controller Error:",
            err
        );

        return res.status(500).json({

            count: 0,

            riskScore: 0,

            riskLevel: "LOW",

            suspended: false
        });
    }
};