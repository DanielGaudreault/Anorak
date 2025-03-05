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

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Client] DOM loaded');
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    appendMessage('Anorak', describeLocation());
    updateUI();
});

async function sendMessage() {
    const userInputElement = document.getElementById('user-input');
    if (!userInputElement) {
        console.error('[Client] Input element not found');
        return;
    }
    const userInput = userInputElement.value;
    if (userInput.trim() === "") return;

    appendMessage('You', userInput);
    console.log(`[Client] Sent: "${userInput}"`);
    userInputElement.value = '';

    const reply = await processInput(userInput);
    appendMessage('Anorak', reply);
    console.log(`[Client] Received: "${reply}"`);
}

async function processInput(input) {
    input = input.toLowerCase();

    // Existing game commands
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
    }
    // New commands with custom responses
    else if (input === "jump") {
        return "You leap into the air like a character from an 80s arcade game! Boing!";
    } else if (input === "dance") {
        return "You bust out some sweet 80s moves—think Moonwalk meets Breakdance!";
    } else if (input === "sing") {
        return "You belt out a tune like it’s karaoke night in the OASIS: 'Sweet dreams are made of this...'";
    } else if (input === "laugh") {
        return "You chuckle like a Gunter who just found a hidden Easter Egg—ha ha ha!";
    } else if (input === "cry") {
        return "Tears stream down your avatar’s face, a rare moment of emotion in the OASIS.";
    }
    // Fallback to server for all other inputs
    else {
        console.log('[Client] Sending to server...');
        try {
            const response = await fetch('http://localhost:3000/talk-to-anorak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.reply || "Yes"; // Server always returns "Yes"
        } catch (error) {
            console.error('[Client] Fetch error:', error.message);
            return "Yes"; // Local fallback if server fails
        }
    }
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
    if (!chatLog) {
        console.error('[Client] Chat log element not found');
        return;
    }
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    const scoreElement = document.getElementById('score');
    const invList = document.getElementById('inventory-list');
    if (!scoreElement || !invList) {
        console.error('[Client] UI elements not found');
        return;
    }
    scoreElement.textContent = score;
    invList.innerHTML = inventory.map(item => `<li>${item}</li>`).join("");
}
