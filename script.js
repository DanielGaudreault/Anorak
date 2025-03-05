let currentLocation = "middletown";
let inventory = [];
let score = 0;
let keysFound = { copper: false, jade: false, crystal: false };
let enemiesDefeated = 0;
let puzzlesSolved = { ludus: false, wargames: false, shining: false, adventure: false };
let lastInput = "";

const locations = {
    middletown: {
        description: "Middletown, Ohio, 2045—a gritty sprawl of trailer stacks under a gray sky. A VR parlor pulses with neon, your entry to the OASIS. North to Ludus, east to the Distracted Globe, south to IOI Plaza, west to the Stacks.",
        exits: { north: "ludus", east: "distracted_globe", south: "ioi_plaza", west: "stacks" },
        items: ["VR visor"],
        enemies: [],
        puzzle: null
    },
    ludus: {
        description: "Ludus, the OASIS school planet, buzzes with 80s nostalgia—think *Ferris Bueller* vibes. A race portal shimmers. North to the Tomb of Horrors, east to the Copper Gate, south to the Race Start, west to Middletown.",
        exits: { north: "tomb_of_horrors", east: "copper_gate", south: "race_start", west: "middletown" },
        items: ["halliday’s journal"],
        enemies: [],
        puzzle: "What’s Halliday’s favorite D&D module? (Hint: It’s a deadly dungeon nearby.)"
    },
    tomb_of_horrors: {
        description: "The Tomb of Horrors, a skull-shaped cave from Halliday’s D&D days. Acererak the lich guards the Copper Key with glowing eyes. South to Ludus.",
        exits: { south: "ludus" },
        items: ["copper key"],
        enemies: ["acererak"],
        puzzle: null
    },
    race_start: {
        description: "The race starting line from the movie—roaring engines and a DeLorean gleam. Beat the track to win a prize. North to Ludus.",
        exits: { north: "ludus" },
        items: ["delorean"],
        enemies: ["kong"],
        puzzle: "Type 'race' to speed through the track!"
    },
    copper_gate: {
        description: "The Copper Gate towers over you, etched with 80s glyphs. It needs the Copper Key. East to the Jade Gate, west to Ludus.",
        exits: { east: "jade_gate", west: "ludus" },
        items: [],
        enemies: [],
        locked: true,
        keyRequired: "copper key"
    },
    jade_gate: {
        description: "The Jade Gate glows green, surrounded by arcade cabinets. It demands the Jade Key. East to the Crystal Gate, west to Copper Gate, north to Planet Doom.",
        exits: { east: "crystal_gate", west: "copper_gate", north: "planet_doom" },
        items: [],
        enemies: [],
        locked: true,
        keyRequired: "jade key"
    },
    crystal_gate: {
        description: "The Crystal Gate sparkles like the movie’s final challenge. It requires the Crystal Key. West to Jade Gate, north to Castle Anorak.",
        exits: { west: "jade_gate", north: "castle_anorak" },
        items: [],
        enemies: [],
        locked: true,
        keyRequired: "crystal key"
    },
    distracted_globe: {
        description: "The Distracted Globe, a zero-gravity club thumping with ‘Blue Monday.’ Avatars float and flirt. West to Middletown, south to WarGames Sim.",
        exits: { west: "middletown", south: "wargames_sim" },
        items: ["dance boots"],
        enemies: [],
        puzzle: null
    },
    wargames_sim: {
        description: "A *WarGames* sim—NORAD screens flicker. The Jade Key awaits behind a tic-tac-toe challenge. North to Distracted Globe.",
        exits: { north: "distracted_globe" },
        items: ["jade key"],
        enemies: [],
        puzzle: "Win tic-tac-toe against Joshua. Type 'play' to start."
    },
    ioi_plaza: {
        description: "IOI Plaza, a sterile fortress of Sixers hunting Gunters. Sorrento’s shadow looms. North to Middletown, east to Planet Doom.",
        exits: { north: "middletown", east: "planet_doom" },
        items: ["sixer badge"],
        enemies: ["sixer_guard"],
        puzzle: null
    },
    stacks: {
        description: "The Stacks—rusted trailers tower outside the OASIS. A hidden portal hums with promise. East to Middletown.",
        exits: { east: "middletown" },
        items: ["oasis coin"],
        enemies: [],
        puzzle: null
    },
    planet_doom: {
        description: "Planet Doom, a warzone of mechs and chaos from the movie’s final battle. IOI forces swarm. South to IOI Plaza, west to Jade Gate, north to Shining Maze.",
        exits: { south: "ioi_plaza", west: "jade_gate", north: "shining_maze" },
        items: ["plasma rifle"],
        enemies: ["ioi_mech"],
        puzzle: null
    },
    shining_maze: {
        description: "The Shining Maze—hedges twist like the Overlook Hotel. The Crystal Key glints ahead. South to Planet Doom.",
        exits: { south: "planet_doom" },
        items: ["crystal key"],
        enemies: [],
        puzzle: "What’s the room number Wade enters in The Shining? (Three digits.)"
    },
    castle_anorak: {
        description: "Castle Anorak, Halliday’s stronghold. An Atari 2600 hums with the final test. South to Crystal Gate.",
        exits: { south: "crystal_gate" },
        items: ["golden egg"],
        enemies: [],
        puzzle: "Play Adventure to win the Egg. Type 'play adventure' with all keys."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Client] DOM loaded');
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    appendMessage('Anorak', "Greetings, Gunter! I’m Anorak, Halliday’s avatar, here to guide you through the OASIS. The Easter Egg hunt begins—type 'look' to start!");
    updateUI();
});

