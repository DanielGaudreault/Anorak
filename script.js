// ====================
// GAME STATE & CONFIG
// ====================
let gameState = {
    currentLocation: "middletown",
    inventory: [],
    score: 0,
    keysFound: { copper: false, jade: false, crystal: false },
    enemiesDefeated: 0,
    puzzlesSolved: { ludus: false, wargames: false, shining: false, adventure: false },
    gameCompleted: false,
    lastInput: "",
    playerStatus: "Gunter",
    health: 100,
    energy: 100,
    time: "day" // day/night cycle
};

// ====================
// LOCATION DEFINITIONS
// ====================
const locations = {
    middletown: {
        description: "Middletown, Ohio, 2045—a gritty sprawl of trailer stacks under a gray sky. A VR parlor pulses with neon, your entry to the OASIS. North to Ludus, east to the Distracted Globe, south to IOI Plaza, west to the Stacks.",
        exits: { north: "ludus", east: "distracted_globe", south: "ioi_plaza", west: "stacks" },
        items: ["VR visor", "energy drink"],
        enemies: [],
        puzzle: null,
        special: "The neon lights flicker as you prepare to enter the OASIS."
    },
    // ... (other locations with expanded descriptions and features)
    castle_anorak: {
        description: "Castle Anorak, Halliday's stronghold. An Atari 2600 hums with the final test. South to Crystal Gate.",
        exits: { south: "crystal_gate" },
        items: ["golden egg"],
        enemies: [],
        puzzle: "Play Adventure to win the Egg. Type 'play adventure' with all keys.",
        special: "The castle shimmers with 8-bit glory. This is it - the final challenge!"
    }
};

// ====================
// ENEMY DEFINITIONS
// ====================
const enemies = {
    acererak: {
        name: "Acererak",
        health: 80,
        attack: 15,
        defense: 10,
        loot: ["copper key", "ancient scroll"],
        dialogue: ["'Foolish mortal! The Tomb claims another victim!'", "'Your bones will join my collection!'"]
    },
    // ... (other enemies with stats and behaviors)
};

// ====================
// ITEM DEFINITIONS
// ====================
const itemDetails = {
    "VR visor": {
        description: "A high-end OASIS visor with haptic feedback.",
        use: "Required to access the OASIS. Provides +10 energy when used.",
        value: 50
    },
    // ... (detailed item definitions)
};

// ====================
// CORE GAME FUNCTIONS
// ====================

function initializeGame() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Game Initialized]');
        setupEventListeners();
        updateTimeCycle();
        appendMessage('Anorak', "Greetings, Gunter! I'm Anorak, Halliday's avatar. The Easter Egg hunt begins—type 'look' to start or 'help' for commands!");
        updateUI();
    });
}

function setupEventListeners() {
    document.getElementById('send-btn').addEventListener('click', processUserInput);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processUserInput();
    });
}

function processUserInput() {
    const inputElement = document.getElementById('user-input');
    const userInput = inputElement.value.trim();
    if (!userInput) return;

    appendMessage('You', userInput);
    inputElement.value = '';
    
    const response = handleInput(userInput.toLowerCase());
    appendMessage('Anorak', response);
    updateUI();
}

function handleInput(input) {
    gameState.lastInput = input;

    // Core game commands
    const commandHandlers = {
        "go ": () => handleMovement(input.split(" ")[1]),
        "look": describeLocation,
        "examine ": () => examineObject(input.split(" ").slice(1).join(" ")),
        "take ": () => takeItem(input.split(" ").slice(1).join(" ")),
        "use ": () => useItem(input.split(" ").slice(1).join(" ")),
        "inventory": showInventory,
        "attack ": () => attackEnemy(input.split(" ").slice(1).join(" ")),
        "solve ": () => solvePuzzle(input.split(" ").slice(1).join(" ")),
        "play": () => handleMiniGame(input),
        "open": openGate,
        "status": showPlayerStatus,
        "map": showMap,
        "save": saveGame,
        "load": loadGame
    };

    // Check for matching command
    for (const [prefix, handler] of Object.entries(commandHandlers)) {
        if (input.startsWith(prefix)) {
            return handler();
        }
    }

    // Emotes and fun actions
    const emotes = {
        "jump": "You leap like Parzival dodging lasers—pure 80s flair!",
        "dance": "You spin like Art3mis in the Globe to 'Blue Monday'!",
        "sing": "You belt out 'Don't You Forget About Me'—Breakfast Club style!",
        "laugh": "You cackle like Halliday watching IOI fail!",
        "cry": "Tears fall like Wade's after the Sixers' ambush—stay strong!",
        "meditate": "You channel your focus, restoring 20 energy.",
        "flex": "You show off like a classic 80s action hero!"
    };

    if (emotes[input]) {
        if (input === "meditate") gameState.energy = Math.min(100, gameState.energy + 20);
        return emotes[input];
    }

    // Lore and information queries
    return handleLoreQuery(input);
}

