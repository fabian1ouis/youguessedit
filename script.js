// Game Configuration
const difficulties = {
    easy: { min: 1, max: 50, maxScore: 100 },
    medium: { min: 1, max: 100, maxScore: 200 },
    hard: { min: 1, max: 500, maxScore: 500 }
};

let currentDifficulty = 'easy';
let randomNumber;
let attempts = 0;
let score = 0;
let timerInterval;
let timeLeft = 60;
let hintsUsed = 0;
let lastGuess = null;

// DOM Elements
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const message = document.getElementById('message');
const hint = document.getElementById('hint');
const attemptsDisplay = document.getElementById('attempts');
const scoreDisplay = document.getElementById('score');
const rangeDisplay = document.getElementById('rangeDisplay');
const themeBtn = document.getElementById('themeBtn');
const timerMode = document.getElementById('timerMode');
const timerDisplay = document.getElementById('timer');
const timeLeftSpan = document.getElementById('timeLeft');
const diffBtns = document.querySelectorAll('.diff-btn');

// Sound elements
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const winSound = document.getElementById('winSound');

// Initialize game
initGame();
loadStatistics();
loadLeaderboard();

// Event Listeners
submitBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', resetGame);
hintBtn.addEventListener('click', giveHint);
themeBtn.addEventListener('click', toggleTheme);
timerMode.addEventListener('change', toggleTimer);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.level;
        resetGame();
    });
});

// Functions
function initGame() {
    const config = difficulties[currentDifficulty];
    randomNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    attempts = 0;
    hintsUsed = 0;
    lastGuess = null;
    score = config.maxScore;
    guessInput.min = config.min;
    guessInput.max = config.max;
    rangeDisplay.textContent = `Guess a number between ${config.min} and ${config.max}`;
    updateDisplay();
}

function checkGuess() {
    const userGuess = parseInt(guessInput.value);
    const config = difficulties[currentDifficulty];
    
    if (!userGuess || userGuess < config.min || userGuess > config.max) {
        message.textContent = `Please enter a valid number between ${config.min} and ${config.max}!`;
        message.className = 'wrong';
        playSound(wrongSound);
        return;
    }
    
    attempts++;
    score = Math.max(0, score - 10);
    
    if (userGuess === randomNumber) {
        winGame();
    } else {
        const difference = Math.abs(userGuess - randomNumber);
        if (userGuess < randomNumber) {
            message.textContent = '📈 Too low! Try a higher number.';
        } else {
            message.textContent = '📉 Too high! Try a lower number.';
        }
        message.className = 'wrong';
        
        // Proximity hint
        if (lastGuess !== null) {
            const lastDiff = Math.abs(lastGuess - randomNumber);
            if (difference < lastDiff) {
                hint.textContent = '🔥 Getting warmer!';
            } else {
                hint.textContent = '🧊 Getting colder!';
            }
        }
        
        lastGuess = userGuess;
        playSound(wrongSound);
    }
    
    updateDisplay();
    guessInput.value = '';
    guessInput.focus();
}

function winGame() {
    message.textContent = `🎉 Correct! You won in ${attempts} attempts!`;
    message.className = 'correct';
    submitBtn.disabled = true;
    guessInput.disabled = true;
    hintBtn.disabled = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    playSound(winSound);
    updateStatistics(true);
    
    // Prompt for leaderboard entry
    setTimeout(() => {
        const playerName = prompt('🏆 Congratulations! Enter your name for the leaderboard:');
        if (playerName) {
            addToLeaderboard(playerName, score, attempts, currentDifficulty);
        }
    }, 1000);
}

function giveHint() {
    if (attempts === 0) {
        hint.textContent = 'Make a guess first!';
        return;
    }
    
    hintsUsed++;
    score = Math.max(0, score - 20);
    
    const difference = Math.abs(lastGuess - randomNumber);
    const config = difficulties[currentDifficulty];
    const range = config.max - config.min;
    
    if (difference < range * 0.1) {
        hint.textContent = '🔥🔥🔥 You\'re very close!';
    } else if (difference < range * 0.25) {
        hint.textContent = '🔥🔥 You\'re getting warm!';
    } else if (difference < range * 0.5) {
        hint.textContent = '🔥 You\'re somewhat close!';
    } else {
        hint.textContent = '🧊 You\'re quite far away!';
    }
    
    updateDisplay();
}

function resetGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timeLeft = 60;
    message.textContent = '';
    message.className = '';
    hint.textContent = '';
    submitBtn.disabled = false;
    guessInput.disabled = false;
    hintBtn.disabled = false;
    
    if (timerMode.checked) {
        startTimer();
    }
    
    initGame();
    guessInput.focus();
}

function toggleTimer() {
    if (timerMode.checked) {
        timerDisplay.classList.remove('hidden');
        startTimer();
    } else {
        timerDisplay.classList.add('hidden');
        if (timerInterval) {
            clearInterval(timerInterval);
        }
    }
}

function startTimer() {
    timeLeft = 60;
    timeLeftSpan.textContent = timeLeft;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            message.textContent = `⏰ Time's up! The number was ${randomNumber}`;
            message.className = 'wrong';
            submitBtn.disabled = true;
            guessInput.disabled = true;
            hintBtn.disabled = true;
            updateStatistics(false);
        }
    }, 1000);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    
    localStorage.setItem('theme', newTheme);
}

function updateDisplay() {
    attemptsDisplay.textContent = `Attempts: ${attempts}`;
    scoreDisplay.textContent = `Score: ${score}`;
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {}); // Ignore errors if sound can't play
}

function updateStatistics(won) {
    let stats = JSON.parse(localStorage.getItem('gameStats')) || {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0
    };
    
    stats.gamesPlayed++;
    if (won) {
        stats.gamesWon++;
        if (score > stats.bestScore) {
            stats.bestScore = score;
        }
    }
    
    localStorage.setItem('gameStats', JSON.stringify(stats));
    loadStatistics();
}

function loadStatistics() {
    const stats = JSON.parse(localStorage.getItem('gameStats')) || {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore: 0
    };
    
    document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
    document.getElementById('gamesWon').textContent = stats.gamesWon;
    
    const winRate = stats.gamesPlayed > 0 
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
        : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('bestScore').textContent = stats.bestScore;
}

function addToLeaderboard(name, score, attempts, difficulty) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    
    leaderboard.push({
        name,
        score,
        attempts,
        difficulty,
        date: new Date().toLocaleDateString()
    });
    
    // Sort by score (descending) and keep top 10
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

function loadLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p style="text-align: center; color: #999;">No entries yet. Be the first!</p>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((entry, index) => `
        <div class="leaderboard-entry">
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score} pts (${entry.attempts} attempts - ${entry.difficulty})</span>
        </div>
    `).join('');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

// Focus input on load
guessInput.focus();
