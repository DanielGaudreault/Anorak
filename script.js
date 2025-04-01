// ====================
// GAME STATE
// ====================
const gameState = {
    currentLocation: "middletown",
    inventory: [],
    score: 0,
    keysFound: { copper: false, jade: false, crystal: false },
    enemiesDefeated: 0,
    puzzlesSolved: { ludus: false, wargames: false, shining: false, adventure: false },
    gameCompleted: false,
    health: 100,
    energy: 100,
    time: "day",
    musicEnabled: true
};

// ====================
// GAME INITIALIZATION
// ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    // Setup audio
    const music = document.getElementById('music');
    music.volume = 0.3;
    
    // Try to play music (will fail without user interaction)
    const playMusic = () => {
        music.play().catch(e => {
            console.log('Audio playback prevented:', e);
            document.getElementById('music').style.display = 'none';
        });
    };
    
    // Play music on any user interaction
    document.addEventListener('click', function handler() {
        playMusic();
        document.removeEventListener('click', handler);
    });

    // Setup event listeners
    setupEventListeners();
    
    // Initialize tooltips
    tippy('[data-tippy-content]', {
        arrow: true,
        animation: 'scale',
        duration: 100,
        theme: 'translucent'
    });
    
    // Start game clock
    startGameClock();
    
    // Initial UI update
    updateUI();
}

// ====================
// EVENT HANDLERS
// ====================
function setupEventListeners() {
    // Main input handler
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    
    sendBtn.addEventListener('click', processUserInput);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUserInput();
        }
    });
    
    // Quick command buttons
    document.querySelectorAll('.cmd-btn, .emote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const command = e.target.getAttribute('data-cmd');
            document.getElementById('user-input').value = command;
            processUserInput();
            playSound('click');
        });
    });
    
    // Focus input on page load
    userInput.focus();
}

// ====================
// CORE GAME FUNCTIONS
// ====================
function processUserInput() {
    const inputElement = document.getElementById('user-input');
    const userInput = inputElement.value.trim();
    
    if (!userInput) {
        inputElement.focus();
        return;
    }
    
    appendMessage('YOU', userInput);
    inputElement.value = '';
    playSound('click');
    
    const response = handleInput(userInput.toLowerCase());
    appendMessage('ANORAK', response);
    
    // Always keep input focused
    inputElement.focus();
    updateUI();
}

function handleInput(input) {
    // Basic commands
    if (input === 'look') return describeLocation();
    if (input === 'inventory') return showInventory();
    if (input === 'map') return showMap();
    if (input === 'help') return showHelp();
    
    // Movement commands
    if (input.startsWith('go ')) {
        const direction = input.split(' ')[1];
        return move(direction);
    }
    
    // Item interactions
    if (input.startsWith('take ')) {
        const item = input.substring(5);
        return takeItem(item);
    }
    
    if (input.startsWith('use ')) {
        const item = input.substring(4);
        return useItem(item);
    }
    
    if (input.startsWith('examine ')) {
        const item = input.substring(8);
        return examineItem(item);
    }
    
    // Combat
    if (input.startsWith('attack ')) {
        const enemy = input.substring(7);
        return attackEnemy(enemy);
    }
    
    // Puzzles
    if (input.startsWith('solve ')) {
        const answer = input.substring(6);
        return solvePuzzle(answer);
    }
    
    // Special actions
    if (input === 'play adventure') return solvePuzzle('play adventure');
    if (input === 'play') return solvePuzzle('play');
    if (input === 'race') return solvePuzzle('race');
    
    // Emotes
    if (input === 'jump') return "You leap like Parzival dodging lasers!";
    if (input === 'dance') return "You bust moves like Art3mis at the Distracted Globe!";
    if (input === 'sing') return "You belt out an 80s classic with perfect pitch!";
    
    // System commands
    if (input === 'save') return saveGame();
    if (input === 'load') return loadGame();
    
    // Default response
    return "I don't understand that command. Type 'help' for available commands.";
}

// ====================
// GAME MECHANICS
// ====================
function move(direction) {
    const current = locations[gameState.currentLocation];
    if (!current.exits[direction]) {
        playSound('error');
        return `You can't go ${direction} from here.`;
    }
    
    const nextLocation = current.exits[direction];
    const destination = locations[nextLocation];
    
    // Check if location is locked
    if (destination.locked) {
        if (!gameState.inventory.includes(destination.keyRequired)) {
            playSound('error');
            return `The ${nextLocation.replace('_', ' ')} is locked! You need the ${destination.keyRequired}.`;
        }
    }
    
    // Move to new location
    gameState.currentLocation = nextLocation;
    gameState.score += 10;
    gameState.energy = Math.max(0, gameState.energy - 5);
    
    if (gameState.energy <= 0) {
        gameState.energy = 0;
        return `You're too exhausted to move! Rest or find energy.`;
    }
    
    playSound('click');
    return describeLocation();
}

