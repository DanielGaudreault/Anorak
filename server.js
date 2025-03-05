require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// OpenAI API Endpoint
app.post('/talk-to-anorak', async (req, res) => {
    const userMessage = req.body.message || 'No message received';
    console.log(`[Server] Received: "${userMessage}"`);

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are Anorak, the wise and knowledgeable guide from the OASIS. Respond in a helpful and nostalgic tone, referencing 80s pop culture and Ready Player One lore."
                    },
                    {
                        role: "user",
                        content: userMessage
                    }
                ],
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        console.log(`[Server] OpenAI reply: "${reply}"`);
        return res.json({ reply });
    } catch (error) {
        console.error('[Server] OpenAI Error:', error.response?.data || error.message);
        return res.status(500).json({ reply: "An error occurred while processing your request. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
});