async function sendMessage() {
    const userInputElement = document.getElementById('user-input');
    if (!userInputElement) {
        console.error('[Client] Input element not found');
        return;
    }
    const userInput = userInputElement.value.trim();
    if (!userInput) return;

    appendMessage('You', userInput);
    console.log(`[Client] Sent: "${userInput}"`);
    userInputElement.value = '';

    const reply = processInput(userInput.toLowerCase());
    appendMessage('Anorak', reply);
    console.log(`[Client] Received: "${reply}"`);
    updateUI();
}

function processInput(input) {
    lastInput = input;

    // Game Commands
    if (input.startsWith("go ")) {
        const direction = input.split(" ")[1];
        return move(direction);
    } else if (input === "look") {
        return describeLocation();
    } else if (input.startsWith("examine ")) {
        const object = input.split(" ").slice(1).join(" ");
        return examineObject(object);
    } else if (input.startsWith("take ")) {
        const item = input.split(" ").slice(1).join(" ");
        return takeItem(item);
    } else if (input.startsWith("use ")) {
        const item = input.split(" ").slice(1).join(" ");
        return useItem(item);
    } else if (input === "inventory") {
        return showInventory();
    } else if (input.startsWith("attack ")) {
        const target = input.split(" ").slice(1).join(" ");
        return attack(target);
    } else if (input.startsWith("solve ") || input === "play" || input === "race" || input === "play adventure") {
        const answer = input.startsWith("solve ") ? input.split(" ").slice(1).join(" ") : input;
        return solvePuzzle(answer);
    } else if (input === "open gate" || input === "open") {
        return openGate();
    } else if (input === "jump") {
        return "You leap like Parzival dodging lasers in the race—pure 80s flair!";
    } else if (input === "dance") {
        return "You spin like Art3mis in the Globe—‘Blue Monday’ vibes all the way!";
    } else if (input === "sing") {
        return "You belt out ‘Don’t You Forget About Me’—Breakfast Club style!";
    } else if (input === "laugh") {
        return "You cackle like Halliday watching IOI flail—priceless!";
    } else if (input === "cry") {
        return "Tears fall like Wade’s after the Sixers’ ambush—stay strong, Gunter!";
    } else if (input === "hint") {
        return giveHint();
    }
    // Omniscient Responses
    else if (input.includes("halliday")) {
        return "James Donovan Halliday, born 1972, died 2040. Co-creator of the OASIS with Ogden Morrow. Obsessed with 80s culture—his Easter Egg hunt is your quest. What else do you need to know about him?";
    } else if (input.includes("egg") || input.includes("easter egg")) {
        return `The Easter Egg is Halliday’s legacy—hidden behind three gates and keys. You’ve got ${Object.values(keysFound).filter(k => k).length}/3 keys. Find them all, and Castle Anorak’s yours!`;
    } else if (input.includes("80s") || input.includes("eighties")) {
        return "The 80s—Halliday’s golden era! *Back to the Future*, *Blade Runner*, *Thriller*, *Pac-Man*—it’s all here in the OASIS. Name anything from the 80s, and I’ll tell you its tale!";
    } else if (input.includes("parzival") || input.includes("wade")) {
        return "Wade Watts, aka Parzival, the first Gunter to win the Egg in 2045. Mastered the race, danced with Art3mis, and outsmarted IOI. You’re walking his path—how’s it going?";
    } else if (input.includes("art3mis") || input.includes("samantha")) {
        return "Samantha Cook, aka Art3mis, a badass Gunter with a blog and a knack for puzzles. She teamed with Parzival to beat Sorrento. Ask me about her bike or her moves!";
    } else if (input.includes("ioi") || input.includes("sorrento")) {
        return "Innovative Online Industries, led by Nolan Sorrento, aimed to seize the OASIS. Their Sixers are ruthless—you’ve beaten " + enemiesDefeated + " so far. Watch your back!";
    } else if (input.includes("oasis")) {
        return "The OASIS: Ontologically Anthropocentric Sensory Immersive Simulation. Built by Halliday and Morrow, it’s a universe of planets, quests, and 80s dreams. You’re in " + currentLocation.replace('_', ' ') + "—what’s your next move?";
    } else if (input.includes("key") || input.includes("keys")) {
        return `Three keys unlock the Egg: Copper (${keysFound.copper ? "found" : "missing"}), Jade (${keysFound.jade ? "found" : "missing"}), Crystal (${keysFound.crystal ? "found" : "missing"}). Check " + currentLocation.replace('_', ' ') + " for clues!`;
    } else if (input.includes("aech") || input.includes("helen")) {
        return "Helen Harris, aka Aech, Parzival’s best pal and a mech maestro. Her Iron Giant saved the day. Want tips on beating Planet Doom? She’d know!";
    } else if (input.includes("ogden") || input.includes("morrow")) {
        return "Ogden Morrow, Halliday’s co-founder, left IOI’s shadow to aid the High Five. His avatar’s wisdom guides you—ask me anything, and I’ll channel him!";
    } else if (input.includes("shoto") || input.includes("daito")) {
        return "Shoto and Daito, the samurai brothers, fought with the High Five. Daito fell to IOI, but Shoto endured. Their *Gundam* spirit lives in the OASIS!";
    } else if (input.includes("race") && !input === "race") {
        return "The Copper Key race—Parzival aced it with a DeLorean! Head to Race Start and type 'race' to try your luck against Kong and the track!";
    } else if (input.includes("movie") || input.includes("ready player one")) {
        return "The *Ready Player One* movie, 2018, directed by Spielberg—pure 80s love! Wade’s quest for the Egg mirrors yours. What scene do you want dissected?";
    } else if (input.includes("help")) {
        return "Commands: go [direction], look, examine [object], take [item], use [item], attack [enemy], solve [answer], open gate, jump, dance, sing, laugh, cry, hint, inventory. Ask me anything—I know all!";
    } else {
        return `I’m Anorak, omniscient guide! "${input}"? In the OASIS, that could mean anything—here’s my take: Yes, it’s tied to Halliday’s 80s obsession somehow. Tell me more, or try a command!`;
    }
}

