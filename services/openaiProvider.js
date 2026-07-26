const OpenAI = require("openai");

const client = new OpenAI({

    apiKey: process.env.OPENAI_API_KEY

});

async function askOpenAI(prompt) {

    try {

        const response = await client.responses.create({

            model: "gpt-4.1-mini",

            input: prompt

        });

        return response.output_text;

    } catch (err) {

        console.log("OpenAI Error:", err.message);

        return null;

    }

}

module.exports = {

    askOpenAI

};