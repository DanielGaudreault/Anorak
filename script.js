const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    console.log('[Server] Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/talk-to-anorak', (req, res) => {
    const userMessage = req.body.message || 'No message received';
    console.log(`[Server] Received: "${userMessage}"`);
    // Always respond with "Yes" for non-game commands
    const reply = "Yes";
    console.log(`[Server] Reply: "${reply}"`);
    res.json({ reply });
});

app.get('/health', (req, res) => {
    console.log('[Server] Health check requested');
    res.json({ status: 'Server is alive!' });
});

app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
});