function describeLocation() {
    const loc = locations[gameState.currentLocation];
    let description = `[${gameState.time.toUpperCase()}] ${loc.description}\n\n`;
    
    // List items
    if (loc.items.length > 0) {
        description += `YOU SEE: ${loc.items.join(', ').toUpperCase()}\n`;
    }
    
    // List exits
    description += `EXITS: ${Object.keys(loc.exits).join(', ').toUpperCase()}\n`;
    
    // Show puzzle if available
    if (loc.puzzle && !gameState.puzzlesSolved[gameState.currentLocation.split('_')[0]]) {
        description += `\nPUZZLE: ${loc.puzzle.toUpperCase()}\n`;
    }
    
    // Special location effects
    if (loc.special) description += `\n${loc.special.toUpperCase()}\n`;
    
    return description;
}

// ====================
// INVENTORY SYSTEM
// ====================
function takeItem(itemName) {
    const currentLoc = locations[gameState.currentLocation];
    const itemIndex = currentLoc.items.findIndex(i => i.toLowerCase() === itemName.toLowerCase());
    
    if (itemIndex === -1) {
        playSound('error');
        return `There's no ${itemName} here to take.`;
    }
    
    const item = currentLoc.items[itemIndex];
    gameState.inventory.push(item);
    currentLoc.items.splice(itemIndex, 1);
    gameState.score += 20;
    
    // Special handling for keys
    if (item.includes('key')) {
        const keyType = item.split(' ')[0];
        gameState.keysFound[keyType] = true;
        playSound('key');
        return `YOU TOOK THE ${item.toUpperCase()}! ${keyType.toUpperCase()} KEY ACQUIRED!`;
    }
    
    playSound('success');
    return `YOU TOOK THE ${item.toUpperCase()}. SCORE +20!`;
}

// ====================
// UI FUNCTIONS
// ====================
function appendMessage(sender, message) {
    const chatLog = document.getElementById('chat-log');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender.toLowerCase());
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatLog.appendChild(messageElement);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateUI() {
    // Update score
    document.getElementById('score').textContent = gameState.score;
    
    // Update keys
    const keysFound = Object.values(gameState.keysFound).filter(k => k).length;
    document.getElementById('keys-found').textContent = `${keysFound}/3`;
    
    // Update status
    let status = "GUNTER";
    if (gameState.score >= 500) status = "HIGH FIVE";
    if (gameState.score >= 1500) status = "HALLIDAY'S HEIR";
    if (gameState.gameCompleted) status = "EGG CHAMPION";
    document.getElementById('status').textContent = status;
    
    // Update health and energy
    document.getElementById('health').textContent = gameState.health;
    document.getElementById('energy').textContent = gameState.energy;
    
    // Update location
    document.getElementById('location').textContent = gameState.currentLocation.toUpperCase();
    
    // Update inventory
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = gameState.inventory.map(item => 
        `<li>${item.toUpperCase()}</li>`
    ).join('');
}

// ====================
// AUDIO FUNCTIONS
// ====================
function playSound(type) {
    if (!gameState.musicEnabled) return;
    
    const sound = document.getElementById(`${type}-sound`);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play prevented:', e));
    }
}

// ====================
// GAME CLOCK
// ====================
function startGameClock() {
    setInterval(() => {
        gameState.time = gameState.time === "day" ? "night" : "day";
        document.body.className = gameState.time;
        
        if (gameState.time === "night") {
            appendMessage('SYSTEM', "NIGHT FALLS IN THE OASIS... ENEMIES GROW MORE AGGRESSIVE!");
        } else {
            appendMessage('SYSTEM', "A NEW DAY DAWNS IN THE OASIS!");
        }
        
        updateUI();
    }, 60000); // 1 minute intervals
}

// ====================
// SAVE/LOAD SYSTEM
// ====================
function saveGame() {
    localStorage.setItem('anorak_save', JSON.stringify(gameState));
    playSound('success');
    return "GAME SAVED SUCCESSFULLY!";
}

function loadGame() {
    const saveData = localStorage.getItem('anorak_save');
    if (saveData) {
        const savedState = JSON.parse(saveData);
        Object.assign(gameState, savedState);
        playSound('success');
        return "GAME LOADED SUCCESSFULLY! WELCOME BACK, GUNTER.";
    }
    playSound('error');
    return "NO SAVED GAME FOUND!";
}

// ====================
// HELP SYSTEM
// ====================
function showHelp() {
    return `AVAILABLE COMMANDS:
    
MOVEMENT:
- GO [DIRECTION] (NORTH, SOUTH, EAST, WEST)
- LOOK (EXAMINE CURRENT LOCATION)
- MAP (SHOW OASIS MAP)

ITEMS:
- TAKE [ITEM] (PICK UP AN ITEM)
- USE [ITEM] (USE AN ITEM FROM INVENTORY)
- EXAMINE [ITEM] (GET DETAILS ABOUT AN ITEM)
- INVENTORY (VIEW YOUR ITEMS)

COMBAT:
- ATTACK [ENEMY] (ENGAGE IN COMBAT)

PUZZLES:
- SOLVE [ANSWER] (ATTEMPT TO SOLVE A PUZZLE)
- PLAY (START A MINI-GAME)
- RACE (ATTEMPT THE COPPER KEY RACE)

SYSTEM:
- SAVE (SAVE YOUR PROGRESS)
- LOAD (LOAD PREVIOUS SAVE)
- HELP (SHOW THIS MESSAGE)`;
}
