let lastQuestion = "";
let context = "";
let currentLocation = "middletown";
let inventory = [];
let score = 0;
let keysFound = { copper: false, jade: false, crystal: false };
let enemiesDefeated = 0;
let puzzleSolved = false;

const locations = {
    middletown: {
        description: "You’re in Middletown, Ohio, 2045—a dystopian sprawl of stacks and trailers. A VR parlor glows nearby, your gateway to the OASIS. To the north is Ludus, to the east the Distracted Globe, to the south IOI Plaza, to the west the Stacks.",
        exits: { north: "ludus", east: "distracted_globe", south: "ioi_plaza", west: "stacks" },
        items: ["VR headset"],
        enemies: [],
        puzzle: null
    },
    ludus: {
        description: "Ludus, the school planet in the OASIS. Retro 80s classrooms hum with avatars. A shimmering portal hints at a race. North leads to the Tomb of Horrors, east to the Copper Gate, west back to Middletown.",
        exits: { north: "tomb_of_horrors", east: "copper_gate", west: "middletown" },
        items: ["quarter"],
        enemies: [],
        puzzle: "What’s the name of Halliday’s favorite Dungeons & Dragons module? (Hint: You’re near it.)"
    },
    tomb_of_horrors: {
        description: "A dark, eerie dungeon from Halliday’s D&D obsession. Skeletons litter the floor, and a lich named Acererak guards a Copper Key. South returns to Ludus.",
        exits: { south: "ludus" },
        items: ["copper key"],
        enemies: ["acererak"],
        puzzle: null
    },
    copper_gate: {
        description: "A massive gate from the movie, glowing with copper light. It requires the Copper Key to unlock. East leads to the Jade Gate, west to Ludus.",
        exits: { east: "jade_gate", west: "ludus" },
        items: [],
        enemies: [],
        puzzle: null,
        locked: true,
        keyRequired: "copper key"
    },
    jade_gate: {
        description: "The Jade Gate, shimmering green, stands before a virtual arcade. It needs the Jade Key. East to the Crystal Gate, west to the Copper Gate, north to Planet Doom.",
        exits: { east: "crystal_gate", west: "copper_gate", north: "planet_doom" },
        items: [],
        enemies: [],
        puzzle: null,
        locked: true,
        keyRequired: "jade key"
    },
    crystal_gate: {
        description: "The Crystal Gate sparkles like a prism, the final barrier to Halliday’s castle. It demands the Crystal Key. West to the Jade Gate, north to Castle Anorak.",
        exits: { west: "jade_gate", north: "castle_anorak" },
        items: [],
        enemies: [],
        puzzle: null,
        locked: true,
        keyRequired: "crystal key"
    },
    distracted_globe: {
        description: "The Distracted Globe, a zero-gravity dance club pulsing with 80s beats. Avatars groove to ‘Blue Monday.’ West to Middletown, south to the WarGames sim.",
        exits: { west: "middletown", south: "wargames_sim" },
        items: ["dance shoes"],
        enemies: [],
        puzzle: null
    },
    wargames_sim: {
        description: "A simulation of *WarGames*. A computer voice asks, 'Shall we play a game?' You spot the Jade Key guarded by a tic-tac-toe puzzle. North to the Distracted Globe.",
        exits: { north: "distracted_globe" },
        items: ["jade key"],
        enemies: [],
        puzzle: "Win a game of tic-tac-toe against me. Type 'play' to start."
    },
    ioi_plaza: {
        description: "IOI Plaza, a corporate stronghold in the OASIS. Sixers patrol, hunting Gunters. North to Middletown, east to Planet Doom.",
        exits: { north: "middletown", east: "planet_doom" },
        items: [],
        enemies: ["sixer_drone"],
        puzzle: null
    },
    stacks: {
        description: "The Stacks, a towering slum of trailers outside the OASIS. A hidden portal hums. East to Middletown.",
        exits: { east: "middletown" },
        items: ["oasis coin"],
        enemies: [],
        puzzle: null
    },
    planet_doom: {
        description: "Planet Doom, a chaotic battlefield from the movie. Mechs and avatars clash. South to IOI Plaza, west to the Jade Gate, north to the Shining Maze.",
        exits: { south: "ioi_plaza", west: "jade_gate", north: "shining_maze" },
        items: ["blaster"],
        enemies: ["mech"],
        puzzle: null
    },
    shining_maze: {
        description: "A hedge maze from *The Shining*, eerie and disorienting. The Crystal Key glints at the center, guarded by a puzzle. South to Planet Doom.",
        exits: { south: "planet_doom" },
        items: ["crystal key"],
        enemies: [],
        puzzle: "What’s the room number from The Shining that Wade enters? (Hint: It’s three digits.)"
    },
    castle_anorak: {
        description: "Castle Anorak, Halliday’s fortress. A massive Atari 2600 awaits the final challenge. South to the Crystal Gate.",
        exits: { south: "crystal_gate" },
        items: [],
        enemies: [],
        puzzle: "Play Adventure and find the Easter Egg. Type 'play adventure' to win."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Client] DOM loaded');
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    appendMessage('Anorak', "Greetings, Gunter! Welcome to the OASIS, 2045. I’m Anorak, your guide to Halliday’s Easter Egg hunt. Type 'look' to begin your quest!");
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

    const reply = processInput(userInput.toLowerCase());
    appendMessage('Anorak', reply);
    console.log(`[Client] Received: "${reply}"`);
    updateUI();
}

