const {

calculateConfidence

} = require("./confidenceEngine");

function generateFallbackReport(data) {

    const {

        riskScore,

        tabSwitchCount,

        violationReason

    } = data;

    let threatLevel;

    let prediction;

    let nextAction;

    let confidence;

    const reason = [];

    const recommendation = [];

    /* ================= Threat ================= */

    if (riskScore >= 60) {

        threatLevel = "🔴 HIGH";

        prediction = "LIKELY CHEATING";

        nextAction = "SUSPEND";

        confidence = calculateConfidence({

        riskScore,

        tabSwitchCount,

        violationReason

});

    }

    else if (riskScore >= 30) {

        threatLevel = "🟡 MEDIUM";

        prediction = "SUSPICIOUS";

        nextAction = "MONITOR";

        confidence = "88%";

    }

    else {

        threatLevel = "🟢 LOW";

        prediction = "SAFE";

        nextAction = "ALLOW";

        confidence = "82%";

    }

    /* ================= Reasons ================= */

    reason.push(`Risk Score reached ${riskScore}`);

    reason.push(violationReason);

    reason.push(

        `Tab switches: ${tabSwitchCount}`

    );

    /* ================= Recommendation ================= */

    if (riskScore >= 60) {

        recommendation.push(

            "Suspend Student"

        );

    }

    else {

        recommendation.push(

            "Continue Monitoring"

        );

    }

    recommendation.push(

        "Review Audit Logs"

    );

    recommendation.push(

        "Notify Administrator"

    );

    return {

        threatLevel,

        reason,

        recommendation,

        prediction,

        confidence,

        nextAction,

        generatedAt:

            new Date().toLocaleString(),

        source:

            "Fallback Engine"

    };

}

module.exports = {

    generateFallbackReport

};