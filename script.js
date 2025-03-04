document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    appendMessage('You', userInput);
    document.getElementById('user-input').value = '';

    const reply = generateReply(userInput);
    appendMessage('Anorak', reply);
}

function generateReply(input) {
    // Convert input to lowercase for easier matching
    input = input.toLowerCase();

    // Rule-based responses
    if (input.includes("hello") || input.includes("hi")) {
        return "Greetings, Gunter! How can I assist you in the OASIS today?";
    } else if (input.includes("oasis")) {
        return "The OASIS is a vast virtual universe where anything is possible. What would you like to explore?";
    } else if (input.includes("halliday")) {
        return "James Halliday was the creator of the OASIS and the ultimate dreamer. His legacy lives on in every corner of this virtual world.";
    } else if (input.includes("egg")) {
        return "Ah, the Easter Egg! The ultimate prize hidden by Halliday. Are you ready to embark on the quest to find it?";
    } else if (input.includes("quest")) {
        return "The quest for the Easter Egg is filled with challenges, puzzles, and 80s pop culture references. Good luck, Gunter!";
    } else if (input.includes("80s")) {
        return "The 1980s were a golden age of pop culture. From movies to music, Halliday's love for the 80s is everywhere in the OASIS.";
    } else if (input.includes("thank you")) {
        return "You're welcome, Gunter! Always here to help you navigate the OASIS.";
    } else if (input.includes("bye")) {
        return "Farewell, Gunter! Until we meet again in the OASIS.";
    } else {
        return "Hmm, I'm not sure I understand. Can you ask me something about the OASIS, Halliday, or the 80s?";
    }
}

function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}
