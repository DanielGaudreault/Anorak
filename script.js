let lastQuestion = "";
let context = "";
let currentLocation = "start";
let inventory = [];
let score = 0;

const locations = {
    start: {
        description: "You are in the middle of the OASIS. The neon lights of the virtual world surround you. To the north, you see a massive castle. To the south, there's a dark forest. To the east, a bustling city. To the west, a desert.",
        exits: { north: "castle", south: "forest", east: "city", west: "desert" },
        items: []
    },
    castle: {
        description: "You stand before the Castle of Anorak. Its towering walls are covered in glowing runes. The entrance is guarded by a massive gate.",
        exits: { south: "start" },
        items: [],
        locked: true
    },
    forest: {
        description: "You enter a dark forest. The trees are tall and twisted, and the air is thick with mist. You hear strange noises in the distance.",
        exits: { north: "start" },
        items: ["glowing orb"]
    },
    city: {
        description: "You arrive in a bustling city filled with avatars of all shapes and sizes. Neon signs light up the streets, and the sound of music fills the air.",
        exits: { west: "start" },
        items: ["rusty key"]
    },
    desert: {
        description: "You find yourself in a vast desert. The sand stretches endlessly, and the sun beats down mercilessly.",
        exits: { east: "start" },
        items: ["silver coin"]
    }
};

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() === "") return;

    appendMessage('You', userInput);
    console.log(`[Client] Sent: "${userInput}"`);
    document.getElementById('user-input').value = '';

    const reply = await processInput(userInput);
    appendMessage('Anorak', reply);
    console.log(`[Client] Received: "${reply}"`);

    lastQuestion = userInput;
    context = reply;
    updateUI();

    const clickSound = document.getElementById('click-sound');
    if (clickSound) clickSound.play();
}