function processInput(input) {
    // Game Commands
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
    } else if (input.startsWith("attack ")) {
        const target = input.split(" ")[1];
        return attack(target);
    } else if (input.startsWith("solve ") || input === "play") {
        const answer = input.startsWith("solve ") ? input.split(" ").slice(1).join(" ") : input;
        return solvePuzzle(answer);
    } else if (input === "jump") {
        return "You leap like Wade dodging IOI drones—straight out of the movie!";
    } else if (input === "dance") {
        return "You groove like Parzival in the Distracted Globe—80s style!";
    } else if (input === "sing") {
        return "You croon, 'Take on me, take me on,' echoing Aech’s playlist!";
    } else if (input === "laugh") {
        return "You laugh like Halliday at his own 80s jokes—priceless!";
    } else if (input === "cry") {
        return "Tears fall like Wade’s after losing a life in the OASIS.";
    }
    // AI-Like Responses
    else if (input.includes("halliday")) {
        return "James Halliday, the OASIS creator, hid his Easter Egg for a worthy Gunter. His love for the 80s—like *Back to the Future* and *Pac-Man*—is your clue!";
    } else if (input.includes("egg") || input.includes("easter egg")) {
        return "The Easter Egg is the prize! Find the Copper, Jade, and Crystal Keys to claim it, just like in the movie. Where’s your next move, Gunter?";
    } else if (input.includes("80s") || input.includes("eighties")) {
        return "The 80s are the heart of the OASIS! Think *Ferris Bueller*, Duran Duran, and Atari. What’s your favorite 80s vibe?";
    } else if (input.includes("parzival") || input.includes("wade")) {
        return "Parzival, aka Wade Watts, beat the odds to win the Egg. You’re on his path—keep hunting, Gunter!";
    } else if (input.includes("art3mis") || input.includes("samantha")) {
        return "Art3mis, the fierce Gunter, danced with Parzival and fought IOI. She’d say, ‘Keep your eyes on the prize!’";
    } else if (input.includes("ioi") || input.includes("sorrento")) {
        return "IOI and Sorrento are the enemy, chasing control of the OASIS. Watch out for Sixers—they’re everywhere!";
    } else if (input.includes("oasis")) {
        return "The OASIS: a virtual universe where reality fades and 80s dreams thrive. Explore, fight, win—Halliday’s legacy awaits!";
    } else if (input.includes("key") || input.includes("keys")) {
        return `You’ve found ${Object.values(keysFound).filter(k => k).length}/3 keys. Copper, Jade, Crystal—collect them all to reach Castle Anorak!`;
    } else if (input.includes("help")) {
        return "Commands: go [direction], look, examine [object], take [item], use [item], attack [enemy], solve [answer], jump, dance, sing, laugh, cry, inventory. Explore and ask me anything!";
    } else {
        return "Yes, Gunter! Keep exploring the OASIS—every step’s a clue to Halliday’s Egg!";
    }
}

function move(direction) {
    const exits = locations[currentLocation].exits;
    if (!exits[direction]) return "You can’t go that way.";
    const nextLocation = exits[direction];
    const locData = locations[nextLocation];
    if (locData.locked && (!locData.keyRequired || !inventory.includes(locData.keyRequired))) {
        return `The ${nextLocation.replace('_', ' ')} is locked. You need the ${locData.keyRequired} to enter!`;
    }
    currentLocation = nextLocation;
    score += 10;
    return describeLocation();
}