// ====================
// GAME MECHANICS
// ====================

function handleMovement(direction) {
    const currentLoc = locations[gameState.currentLocation];
    if (!currentLoc.exits[direction]) return "No path that way!";

    const nextLocation = currentLoc.exits[direction];
    const destination = locations[nextLocation];

    // Check for locked locations
    if (destination.locked && !gameState.inventory.includes(destination.keyRequired)) {
        return `The ${nextLocation.replace('_', ' ')} is locked! You need: ${destination.keyRequired}.`;
    }

    // Movement costs
    gameState.energy = Math.max(0, gameState.energy - 5);
    if (gameState.energy <= 0) return "You're too exhausted to move! Rest or find energy.";

    gameState.currentLocation = nextLocation;
    gameState.score += 10;
    
    // Random encounters
    if (Math.random() < 0.3 && destination.enemies.length > 0) {
        const enemy = destination.enemies[0];
        return `${describeLocation()}\n\nA ${enemy} blocks your path! Type 'attack ${enemy}' to fight!`;
    }
    
    return describeLocation();
}

function describeLocation() {
    const loc = locations[gameState.currentLocation];
    let description = `[${gameState.time.toUpperCase()}] ${loc.description}\n\n`;
    
    // Show items
    if (loc.items.length > 0) {
        description += `You see: ${loc.items.join(", ")}\n`;
    }
    
    // Show exits
    description += `Exits: ${Object.keys(loc.exits).join(", ")}\n`;
    
    // Show puzzle if unsolved
    if (loc.puzzle && !gameState.puzzlesSolved[gameState.currentLocation.split('_')[0]]) {
        description += `\nPuzzle: ${loc.puzzle}\n`;
    }
    
    // Special location effects
    if (loc.special) description += `\n${loc.special}\n`;
    
    return description;
}

function attackEnemy(enemyName) {
    const currentLoc = locations[gameState.currentLocation];
    if (!currentLoc.enemies.includes(enemyName)) {
        return `No ${enemyName} here to fight!`;
    }

    const enemy = enemies[enemyName.replace(' ', '_')];
    if (!enemy) return "Invalid enemy!";

    // Combat logic
    let combatLog = `You attack ${enemyName}!\n`;
    const playerAttack = Math.floor(Math.random() * 20) + 10;
    const enemyDamage = Math.max(0, playerAttack - enemy.defense);
    
    enemy.health -= enemyDamage;
    combatLog += `You deal ${enemyDamage} damage! ${enemyName} health: ${enemy.health}\n`;
    
    // Enemy counterattack
    if (enemy.health > 0) {
        const enemyAttack = Math.floor(Math.random() * enemy.attack) + 5;
        gameState.health -= enemyAttack;
        combatLog += `${enemyName} hits you for ${enemyAttack} damage! Your health: ${gameState.health}\n`;
        combatLog += `"${enemy.dialogue[Math.floor(Math.random() * enemy.dialogue.length)]}"\n`;
    } else {
        // Enemy defeated
        combatLog += `You defeated ${enemyName}!\n`;
        currentLoc.enemies = currentLoc.enemies.filter(e => e !== enemyName);
        gameState.enemiesDefeated++;
        gameState.score += 50;
        
        // Drop loot
        if (enemy.loot && enemy.loot.length > 0) {
            const droppedItem = enemy.loot[Math.floor(Math.random() * enemy.loot.length)];
            currentLoc.items.push(droppedItem);
            combatLog += `${enemyName} dropped: ${droppedItem}\n`;
        }
    }
    
    // Check player health
    if (gameState.health <= 0) {
        gameState.health = 50; // Respawn with half health
        gameState.currentLocation = "middletown";
        combatLog += "\nYou were knocked out and woke up in Middletown! (Health restored to 50)";
    }
    
    return combatLog;
}