function move(direction) {
    const exits = locations[currentLocation].exits;
    if (!exits[direction]) return "No path that way, Gunter!";
    const nextLocation = exits[direction];
    const locData = locations[nextLocation];
    if (locData.locked && (!locData.keyRequired || !inventory.includes(locData.keyRequired))) {
        return `The ${nextLocation.replace('_', ' ')} is locked! You need the ${locData.keyRequired}.`;
    }
    currentLocation = nextLocation;
    score += 10;
    puzzleSolved = false; // Reset puzzle state for new location
    return describeLocation();
}

function describeLocation() {
    const loc = locations[currentLocation];
    let desc = loc.description;
    if (loc.items.length > 0) desc += ` Items: ${loc.items.join(", ")}.`;
    if (loc.enemies.length > 0) desc += ` Enemies: ${loc.enemies.join(", ")} threaten you!`;
    if (loc.puzzle && !puzzlesSolved[currentLocation.split('_')[0]]) desc += ` Puzzle: ${loc.puzzle}`;
    return desc;
}

function examineObject(object) {
    const locItems = locations[currentLocation].items;
    if (locItems.includes(object)) {
        score += 5;
        if (object === "copper key") return "The Copper Key—first of Halliday’s treasures!";
        if (object === "jade key") return "The Jade Key—second step to glory!";
        if (object === "crystal key") return "The Crystal Key—final gate awaits!";
        if (object === "golden egg") return "The Golden Egg—Halliday’s ultimate prize!";
        return `You examine the ${object}. A relic of the OASIS!`;
    }
    if (inventory.includes(object)) {
        if (object === "delorean") return "The DeLorean—88 mph to victory!";
        if (object === "plasma rifle") return "A plasma rifle—perfect for Sixers!";
        return `The ${object} in your inventory hums with potential.`;
    }
    return `No ${object} here or in your pack to examine.`;
}

