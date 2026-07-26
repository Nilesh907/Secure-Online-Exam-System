async function callAIModel(prompt) {

    console.log("\n========== AI PROMPT ==========\n");
    console.log(prompt);
    console.log("\n==============================\n");

    // 🔥 SIMULATED AI RESPONSE (Phase 3 base version)
    return JSON.stringify({
        threatLevel: "🟡 MEDIUM",
        reason: [
            "Repeated tab switching detected",
            "Behavior pattern matches exam bypass attempts"
        ],
        recommendation: [
            "Increase monitoring",
            "Restrict exam actions if behavior continues"
        ],
        prediction: "SUSPICIOUS",
        confidence: "85%",
        nextAction: "MONITOR"
    });
}

module.exports = { callAIModel };