function describeLocation() {
    const loc = locations[currentLocation];
    let desc = loc.description;
    if (loc.items.length > 0) desc += ` You see: ${loc.items.join(", ")}.`;
    if (loc.enemies && loc.enemies.length > 0) desc += ` Beware: ${loc.enemies.join(", ")} lurks here!`;
    if (loc.puzzle && !puzzleSolved) desc += ` Puzzle: ${loc.puzzle}`;
    return desc;
}

function examineObject(object) {
    const locItems = locations[currentLocation].items || [];
    if (locItems.includes(object)) {
        score += 5;
        return `You examine the ${object}. It’s a piece of the OASIS puzzle—straight from Halliday’s world!`;
    }
    if (inventory.includes(object)) {
        if (object === "copper key") return "The Copper Key gleams—first step to the Egg!";
        if (object === "jade key") return "The Jade Key shines—second clue unlocked!";
        if (object === "crystal key") return "The Crystal Key sparkles—final gate awaits!";
        return `You examine the ${object} in your inventory. Ready for action!`;
    }
    return `You examine ${object}. It’s intriguing, but not here or in your pack.`;
}

function takeItem(item) {
    const locItems = locations[currentLocation].items || [];
    if (locItems.includes(item)) {
        inventory.push(item);
        locations[currentLocation].items = locItems.filter(i => i !== item);
        score += 20;
        if (item === "copper key") keysFound.copper = true;
        if (item === "jade key") keysFound.jade = true;
        if (item === "crystal key") keysFound.crystal = true;
        return `You take the ${item}. Nice find, Gunter!`;
    }
    return `There’s no ${item} here to take.`;
}

function useItem(item) {
    if (!inventory.includes(item)) return `You don’t have a ${item}.`;
    if (item === "VR headset" && currentLocation === "middletown") {
        return "You strap on the VR headset and jack into the OASIS—neon lights flood your vision!";
    }
    if (item === "dance shoes" && currentLocation === "distracted_globe") {
        score += 50;
        return "You slip on the dance shoes and glide like Parzival—50 points for style!";
    }
    if (item === "blaster" && locations[currentLocation].enemies.length > 0) {
        return attack(locations[currentLocation].enemies[0]);
    }
    if (item === "quarter" && currentLocation === "castle_anorak") {
        return "You insert the quarter into the Atari 2600. Ready for Adventure!";
    }
    return `You use the ${item}. Something happens, but not much here!`;
}

function attack(target) {
    const enemies = locations[currentLocation].enemies || [];
    if (!enemies.includes(target)) return `There’s no ${target} to attack here.`;
    if (!inventory.includes("blaster")) {
        score -= 10;
        return `You swing at ${target} with bare hands—ouch! Lose 10 points. Get a blaster!`;
    }
    locations[currentLocation].enemies = enemies.filter(e => e !== target);
    score += 30;
    enemiesDefeated++;
    return `You blast ${target} with your blaster—like Parzival vs. IOI! 30 points!`;
}

function solvePuzzle(answer) {
    const loc = locations[currentLocation];
    if (!loc.puzzle || puzzleSolved) return "No puzzle here to solve.";
    if (currentLocation === "ludus" && answer === "tomb of horrors") {
        puzzleSolved = true;
        score += 50;
        return "Correct! Halliday loved Tomb of Horrors. 50 points!";
    }
    if (currentLocation === "wargames_sim" && answer === "play") {
        puzzleSolved = true;
        score += 50;
        return "You play tic-tac-toe and win like Joshua! Jade Key unlocked—50 points!";
    }
    if (currentLocation === "shining_maze" && answer === "237") {
        puzzleSolved = true;
        score += 50;
        return "Room 237—spot on! Crystal Key unlocked—50 points!";
    }
    if (currentLocation === "castle_anorak" && answer === "play adventure") {
        if (keysFound.copper && keysFound.jade && keysFound.crystal) {
            score += 1000;
            return "You play Adventure, find the Easter Egg, and win Halliday’s prize! 1000 points—Game Over, Gunter! You rule the OASIS!";
        }
        return "You need all three keys to win Adventure. Keep hunting!";
    }
    return "Wrong answer, Gunter! Try again.";
}

function showInventory() {
    if (inventory.length === 0) return "Your inventory is empty.";
    return `You have: ${inventory.join(", ")}.`;
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
    const keysElement = document.getElementById('keys-found');
    if (!scoreElement || !invList || !keysElement) {
        console.error('[Client] UI elements not found');
        return;
    }
    scoreElement.textContent = score;
    invList.innerHTML = inventory.map(item => `<li>${item}</li>`).join("");
    keysElement.textContent = `Keys: ${Object.values(keysFound).filter(k => k).length}/3`;
}
