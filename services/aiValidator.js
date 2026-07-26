function validateAIResponse(response) {

    if (!response) {

        return false;

    }

    const requiredFields = [

        "threatLevel",

        "reason",

        "recommendation",

        "prediction",

        "confidence",

        "nextAction"

    ];

    for (const field of requiredFields) {

        if (!(field in response)) {

            return false;

        }

    }

    if (!Array.isArray(response.reason)) {

        return false;

    }

    if (!Array.isArray(response.recommendation)) {

        return false;

    }

    return true;

}

module.exports = {

    validateAIResponse

};