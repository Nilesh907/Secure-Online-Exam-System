const axios = require("axios");

async function askOpenRouter(prompt) {

    try {

        const response = await axios.post(


            "https://openrouter.ai/api/v1/chat/completions",

            {

                model: "openai/gpt-4.1-mini",

                messages: [

                    {

                        role: "user",

                        content: prompt

                    }

                ],
                max_tokens: 300

            },

            {

                headers: {

                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,

                    "Content-Type": "application/json"

                }

            }

        );

        console.log("========== OPENROUTER RESPONSE ==========");
        console.log(response.data.choices[0].message.content);
        console.log("=========================================");

        return response.data.choices[0].message.content;

    }

    catch (err) {

        console.log(

            "OpenRouter Error:",

            err.response?.data || err.message

        );

        return null;

    }

}

module.exports = {

    askOpenRouter

};