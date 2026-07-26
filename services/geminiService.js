const axios = require("axios")

async function askGemini(prompt) {

    try {

        const response = await axios.post(

            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

            {

                contents: [

                    {

                        parts: [

                            {

                                text: prompt

                            }

                        ]

                    }

                ]

            }

        );

        return response.data
            .candidates[0]
            .content.parts[0].text;

    } catch (err) {

        console.log("Gemini Error:", err.response?.data || err.message);

        return null;
    }
}

module.exports = askGemini;