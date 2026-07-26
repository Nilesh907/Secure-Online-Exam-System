function calculateConfidence(data) {

    const {

        riskScore,

        tabSwitchCount,

        deviceChanged,

        devToolsDetected,

        fullscreenExit

    } = data;

    let confidence = 50;

    // ================= Risk Score =================

    confidence += Math.min(riskScore * 0.3, 20);

    // ================= Tab Switch =================

    confidence += Math.min(tabSwitchCount * 3, 10);

    // ================= Device Change =================

    if (deviceChanged) {

        confidence += 10;

    }

    // ================= DevTools =================

    if (devToolsDetected) {

        confidence += 8;

    }

    // ================= Fullscreen =================

    if (fullscreenExit) {

        confidence += 5;

    }

    confidence = Math.min(Math.round(confidence), 99);

    return `${confidence}%`;

}

module.exports = {

    calculateConfidence

};