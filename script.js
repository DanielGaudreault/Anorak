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

    // Expanded rule-based responses
    if (input.includes("hello") || input.includes("hi") || input.includes("hey") || input.includes("greetings")) {
        const greetings = [
            "Greetings, Gunter! How can I assist you in the OASIS today?",
            "Hello, adventurer! What brings you to the OASIS?",
            "Hey there, Gunter! Ready for some 80s nostalgia?",
            "Hi! Anorak here. What can I do for you today?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
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
    } else if (input.includes("thank you") || input.includes("thanks")) {
        return "You're welcome, Gunter! Always here to help you navigate the OASIS.";
    } else if (input.includes("bye") || input.includes("goodbye")) {
        const farewells = [
            "Farewell, Gunter! Until we meet again in the OASIS.",
            "Goodbye, adventurer! May your journey be filled with treasures.",
            "See you later, Gunter! Don't forget to explore the OASIS.",
            "Bye! Remember, the OASIS is always here for you."
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
    } else if (input.includes("movie") || input.includes("movies")) {
        return "The 80s had some of the best movies! Have you seen 'Back to the Future,' 'The Goonies,' or 'Blade Runner'?";
    } else if (input.includes("music") || input.includes("song")) {
        return "80s music is legendary! From Michael Jackson to Madonna, the beats are timeless.";
    } else if (input.includes("game") || input.includes("games")) {
        return "Classic 80s games like 'Pac-Man,' 'Donkey Kong,' and 'Tetris' are still iconic today.";
    } else if (input.includes("who are you")) {
        return "I am Anorak, the guide to the OASIS. Think of me as your friendly AI companion.";
    } else if (input.includes("help")) {
        return "I'm here to help! Ask me about the OASIS, Halliday, 80s pop culture, or the Easter Egg.";
    } else if (input.includes("joke")) {
        const jokes = [
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "What do you call fake spaghetti? An impasta!",
            "Why don’t skeletons fight each other? They don’t have the guts."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    } else if (input.includes("weather")) {
        return "In the OASIS, the weather is always perfect for adventure!";
    } else if (input.includes("time")) {
        return "Time is relative in the OASIS. But right now, it's always a good time for fun!";
    } else if (input.includes("history")) {
        return "History is a treasure trove of lessons. From ancient civilizations to modern revolutions, every era has shaped the world we know today.";
    } else if (input.includes("science")) {
        return "Science is the key to understanding the universe. From quantum physics to space exploration, it’s a never-ending journey of discovery.";
    } else if (input.includes("philosophy")) {
        return "Philosophy explores the deepest questions of existence. From Socrates to Nietzsche, thinkers have pondered the meaning of life.";
    } else if (input.includes("culture")) {
        return "Culture is the soul of humanity. From art and music to traditions and beliefs, it defines who we are.";
    } else if (input.includes("wisdom")) {
        return "Wisdom comes from experience and reflection. As a 100-year-old being, I’ve learned that the journey is more important than the destination.";
    } else if (input.includes("life")) {
        return "Life is a precious gift. Cherish every moment, learn from every experience, and always strive to grow.";
    } else if (input.includes("future")) {
        return "The future is a canvas waiting to be painted. With innovation and imagination, anything is possible.";
    } else if (input.includes("past")) {
        return "The past is a teacher. It reminds us of where we’ve been and guides us toward where we’re going.";
    } else if (input.includes("technology")) {
        return "Technology is the bridge between dreams and reality. From the first computer to AI, it’s reshaping the world.";
    } else if (input.includes("art")) {
        return "Art is the expression of the soul. From Van Gogh to Banksy, it captures the essence of humanity.";
    } else if (input.includes("space")) {
        return "Space is the final frontier. From the moon landing to Mars exploration, it’s a testament to human curiosity.";
    } else if (input.includes("love")) {
        return "Love is the most powerful force in the universe. It connects us all and gives life meaning.";
    } else if (input.includes("happiness")) {
        return "Happiness is found in the little things. A smile, a kind word, or a moment of peace can light up the soul.";
    } else if (input.includes("knowledge")) {
        return "Knowledge is the key to unlocking the mysteries of the universe. Seek it with an open mind and a curious heart.";
    } else {
        // Fallback: Generate a dynamic response based on keywords
        return generateDynamicResponse(input);
    }
}

function generateDynamicResponse(input) {
    // Keywords related to the OASIS, 80s, and general knowledge
    const keywords = [
        { word: "80s", response: "The 80s were amazing! From neon fashion to iconic movies, it was a decade to remember." },
        { word: "music", response: "Music in the 80s was revolutionary. Bands like Duran Duran and Queen ruled the airwaves." },
        { word: "movie", response: "80s movies were legendary! Have you seen 'The Breakfast Club' or 'E.T.'?" },
        { word: "game", response: "Classic 80s games like 'Space Invaders' and 'Mario Bros.' are still loved today." },
        { word: "halliday", response: "James Halliday was a genius. His love for the 80s shaped the OASIS." },
        { word: "oasis", response: "The OASIS is a virtual paradise. What would you like to explore today?" },
        { word: "egg", response: "The Easter Egg is the ultimate prize. Are you ready to take on the challenge?" },
        { word: "quest", response: "The quest for the Easter Egg is filled with 80s references and puzzles." },
        { word: "pop culture", response: "80s pop culture is everywhere in the OASIS. It's a nostalgia overload!" },
        { word: "adventure", response: "Every day in the OASIS is an adventure. What are you waiting for?" },
        { word: "history", response: "History is a treasure trove of lessons. From ancient civilizations to modern revolutions, every era has shaped the world we know today." },
        { word: "science", response: "Science is the key to understanding the universe. From quantum physics to space exploration, it’s a never-ending journey of discovery." },
        { word: "philosophy", response: "Philosophy explores the deepest questions of existence. From Socrates to Nietzsche, thinkers have pondered the meaning of life." },
        { word: "culture", response: "Culture is the soul of humanity. From art and music to traditions and beliefs, it defines who we are." },
        { word: "wisdom", response: "Wisdom comes from experience and reflection. As a 100-year-old being, I’ve learned that the journey is more important than the destination." },
        { word: "life", response: "Life is a precious gift. Cherish every moment, learn from every experience, and always strive to grow." },
        { word: "future", response: "The future is a canvas waiting to be painted. With innovation and imagination, anything is possible." },
        { word: "past", response: "The past is a teacher. It reminds us of where we’ve been and guides us toward where we’re going." },
        { word: "technology", response: "Technology is the bridge between dreams and reality. From the first computer to AI, it’s reshaping the world." },
        { word: "art", response: "Art is the expression of the soul. From Van Gogh to Banksy, it captures the essence of humanity." },
        { word: "space", response: "Space is the final frontier. From the moon landing to Mars exploration, it’s a testament to human curiosity." },
        { word: "love", response: "Love is the most powerful force in the universe. It connects us all and gives life meaning." },
        { word: "happiness", response: "Happiness is found in the little things. A smile, a kind word, or a moment of peace can light up the soul." },
        { word: "knowledge", response: "Knowledge is the key to unlocking the mysteries of the universe. Seek it with an open mind and a curious heart." }
    ];

    // Check if any keyword matches the input
    for (const keyword of keywords) {
        if (input.includes(keyword.word)) {
            return keyword.response;
        }
    }

    // Default fallback response
    return "Hmm, I'm not sure I understand. Can you ask me something about the OASIS, Halliday, or the 80s?";
}

function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}
