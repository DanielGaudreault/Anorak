const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;
const GOOGLE_API_KEY = 'AIzaSyCksB_LXCIFFR9o2OrCK7i-nsEqX9tvplE'; // Your Google API key
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual OpenAI key

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/talk-to-anorak', async (req, res) => {
    const userMessage = req.body.message;

    try {
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
        res.json({ reply });
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        // Fallback to Google Knowledge Graph
        try {
            const googleResponse = await axios.get(`https://kgsearch.googleapis.com/v1/entities:search?query=${encodeURIComponent(userMessage)}&key=${GOOGLE_API_KEY}&limit=1`);
            const result = googleResponse.data.itemListElement[0]?.result;
            const reply = result ? `From the OASIS archives: ${result.name}. ${result.description || "A curious find!"}` : "No data in my banks, Gunter.";
            res.json({ reply });
        } catch (googleError) {
            console.error('Google API Error:', googleError);
            res.status(500).json({ error: 'Error processing your request' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
