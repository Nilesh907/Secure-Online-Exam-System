async function askLocalAI(data) {

    const {

        riskScore,

        tabSwitchCount,

        violationReason,

        deviceChanged = false,

        devToolsDetected = false,

        fullscreenExit = false

    } = data;

    let threatLevel = "🟢 LOW";

    let prediction = "SAFE";

    let nextAction = "ALLOW";

    const reason = [];

    const recommendation = [];

    /* ================= Threat Level ================= */

    if (riskScore >= 60) {

        threatLevel = "🔴 HIGH";

        prediction = "LIKELY CHEATING";

        nextAction = "SUSPEND";

    }

    else if (riskScore >= 30) {

        threatLevel = "🟡 MEDIUM";

        prediction = "SUSPICIOUS";

        nextAction = "MONITOR";

    }

    /* ================= Reasons ================= */

    if (tabSwitchCount === 1) {

        reason.push("Student switched tabs once.");

    }

    else if (tabSwitchCount <= 3 && tabSwitchCount > 0) {

        reason.push(
            `Student switched tabs ${tabSwitchCount} times.`
        );

    }

    else if (tabSwitchCount > 3) {

        reason.push(
            `Student switched tabs ${tabSwitchCount} times. High suspicious activity detected.`
        );

    }

    if (deviceChanged) {

        reason.push(
            "Multiple device/browser attempt detected."
        );

    }

    if (devToolsDetected) {

        reason.push(
            "Developer tools opened."
        );

    }

    if (fullscreenExit) {

        reason.push(
            "Fullscreen mode exited."
        );

    }

    reason.push(
        `Risk Score reached ${riskScore}`
    );

    /* ================= Recommendation ================= */

    if (riskScore >= 60) {

        recommendation.push(
            "Suspend Student Immediately."
        );

    }

    else if (riskScore >= 30) {

        recommendation.push(
            "Increase Monitoring."
        );

    }

    else {

        recommendation.push(
            "Continue Monitoring."
        );

    }

    recommendation.push(
        "Notify Exam Administrator."
    );

    recommendation.push(
        "Review Audit Logs."
    );

    return {

        provider: "LOCAL AI",

        threatLevel,

        prediction,

        confidence: "Rule Based",

        nextAction,

        reason,

        recommendation,

        generatedAt:
            new Date().toLocaleString()

    };

}

module.exports = {

    askLocalAI

};