// ====================
// INVENTORY SYSTEM
// ====================

function takeItem(itemName) {
    const currentLoc = locations[gameState.currentLocation];
    const itemIndex = currentLoc.items.findIndex(i => i.toLowerCase() === itemName.toLowerCase());
    
    if (itemIndex === -1) return `No ${itemName} here to take.`;
    
    const item = currentLoc.items[itemIndex];
    gameState.inventory.push(item);
    currentLoc.items.splice(itemIndex, 1);
    gameState.score += 20;
    
    // Special item handling
    if (item.includes("key")) {
        const keyType = item.split(" ")[0];
        gameState.keysFound[keyType] = true;
        return `You took the ${item}! ${keyType.charAt(0).toUpperCase() + keyType.slice(1)} Key acquired!`;
    }
    
    return `You took the ${item}.`;
}

function useItem(itemName) {
    const itemIndex = gameState.inventory.findIndex(i => i.toLowerCase() === itemName.toLowerCase());
    if (itemIndex === -1) return `You don't have ${itemName}.`;
    
    const item = gameState.inventory[itemIndex];
    const currentLoc = locations[gameState.currentLocation];
    
    // Item-specific effects
    switch(item.toLowerCase()) {
        case "vr visor":
            if (gameState.currentLocation === "middletown") {
                gameState.energy += 10;
                return "You don the VR visor—energy restored! Welcome to the OASIS!";
            }
            return "You're already in the OASIS!";
            
        case "energy drink":
            gameState.energy = Math.min(100, gameState.energy + 30);
            gameState.inventory.splice(itemIndex, 1);
            return "You chug the energy drink—+30 energy!";
            
        case "plasma rifle":
            if (currentLoc.enemies.length > 0) {
                return attackEnemy(currentLoc.enemies[0]);
            }
            return "No enemies here to shoot!";
            
        default:
            return `You use the ${item}, but nothing special happens.`;
    }
}

// ====================
// PUZZLE SYSTEM
// ====================

function solvePuzzle(answer) {
    const currentLoc = locations[gameState.currentLocation];
    const locKey = gameState.currentLocation.split('_')[0];
    
    if (!currentLoc.puzzle || gameState.puzzlesSolved[locKey]) {
        return "No puzzle here or it's already solved!";
    }
    
    let response = "";
    let solved = false;
    
    switch(gameState.currentLocation) {
        case "ludus":
            solved = answer.includes("tomb of horrors");
            response = solved ? "Correct! The Tomb of Horrors awaits north!" : "Wrong! Think deadly D&D modules.";
            break;
            
        case "wargames_sim":
            solved = answer === "play" || answer.includes("tic-tac-toe");
            response = solved ? "You beat Joshua! The Jade Key is yours!" : "Try challenging Joshua directly!";
            break;
            
        case "shining_maze":
            solved = answer === "237";
            response = solved ? "Room 237! The Crystal Key appears!" : "Wrong room number!";
            break;
            
        case "castle_anorak":
            if (answer.includes("play adventure")) {
                solved = gameState.keysFound.copper && gameState.keysFound.jade && gameState.keysFound.crystal;
                response = solved ? 
                    "You complete Adventure and claim the Golden Egg! YOU WIN!" : 
                    "You need all three keys first!";
            }
            break;
    }
    
    if (solved) {
        gameState.puzzlesSolved[locKey] = true;
        gameState.score += 100;
        if (gameState.currentLocation === "castle_anorak" && solved) {
            gameState.gameCompleted = true;
            gameState.score += 1000;
        }
    }
    
    return response || "That doesn't solve anything here.";
}