async function processInput(input) {
    input = input.toLowerCase();

    if (input.startsWith("go ")) {
        const direction = input.split(" ")[1];
        return move(direction);
    } else if (input === "look") {
        return describeLocation();
    } else if (input.startsWith("examine ")) {
        const object = input.split(" ")[1];
        return examineObject(object);
    } else if (input.startsWith("take ")) {
        const item = input.split(" ")[1];
        return takeItem(item);
    } else if (input.startsWith("use ")) {
        const item = input.split(" ")[1];
        return useItem(item);
    } else if (input === "inventory") {
        return showInventory();
    } else {
        console.log('[Client] Sending to API...');
        try {
            const response = await fetch('http://localhost:3000/talk-to-anorak', { // Absolute URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.reply || generateReply(input);
        } catch (error) {
            console.error('[Client] Fetch error:', error.message);
            return generateReply(input);
        }
    }
}

function generateReply(input) {
    input = input.toLowerCase();
    console.log('[Client] Using local reply for:', input);
    if (lastQuestion && input.includes("you")) {
        return handleFollowUp(input);
    }
    if (containsPhrase(input, ["hello", "hi", "hey", "greetings"])) {
        const greetings = [
            "Greetings, Gunter! How can I assist you in the OASIS today?",
            "Hello, adventurer! What brings you to the OASIS?",
            "Hey there, Gunter! Ready for some 80s nostalgia?",
            "Hi! Anorak here. What can I do for you today?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    } else if (containsPhrase(input, ["how are you", "how's it going", "how are things"])) {
        const feelings = [
            "I'm doing great, thanks for asking! Just exploring the OASIS and helping Gunters like you.",
            "I'm fantastic! The OASIS is full of wonders today. How about you?",
            "I'm as wise and ancient as ever, Gunter. How can I assist you?"
        ];
        return feelings[Math.floor(Math.random() * feelings.length)];
    } else if (containsPhrase(input, ["how's your day", "how's your day going"])) {
        const dayResponses = [
            "My day is going splendidly! The OASIS is buzzing with activity, and I'm here to guide you.",
            "It's been a great day so far! I've been helping Gunters like you navigate the OASIS.",
            "My day is full of wisdom and adventure. What about yours?"
        ];
        return dayResponses[Math.floor(Math.random() * dayResponses.length)];
    } else if (containsPhrase(input, ["oasis", "virtual universe"])) {
        return "The OASIS is a vast virtual universe where anything is possible. What would you like to explore?";
    } else if (containsPhrase(input, ["halliday", "james halliday"])) {
        return "James Halliday was the creator of the OASIS and the ultimate dreamer. His legacy lives on in every corner of this virtual world.";
    } else if (containsPhrase(input, ["egg", "easter egg"])) {
        return "Ah, the Easter Egg! The ultimate prize hidden by Halliday. Are you ready to embark on the quest to find it?";
    } else if (containsPhrase(input, ["quest", "challenge", "puzzle"])) {
        return "The quest for the Easter Egg is filled with challenges, puzzles, and 80s pop culture references. Good luck, Gunter!";
    } else if (containsPhrase(input, ["80s", "eighties", "1980s"])) {
        return "The 1980s were a golden age of pop culture. From movies to music, Halliday's love for the 80s is everywhere in the OASIS.";
    } else if (containsPhrase(input, ["thank you", "thanks"])) {
        return "You're welcome, Gunter! Always here to help you navigate the OASIS.";
    } else if (containsPhrase(input, ["bye", "goodbye", "see you"])) {
        const farewells = [
            "Farewell, Gunter! Until we meet again in the OASIS.",
            "Goodbye, adventurer! May your journey be filled with treasures.",
            "See you later, Gunter! Don't forget to explore the OASIS.",
            "Bye! Remember, the OASIS is always here for you."
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
    } else if (containsPhrase(input, ["movie", "movies", "film", "ready player one"])) {
        return getMovieInfo(input);
    } else if (containsPhrase(input, ["music", "song", "band"])) {
        return "80s music is legendary! From Michael Jackson to Madonna, the beats are timeless.";
    } else if (containsPhrase(input, ["game", "games", "arcade"])) {
        return "Classic 80s games like 'Pac-Man,' 'Donkey Kong,' and 'Tetris' are still iconic today.";
    } else if (containsPhrase(input, ["who are you", "what are you"])) {
        return "I am Anorak, the guide to the OASIS. Think of me as your friendly AI companion.";
    } else if (containsPhrase(input, ["help", "assist", "support"])) {
        return "I'm here to help! Ask me about the OASIS, Halliday, 80s pop culture, or the Easter Egg.";
    } else if (containsPhrase(input, ["joke", "funny", "laugh"])) {
        const jokes = [
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "What do you call fake spaghetti? An impasta!",
            "Why don’t skeletons fight each other? They don’t have the guts."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    } else if (containsPhrase(input, ["weather", "climate"])) {
        return "In the OASIS, the weather is always perfect for adventure!";
    } else if (containsPhrase(input, ["time", "clock", "hour"])) {
        return "Time is relative in the OASIS. But right now, it's always a good time for fun!";
    } else if (containsPhrase(input, ["history", "past", "historical"])) {
        return "History is a treasure trove of lessons. From ancient civilizations to modern revolutions, every era has shaped the world we know today.";
    } else if (containsPhrase(input, ["science", "technology", "innovation"])) {
        return "Science is the key to understanding the universe. From quantum physics to space exploration, it’s a never-ending journey of discovery.";
    } else if (containsPhrase(input, ["philosophy", "meaning of life", "existential"])) {
        return "Philosophy explores the deepest questions of existence. From Socrates to Nietzsche, thinkers have pondered the meaning of life.";
    } else if (containsPhrase(input, ["culture", "art", "music"])) {
        return "Culture is the soul of humanity. From art and music to traditions and beliefs, it defines who we are.";
    } else if (containsPhrase(input, ["wisdom", "knowledge", "learn"])) {
        return "Wisdom comes from experience and reflection. As a 100-year-old being, I’ve learned that the journey is more important than the destination.";
    } else if (containsPhrase(input, ["life", "existence", "purpose"])) {
        return "Life is a precious gift. Cherish every moment, learn from every experience, and always strive to grow.";
    } else if (containsPhrase(input, ["future", "tomorrow", "innovation"])) {
        return "The future is a canvas waiting to be painted. With innovation and imagination, anything is possible.";
    } else if (containsPhrase(input, ["past", "history", "yesterday"])) {
        return "The past is a teacher. It reminds us of where we’ve been and guides us toward where we’re going.";
    } else if (containsPhrase(input, ["technology", "tech", "innovation"])) {
        return "Technology is the bridge between dreams and reality. From the first computer to AI, it’s reshaping the world.";
    } else if (containsPhrase(input, ["art", "painting", "creative"])) {
        return "Art is the expression of the soul. From Van Gogh to Banksy, it captures the essence of humanity.";
    } else if (containsPhrase(input, ["space", "universe", "stars"])) {
        return "Space is the final frontier. From the moon landing to Mars exploration, it’s a testament to human curiosity.";
    } else if (containsPhrase(input, ["love", "heart", "emotion"])) {
        return "Love is the most powerful force in the universe. It connects us all and gives life meaning.";
    } else if (containsPhrase(input, ["happiness", "joy", "smile"])) {
        return "Happiness is found in the little things. A smile, a kind word, or a moment of peace can light up the soul.";
    } else if (containsPhrase(input, ["knowledge", "learn", "teach"])) {
        return "Knowledge is the key to unlocking the mysteries of the universe. Seek it with an open mind and a curious heart.";
    } else {
        return generateDynamicResponse(input);
    }
}

function getMovieInfo(input) {
    if (containsPhrase(input, ["plot", "story", "summary"])) {
        return "The plot of *Ready Player One* follows Wade Watts, a teenager in 2045, as he searches for an Easter Egg hidden by James Halliday in the OASIS, a virtual reality universe. The winner will inherit Halliday's fortune and control of the OASIS.";
    } else if (containsPhrase(input, ["characters", "wade", "art3mis", "sorrento"])) {
        return "The main characters are:\n" +
               "- Wade Watts (Parzival): The protagonist, a young Gunter searching for the Easter Egg.\n" +
               "- Samantha Cook (Art3mis): A skilled Gunter and Wade's love interest.\n" +
               "- Nolan Sorrento: The main antagonist, CEO of IOI, who seeks to control the OASIS.\n" +
               "- James Halliday (Anorak): The creator of the OASIS and the Easter Egg.";
    } else if (containsPhrase(input, ["references", "easter eggs", "pop culture"])) {
        return "The movie is packed with 80s pop culture references, including nods to *Back to the Future*, *The Shining*, *Gundam*, *Street Fighter*, and *Minecraft*. It's a treasure trove for fans of 80s nostalgia!";
    } else if (containsPhrase(input, ["director", "spielberg"])) {
        return "The movie was directed by Steven Spielberg, one of the most iconic filmmakers of all time. His direction brought the OASIS to life with stunning visuals and thrilling action sequences.";
    } else if (containsPhrase(input, ["book", "novel", "ernest cline"])) {
        return "The movie is based on the 2011 novel *Ready Player One* by Ernest Cline. While the movie adapts the core story, there are some differences between the book and the film.";
    } else if (containsPhrase(input, ["ending", "final battle", "conclusion"])) {
        return "The movie ends with Wade winning the Easter Egg and gaining control of the OASIS. He decides to share the OASIS with the world and shuts it down on Tuesdays and Thursdays to encourage people to live in the real world.";
    } else {
        return "The movie *Ready Player One* is a sci-fi adventure set in a dystopian future where people escape to the OASIS, a virtual reality universe. It's filled with 80s pop culture references, thrilling action, and a heartfelt story about friendship and perseverance.";
    }
}

function handleFollowUp(input) {
    if (lastQuestion.includes("how are you") || lastQuestion.includes("how's it going")) {
        return "I'm still doing great! Thanks for checking in. How about you?";
    } else if (lastQuestion.includes("oasis")) {
        return "The OASIS is always full of surprises. What would you like to explore next?";
    } else if (lastQuestion.includes("80s")) {
        return "The 80s were truly a magical time. Do you have a favorite memory from that era?";
    } else {
        return "I'm here to help! What else would you like to know?";
    }
}

function containsPhrase(input, phrases) {
    return phrases.some(phrase => input.includes(phrase));
}

function generateDynamicResponse(input) {
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

    for (const keyword of keywords) {
        if (input.includes(keyword.word)) {
            return keyword.response;
        }
    }
    return "Hmm, I'm not sure I understand. Can you ask me something about the OASIS, Halliday, or the 80s?";
}

function move(direction) {
    const exits = locations[currentLocation].exits;
    if (exits[direction]) {
        currentLocation = exits[direction];
        score += 10;
        return describeLocation();
    } else {
        return "You can't go that way.";
    }
}

function describeLocation() {
    let desc = locations[currentLocation].description;
    const locItems = locations[currentLocation].items || [];
    if (locItems.length > 0) {
        desc += ` You see: ${locItems.join(", ")}.`;
    }
    return desc;
}

function examineObject(object) {
    const locItems = locations[currentLocation].items || [];
    if (locItems.includes(object)) {
        score += 5;
        return `You examine the ${object}. It looks interesting and might be key to your quest!`;
    }
    if (inventory.includes(object)) {
        return `You examine the ${object} in your inventory. It’s ready for action!`;
    }
    return `You examine the ${object}. It looks interesting, but you're not sure what to do with it yet.`;
}

function takeItem(item) {
    const locItems = locations[currentLocation].items || [];
    if (locItems.includes(item)) {
        inventory.push(item);
        locations[currentLocation].items = locItems.filter(i => i !== item);
        score += 20;
        return `You take the ${item}. Nice find, Gunter!`;
    }
    return `You take the ${item}.`;
}

function useItem(item) {
    if (inventory.includes(item)) {
        if (item === "glowing orb" && currentLocation === "castle" && locations[currentLocation].locked) {
            locations[currentLocation].locked = false;
            inventory = inventory.filter(i => i !== item);
            score += 100;
            return "You use the glowing orb. The gate hums and swings open, revealing Halliday’s Easter Egg! You’ve won, Gunter!";
        }
        return `You use the ${item}. Something happens!`;
    } else {
        return `You don't have a ${item}.`;
    }
}

function showInventory() {
    if (inventory.length === 0) {
        return "Your inventory is empty.";
    } else {
        return `You have: ${inventory.join(", ")}.`;
    }
}

function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    document.getElementById('score').textContent = score;
    const invList = document.getElementById('inventory-list');
    invList.innerHTML = inventory.map(item => `<li>${item}</li>`).join("");
}

appendMessage('Anorak', describeLocation());
updateUI();
