const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const GOOGLE_API_KEY = 'AIzaSyDlbzA2lR4fBLxk1T1dD4A--JCAAcLPgfM'; // Your Google key
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your OpenAI key if you have one

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from root

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Explicitly serve index.html
});

app.post('/talk-to-anorak', async (req, res) => {
    const userMessage = req.body.message;
    console.log(`[Server] Received: "${userMessage}"`);

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        console.log('[Server] No OpenAI key, skipping to Google');
    } else {
        try {
            console.log('[Server] Attempting OpenAI request...');
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are Anorak, the wise and knowledgeable guide from the OASIS. Respond in a helpful and nostalgic tone, referencing 80s pop culture and Ready Player One lore." },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 150
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const reply = response.data.choices[0].message.content;
            console.log(`[Server] OpenAI reply: "${reply}"`);
            return res.json({ reply });
        } catch (error) {
            console.error('[Server] OpenAI Error:', error.response?.data || error.message);
        }
    }

    // Fallback to Google Knowledge Graph
    try {
        console.log('[Server] Attempting Google Knowledge Graph...');
        const googleResponse = await axios.get(`https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(userMessage)}&key=${GOOGLE_API_KEY}&limit=1`);
        const result = googleResponse.data.itemListElement[0]?.result;
        const reply = result ? `From the OASIS archives: ${result.name}. ${result.description || "A curious find!"}` : "No data in my banks, Gunter.";
        console.log(`[Server] Google reply: "${reply}"`);
        return res.json({ reply });
    } catch (googleError) {
        console.error('[Server] Google API Error:', googleError.response?.data || googleError.message);
        return res.json({ reply: "The OASIS archives are glitchy! Using local wisdom instead." });
    }
});

app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
});
