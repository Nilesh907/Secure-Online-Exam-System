require("dotenv").config();

const askGemini = require("./geminiService");
const { askOpenAI } = require("./openaiProvider");
const { askOpenRouter } = require("./openRouterProvider");
// const { askOllama } = require("./ollamaProvider");
const { askLocalAI } = require("./localProvider");

async function askAI(prompt, data) {

    const provider = process.env.AI_PROVIDER || "local";

    try {

        // ================= GEMINI =================

        if (provider === "gemini") {

            const response = await askGemini(prompt);

            return {

                provider: "GEMINI",

                response

            };

        }

        // ================= OPENAI =================

        if (provider === "openai") {

            const response = await askOpenAI(prompt);

            if(response){
                return {
                    provider:"OPENAI",

                    response
                };

}

        }

        // ================= OPENROUTER =================

        if (provider === "openrouter") {

            const response = await askOpenRouter(prompt);

            return {

                provider: "OPENROUTER",

                response

            };

        }

    } catch (err) {

        console.log(`${provider.toUpperCase()} Error:`, err.message);

    }

    // ================= LOCAL =================

    console.log("Switching to LOCAL AI...");

    const localResponse = await askLocalAI(prompt, data);

    return {

        provider: "LOCAL",

        response: JSON.stringify(localResponse)

    };

}

module.exports = {

    askAI

};