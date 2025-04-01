// ====================
// GAME INITIALIZATION
// ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function initializeGame() {
    // Load saved game if available
    if (localStorage.getItem('anorak_save')) {
        if (confirm('Load saved game?')) {
            loadGame();
        }
    }

    // Setup audio
    const music = document.getElementById('music');
    music.volume = 0.3;
    music.play().catch(e => console.log('Auto-play prevented:', e));

    // Setup event listeners
    setupEventListeners();
    
    // Start game clock
    startGameClock();
    
    // Initial game message
    appendMessage('Anorak', "Greetings, Gunter! I'm Anorak, Halliday's avatar. The Easter Egg hunt begins!");
    appendMessage('Anorak', "Type 'look' to examine your surroundings or 'help' for commands.");
    updateUI();
}

// ====================
// EVENT HANDLERS
// ====================
function setupEventListeners() {
    // Main input handler
    document.getElementById('send-btn').addEventListener('click', processUserInput);
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processUserInput();
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

    // Enable tooltips
    tippy('[data-tippy-content]', {
        arrow: true,
        animation: 'scale',
        duration: 100,
    });
}

// ====================
// CORE GAME FUNCTIONS
// ====================
function processUserInput() {
    const inputElement = document.getElementById('user-input');
    const userInput = inputElement.value.trim();
    if (!userInput) return;

    appendMessage('You', userInput);
    inputElement.value = '';
    playSound('click');
    
    const response = handleInput(userInput.toLowerCase());
    appendMessage('Anorak', response);
    updateUI();
}

function handleInput(input) {
    // Command processing logic (as in previous enhanced version)
    // ...
}

// ====================
// AUDIO FUNCTIONS
// ====================
function playSound(type) {
    const sound = document.getElementById(`${type}-sound`);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play prevented:', e));
    }
}

function setMusicVolume(volume) {
    document.getElementById('music').volume = volume;
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
    // Update all UI elements based on gameState
    // ...
}

// ====================
// GAME CLOCK & EFFECTS
// ====================
function startGameClock() {
    // Update time every minute (day/night cycle)
    setInterval(() => {
        gameState.time = gameState.time === "day" ? "night" : "day";
        document.body.className = gameState.time;
        updateUI();
        
        if (gameState.time === "night") {
            appendMessage('System', "Night falls in the OASIS... Enemies grow more aggressive!");
        } else {
            appendMessage('System', "A new day dawns in the OASIS!");
        }
    }, 60000); // 1 minute intervals
}

// ====================
// SAVE/LOAD SYSTEM
// ====================
function saveGame() {
    localStorage.setItem('anorak_save', JSON.stringify(gameState));
    return "Game saved successfully!";
}

function loadGame() {
    const saveData = localStorage.getItem('anorak_save');
    if (saveData) {
        gameState = JSON.parse(saveData);
        return "Game loaded successfully! Welcome back, Gunter.";
    }
    return "No saved game found!";
}

// ====================
// TOOLTIPS (using Tippy.js)
// ====================
function initializeTooltips() {
    // Add tooltips to items and commands
    document.querySelectorAll('[data-tippy-content]').forEach(el => {
        tippy(el, {
            arrow: true,
            animation: 'scale'
        });
    });
}