// ====================
// UI FUNCTIONS
// ====================

function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    // Update score display
    document.getElementById('score').textContent = gameState.score;
    
    // Update inventory list
    const invList = document.getElementById('inventory-list');
    invList.innerHTML = gameState.inventory.map(item => 
        `<li>${item}${itemDetails[item] ? ` (${itemDetails[item].value}pts)` : ''}</li>`
    ).join("");
    
    // Update key progress
    const keysFound = Object.values(gameState.keysFound).filter(k => k).length;
    document.getElementById('keys-found').textContent = `Keys: ${keysFound}/3`;
    
    // Update player status
    let status = "Gunter";
    if (gameState.score >= 500) status = "High Five";
    if (gameState.score >= 1500) status = "Halliday's Heir";
    if (gameState.gameCompleted) status = "Egg Champion";
    gameState.playerStatus = status;
    
    document.getElementById('status').textContent = `Status: ${status}`;
    document.getElementById('health').textContent = `Health: ${gameState.health}`;
    document.getElementById('energy').textContent = `Energy: ${gameState.energy}`;
    document.getElementById('location').textContent = `Location: ${gameState.currentLocation.replace('_', ' ')}`;
    
    // Visual time indicator
    document.body.className = gameState.time;
}

// ====================
// GAME ENHANCEMENTS
// ====================

function updateTimeCycle() {
    // Rotate between day and night every 2 minutes
    setInterval(() => {
        gameState.time = gameState.time === "day" ? "night" : "day";
        updateUI();
        
        // Nighttime effects
        if (gameState.time === "night") {
            const currentLoc = locations[gameState.currentLocation];
            if (currentLoc.enemies.length > 0) {
                appendMessage('System', "Enemies grow more aggressive at night!");
            }
        }
    }, 120000);
}

function showMap() {
    const playerLoc = gameState.currentLocation;
    let map = "OASIS Map:\n";
    
    for (const [loc, data] of Object.entries(locations)) {
        map += `\n${loc === playerLoc ? '> ' : '  '}${loc.replace('_', ' ')}`;
        if (data.locked && !gameState.keysFound[data.keyRequired?.split(' ')[0]])) {
            map += ` [LOCKED]`;
        }
    }
    
    return map;
}

function saveGame() {
    localStorage.setItem('anorak_save', JSON.stringify(gameState));
    return "Game saved! You can quit and return later.";
}

function loadGame() {
    const save = localStorage.getItem('anorak_save');
    if (!save) return "No saved game found!";
    
    gameState = JSON.parse(save);
    return "Game loaded! Welcome back, Gunter.";
}

// ====================
// LORE & DIALOGUE
// ====================

function handleLoreQuery(input) {
    const lore = {
        "halliday": "James Donovan Halliday, OASIS co-creator. Born 1972, died 2040. Obsessed with 80s pop culture and classic games.",
        "egg": `The Easter Egg is Halliday's ultimate prize. You have ${Object.values(gameState.keysFound).filter(k => k).length}/3 keys needed to find it.`,
        "oasis": "The OASIS: Ontologically Anthropocentric Sensory Immersive Simulation. A virtual universe where most of humanity now spends their time.",
        "parzival": "Wade Watts' avatar name. The first to win Halliday's contest in 2045.",
        "art3mis": "Samantha Cook's avatar. A famous gunter and blogger who helped Parzival defeat IOI.",
        "ioi": "Innovative Online Industries. The corporate villains trying to control the OASIS.",
        "help": `Available commands:
        - Movement: go [direction], look
        - Items: take [item], use [item], inventory
        - Combat: attack [enemy]
        - Puzzles: solve [answer], play [game]
        - System: save, load, status, map
        - Fun: jump, dance, sing, meditate
        Ask about any Ready Player One character or concept!`
    };
    
    for (const [keyword, response] of Object.entries(lore)) {
        if (input.includes(keyword)) return response;
    }
    
    return `"${input}"? Interesting! In the OASIS, that could relate to Halliday's 80s obsessions. Try being more specific or type 'help' for commands.`;
}

// Start the game
initializeGame();