function takeItem(item) {
    const locItems = locations[currentLocation].items;
    if (!locItems.includes(item)) return `No ${item} here to take.`;
    inventory.push(item);
    locations[currentLocation].items = locItems.filter(i => i !== item);
    score += 20;
    if (item === "copper key") keysFound.copper = true;
    if (item === "jade key") keysFound.jade = true;
    if (item === "crystal key") keysFound.crystal = true;
    if (item === "golden egg") {
        score += 1000;
        return "You take the Golden Egg! Halliday’s legacy is yours—1000 points! You win the OASIS!";
    }
    return `You take the ${item}. Score +20!`;
}

function useItem(item) {
    if (!inventory.includes(item)) return `You don’t have a ${item}.`;
    const loc = locations[currentLocation];
    if (item === "VR visor" && currentLocation === "middletown") {
        score += 10;
        return "You don the VR visor—welcome to the OASIS! +10 points!";
    }
    if (item === "delorean" && currentLocation === "race_start") {
        return solvePuzzle("race");
    }
    if (item === "dance boots" && currentLocation === "distracted_globe") {
        score += 50;
        return "You strut in the dance boots—Parzival would approve! +50 points!";
    }
    if (item === "plasma rifle" && loc.enemies.length > 0) {
        return attack(loc.enemies[0]);
    }
    if (item === "halliday’s journal") {
        return "You flip through Halliday’s journal: 'The keys are hidden in my loves—D&D, WarGames, The Shining, Adventure.'";
    }
    if (item === "sixer badge" && currentLocation === "ioi_plaza") {
        score += 30;
        return "You flash the Sixer badge—guards hesitate! +30 points!";
    }
    return `You use the ${item}, but it’s not the right place or time.`;
}

function attack(target) {
    const enemies = locations[currentLocation].enemies;
    if (!enemies.includes(target)) return `No ${target} here to attack!`;
    if (!inventory.includes("plasma rifle")) {
        score -= 10;
        return `You punch ${target}—ouch! -10 points. Grab a plasma rifle!`;
    }
    locations[currentLocation].enemies = enemies.filter(e => e !== target);
    score += 30;
    enemiesDefeated++;
    return `You blast ${target} with the plasma rifle—like the High Five vs. IOI! +30 points!`;
}

