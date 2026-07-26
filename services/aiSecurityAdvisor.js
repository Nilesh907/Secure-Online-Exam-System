const { askAI } = require("./aiProvider");

const {

    validateAIResponse

} = require("./aiValidator");

const {

    generateFallbackReport

} = require("./aiFallback");

const { calculateConfidence } = require("./confidenceEngine");

async function analyzeRisk(data) {

    const {

    riskScore,

    riskLevel,

    tabSwitchCount,

    violationReason,

    deviceChanged = false,

    devToolsDetected = false,

    fullscreenExit = false

} = data;

    
    const prompt = `
        You are an AI Exam Security System.

        Analyze the student's behaviour carefully.

        Student Details

        Risk Score: ${riskScore}
        Risk Level: ${riskLevel}
        Tab Switch Count: ${tabSwitchCount}
        Violation: ${violationReason}

        Your job is to determine:

        1. Threat Level
        2. Prediction
        3. Confidence
        4. Next Action
        5. Reasons
        6. Recommendations

        IMPORTANT RULES:

        Return ONLY a valid JSON object.

        Do NOT write explanations.

        Do NOT use Markdown.

        Do NOT wrap the JSON inside \`\`\`.

        Do NOT write any text before or after the JSON.

        Return exactly this format:

        {
        "threatLevel":"LOW | MEDIUM | HIGH",
        "prediction":"SAFE | SUSPICIOUS | LIKELY CHEATING",
        "confidence":"0-100%",
        "nextAction":"ALLOW | MONITOR | SUSPEND",
        "reason":[
            "Reason 1",
            "Reason 2"
        ],
        "recommendation":[
            "Recommendation 1",
            "Recommendation 2"
        ]
        }
        `;

    const {

    provider,

    response

} = await askAI(

    prompt,

    data

);

const aiResponse = response;

    // ================= GEMINI FALLBACK =================

    if (!aiResponse) {

        console.log("Gemini unavailable. Using Local AI.");

        return localAI(data);

    }

    try {

        
             const cleanedResponse = aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // Find the JSON object inside the AI response
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1) {
            throw new Error("No valid JSON returned by AI");
        }

        const jsonString = cleanedResponse.substring(
            jsonStart,
            jsonEnd + 1
        );

        const result = JSON.parse(jsonString);


        result.provider = provider;

        result.confidence = calculateConfidence({

            riskScore,

            tabSwitchCount,

            deviceChanged,

            devToolsDetected,

            fullscreenExit

});

        if (!validateAIResponse(result)) {

            throw new Error("Invalid AI Response");

        }

        result.generatedAt = new Date().toLocaleString();

        return result;
            
    } catch (err) {

        console.log(

        "AI Error:",

        err.message

    );

    return generateFallbackReport({

        riskScore,

        riskLevel,

        tabSwitchCount,

        violationReason

    });
        

    }

}


// ================= LOCAL AI =================

function localAI(data) {

    const {
        riskScore,
        tabSwitchCount,
        violationReason
    } = data;

    let threatLevel = " LOW";

    let prediction = "SAFE";

    let nextAction = "ALLOW";

    let confidence = "85%";

    const reason = [];

    const recommendation = [];


    // ---------- Risk ----------

    if (riskScore >= 60) {

        threatLevel = " HIGH";

        prediction = "LIKELY CHEATING";

        nextAction = "SUSPEND";

        confidence = "98%";

    }

    else if (riskScore >= 30) {

        threatLevel = " MEDIUM";

        prediction = "SUSPICIOUS";

        nextAction = "MONITOR";

        confidence = "90%";

    }


    // ---------- Behaviour ----------

    if (tabSwitchCount === 1) {

        reason.push("Student switched tabs once.");

    }

    else if (tabSwitchCount <= 3) {

        reason.push(`Student switched tabs ${tabSwitchCount} times.`);

    }

    else {

        reason.push(`Student switched tabs ${tabSwitchCount} times. High suspicious activity detected.`);

    }

    reason.push(violationReason);

    reason.push(`Risk Score reached ${riskScore}`);


    // ---------- Recommendation ----------

    if (tabSwitchCount >= 5 || riskScore >= 60) {

        recommendation.push("Suspend Student Immediately.");

    }

    else if (tabSwitchCount >= 3) {

        recommendation.push("Increase Monitoring.");

    }

    else {

        recommendation.push("Continue Monitoring.");

    }

    recommendation.push("Notify Exam Administrator.");

    recommendation.push("Review Audit Logs.");


    return {

        threatLevel,

        reason,

        recommendation,

        prediction,

        confidence,

        nextAction,

        generatedAt: new Date().toLocaleString()

    };

}

module.exports = {

    analyzeRisk

};