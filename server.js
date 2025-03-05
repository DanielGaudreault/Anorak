const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const GOOGLE_API_KEY_1 = 'AIzaSyCksB_LXCIFFR9o2OrCK7i-nsEqX9tvplE'; // First Google key
const GOOGLE_API_KEY_2 = 'AIzaSyDlbzA2lR4fBLxk1T1dD4A--JCAAcLPgfM'; // Second Google key
const OPENAI_API_KEY = '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'; // Your OpenAI key

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    console.log('[Server] Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/talk-to-anorak', async (req, res) => {
    const userMessage = req.body.message || 'No message received';
    console.log(`[Server] Received: "${userMessage}"`);

    // Try OpenAI first
    try {
        console.log('[Server] Attempting OpenAI...');
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

    // Fallback to Google Knowledge Graph (try first key)
    try {
        console.log('[Server] Attempting Google with key 1...');
        const googleResponse = await axios.get(`https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(userMessage)}&key=${GOOGLE_API_KEY_1}&limit=1`);
        const result = googleResponse.data.itemListElement[0]?.result;
        const reply = result ? `From the OASIS archives: ${result.name}. ${result.description || "A curious find!"}` : "No data in my banks, Gunter.";
        console.log(`[Server] Google key 1 reply: "${reply}"`);
        return res.json({ reply });
    } catch (googleError1) {
        console.error('[Server] Google Key 1 Error:', googleError1.response?.data || googleError1.message);

        // Try second Google key
        try {
            console.log('[Server] Attempting Google with key 2...');
            const googleResponse = await axios.get(`https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(userMessage)}&key=${GOOGLE_API_KEY_2}&limit=1`);
            const result = googleResponse.data.itemListElement[0]?.result;
            const reply = result ? `From the OASIS archives: ${result.name}. ${result.description || "A curious find!"}` : "No data in my banks, Gunter.";
            console.log(`[Server] Google key 2 reply: "${reply}"`);
            return res.json({ reply });
        } catch (googleError2) {
            console.error('[Server] Google Key 2 Error:', googleError2.response?.data || googleError2.message);
            return res.json({ reply: "All APIs failed. Using local logic." });
        }
    }
});

app.get('/health', (req, res) => {
    console.log('[Server] Health check requested');
    res.json({ status: 'Server is alive!' });
});

app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
});