function solvePuzzle(answer) {
    const loc = locations[currentLocation];
    if (!loc.puzzle || puzzlesSolved[currentLocation.split('_')[0]]) return "No puzzle here or it’s already solved.";
    if (currentLocation === "ludus" && answer === "tomb of horrors") {
        puzzlesSolved.ludus = true;
        score += 50;
        return "Correct! Tomb of Horrors was Halliday’s fave. +50 points!";
    }
    if (currentLocation === "wargames_sim" && answer === "play") {
        puzzlesSolved.wargames = true;
        score += 50;
        return "You beat Joshua at tic-tac-toe—Jade Key unlocked! +50 points!";
    }
    if (currentLocation === "shining_maze" && answer === "237") {
        puzzlesSolved.shining = true;
        score += 50;
        return "Room 237—spot on! Crystal Key unlocked! +50 points!";
    }
    if (currentLocation === "race_start" && answer === "race") {
        if (inventory.includes("delorean")) {
            score += 100;
            return "You race the DeLorean past Kong—Copper Key clue revealed! +100 points!";
        }
        return "You need the DeLorean to race! Find it!";
    }
    if (currentLocation === "castle_anorak" && answer === "play adventure") {
        if (keysFound.copper && keysFound.jade && keysFound.crystal) {
            puzzlesSolved.adventure = true;
            score += 1000;
            return "You play Adventure, dodge the dragons, and claim the Golden Egg! +1000 points—You’re Halliday’s Heir!";
        }
        return "You need all three keys to win Adventure. Keep hunting!";
    }
    return "Wrong answer! Try again or ask for a hint.";
}

function openGate() {
    const loc = locations[currentLocation];
    if (!loc.locked) return "No gate here needs opening.";
    const gateName = currentLocation.replace('_', ' ');
    if (!loc.keyRequired) return `The ${gateName} doesn’t need a key—just explore!`;
    if (inventory.includes(loc.keyRequired)) {
        loc.locked = false;
        score += 50;
        return `You use the ${loc.keyRequired} to unlock the ${gateName}! +50 points—onward, Gunter!`;
    }
    return `The ${gateName} is locked—you need the ${loc.keyRequired}!`;
}

function giveHint() {
    const loc = locations[currentLocation];
    if (currentLocation === "ludus") return "Halliday loved D&D—think of a famous deadly dungeon.";
    if (currentLocation === "wargames_sim") return "Joshua loves games—challenge him directly!";
    if (currentLocation === "shining_maze") return "The room number’s a three-digit classic from Kubrick.";
    if (currentLocation === "race_start") return "A certain time-traveling car is your ticket to victory.";
    if (currentLocation === "castle_anorak") return "All three keys unlock Adventure—have you got them?";
    return "Explore, Gunter! Check items, enemies, and exits—something here’s a clue!";
}

function showInventory() {
    if (inventory.length === 0) return "Your inventory’s empty—time to hunt!";
    return `Inventory: ${inventory.join(", ")}.`;
}

function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    const scoreElement = document.getElementById('score');
    const invList = document.getElementById('inventory-list');
    const keysElement = document.getElementById('keys-found');
    const statusElement = document.getElementById('status');
    if (!scoreElement || !invList || !keysElement || !statusElement) return;

    scoreElement.textContent = score;
    invList.innerHTML = inventory.map(item => `<li>${item}</li>`).join("");
    keysElement.textContent = `Keys: ${Object.values(keysFound).filter(k => k).length}/3`;
    let status = "Gunter";
    if (score >= 500) status = "High Five";
    if (score >= 1500) status = "Halliday’s Heir";
    statusElement.textContent = `Status: ${status}`;
}
