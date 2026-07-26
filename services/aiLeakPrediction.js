const { askAI } = require("./aiProvider");

async function predictLeak(data) {

    const {

        riskScore,

        tabSwitchCount,

        violationReason,

        suspended

    } = data;

    try {

        const prompt = `
You are an AI Exam Security System.

Analyze the student's behaviour and predict whether there is a possibility of:

1. Exam paper leakage
2. Account sharing
3. Serious cheating

Student Details

Risk Score: ${riskScore}

Tab Switch Count: ${tabSwitchCount}

Violation: ${violationReason}

Suspended: ${suspended}

Return ONLY valid JSON.

{
    "leakProbability":"0-100%",
    "futureRisk":"LOW | MEDIUM | HIGH",
    "prediction":"Short prediction",
    "recommendation":[
        "Recommendation 1",
        "Recommendation 2"
    ]
}
`;

        const { provider, response } = await askAI(prompt, data);

        if (!response) {

            throw new Error("No AI response");

        }

        const cleanedResponse = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const jsonStart = cleanedResponse.indexOf("{");

        const jsonEnd = cleanedResponse.lastIndexOf("}");

        const jsonString = cleanedResponse.substring(
            jsonStart,
            jsonEnd + 1
        );

        const result = JSON.parse(jsonString);

        result.provider = provider;

        result.generatedAt = new Date().toLocaleString();

        return result;

    } catch (err) {

        console.log("Leak AI Error:", err.message);

        // ================= RULE-BASED FALLBACK =================

        let leakProbability = 0;

        leakProbability += riskScore;

        leakProbability += tabSwitchCount * 5;

        if (violationReason.includes("Developer")) {

            leakProbability += 15;

        }

        if (violationReason.includes("Multiple")) {

            leakProbability += 25;

        }

        if (violationReason.includes("Fullscreen")) {

            leakProbability += 10;

        }

        if (suspended) {

            leakProbability += 10;

        }

        leakProbability = Math.min(leakProbability, 100);

        let futureRisk;

        let prediction;

        let recommendation;

        if (leakProbability >= 80) {

            futureRisk = "🔴 HIGH";

            prediction =
                "High probability of paper leakage or account sharing.";

            recommendation = [

                "Suspend Account",

                "Notify Administrator",

                "Revoke Exam Session"

            ];

        }

        else if (leakProbability >= 50) {

            futureRisk = "🟡 MEDIUM";

            prediction =
                "Suspicious behaviour may lead to exam compromise.";

            recommendation = [

                "Increase Monitoring",

                "Review Audit Logs"

            ];

        }

        else {

            futureRisk = "🟢 LOW";

            prediction =
                "No indication of paper leakage.";

            recommendation = [

                "Continue Monitoring"

            ];

        }

        return {

            leakProbability: `${leakProbability}%`,

            futureRisk,

            prediction,

            recommendation,

            generatedAt: new Date().toLocaleString(),

            provider: "LOCAL"

        };

    }

}

module.exports = {

    predictLeak

};