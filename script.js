// Game State
let secretNumber;
let attempts;
let score;
let maxNumber;
let timer;
let timerInterval;
let gameActive;

// DOM Elements
const difficultySelect = document.getElementById('difficulty');
const timerModeCheckbox = document.getElementById('timerMode');
const darkModeCheckbox = document.getElementById('darkMode');
const rangeDisplay = document.getElementById('rangeDisplay');
const attemptsDisplay = document.getElementById('attempts');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timerDisplay');
const timerElement = document.getElementById('timer');
const messageBox = document.getElementById('message');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const hintBox = document.getElementById('hintBox');
const guessHistory = document.getElementById('guessHistory');
const resetBtn = document.getElementById('resetBtn');
const leaderboardList = document.getElementById('leaderboardList');

// Initialize Game
function initGame() {
    const difficulty = difficultySelect.value;
    
    switch(difficulty) {
        case 'easy':
            maxNumber = 50;
            break;
        case 'medium':
            maxNumber = 100;
            break;
        case 'hard':
            maxNumber = 500;
            break;
        case 'expert':
            maxNumber = 1000;
            break;
    }
    
    secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    attempts = 0;
    score = 1000;
    gameActive = true;
    
    rangeDisplay.textContent = `1 - ${maxNumber}`;
    attemptsDisplay.textContent = attempts;
    scoreDisplay.textContent = score;
    guessInput.max = maxNumber;
    guessInput.value = '';
    messageBox.textContent = "I'm thinking of a number. Can you guess it?";
    messageBox.className = 'message-box';
    hintBox.style.display = 'none';
    guessHistory.innerHTML = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    
    // Timer Mode
    if (timerModeCheckbox.checked) {
        timer = 60;
        timerDisplay.style.display = 'flex';
        timerElement.textContent = timer;
        startTimer();
    } else {
        timerDisplay.style.display = 'none';
        if (timerInterval) clearInterval(timerInterval);
    }
}

// Start Timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer--;
        timerElement.textContent = timer;
        
        if (timer <= 10) {
            timerElement.style.color = '#f56565';
        }
        
        if (timer <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

// Make Guess
function makeGuess() {
    if (!gameActive) return;
    
    const guess = parseInt(guessInput.value);
    
    // Validation
    if (isNaN(guess) || guess < 1 || guess > maxNumber) {
        showMessage(`Please enter a number between 1 and ${maxNumber}`, 'error');
        return;
    }
    
    attempts++;
    attemptsDisplay.textContent = attempts;
    
    // Reduce score
    score = Math.max(0, score - 10);
    scoreDisplay.textContent = score;
    
    // Add to history
    addGuessToHistory(guess);
    
    // Check guess
    if (guess === secretNumber) {
        endGame(true);
    } else if (guess < secretNumber) {
        showMessage('📈 Too low! Try a higher number.', 'warning');
        showHint(guess, secretNumber);
    } else {
        showMessage('📉 Too high! Try a lower number.', 'error');
        showHint(guess, secretNumber);
    }
    
    guessInput.value = '';
    guessInput.focus();
}

// Show Message
function showMessage(text, type = '') {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

// Show Hint
function showHint(guess, target) {
    const difference = Math.abs(guess - target);
    let hint = '';
    
    if (difference <= 5) {
        hint = '🔥 You\'re burning hot! Almost there!';
    } else if (difference <= 10) {
        hint = '♨️ Getting warmer!';
    } else if (difference <= 20) {
        hint = '🌡️ Warm...';
    } else if (difference <= 50) {
        hint = '❄️ A bit cold';
    } else {
        hint = '🧊 Very cold!';
    }
    
    hintBox.textContent = hint;
    hintBox.style.display = 'block';
}

// Add Guess to History
function addGuessToHistory(guess) {
    const chip = document.createElement('div');
    chip.className = 'guess-chip';
    
    if (guess < secretNumber) {
        chip.classList.add('low');
        chip.textContent = `${guess} ⬆️`;
    } else {
        chip.classList.add('high');
        chip.textContent = `${guess} ⬇️`;
    }
    
    guessHistory.appendChild(chip);
}

// End Game
function endGame(won) {
    gameActive = false;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    if (timerInterval) clearInterval(timerInterval);
    
    if (won) {
        // Bonus for timer mode
        if (timerModeCheckbox.checked) {
            score += timer * 5;
            scoreDisplay.textContent = score;
        }
        
        showMessage(`🎉 Congratulations! You guessed it in ${attempts} attempts! Score: ${score}`, 'success');
        saveScore(score, attempts);
    } else {
        showMessage(`⏰ Time's up! The number was ${secretNumber}. Better luck next time!`, 'error');
    }
    
    hintBox.style.display = 'none';
}

// Save Score to Leaderboard
function saveScore(finalScore, finalAttempts) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    const entry = {
        score: finalScore,
        attempts: finalAttempts,
        difficulty: difficultySelect.value,
        date: new Date().toLocaleDateString()
    };
    
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep top 10
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

// Display Leaderboard
function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p class="empty-leaderboard">No scores yet. Be the first!</p>';
        return;
    }
    
    leaderboardList.innerHTML = leaderboard.map((entry, index) => {
        let rankClass = '';
        let medal = '';
        
        if (index === 0) {
            rankClass = 'rank-1';
            medal = '🥇';
        } else if (index === 1) {
            rankClass = 'rank-2';
            medal = '🥈';
        } else if (index === 2) {
            rankClass = 'rank-3';
            medal = '🥉';
        }
        
        return `
            <div class="leaderboard-entry ${rankClass}">
                <span>${medal} ${entry.difficulty.toUpperCase()}</span>
                <span>${entry.attempts} attempts</span>
                <span><strong>${entry.score}</strong> pts</span>
            </div>
        `;
    }).join('');
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeCheckbox.checked);
}

// Event Listeners
guessBtn.addEventListener('click', makeGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') makeGuess();
});
resetBtn.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
timerModeCheckbox.addEventListener('change', initGame);
darkModeCheckbox.addEventListener('change', toggleDarkMode);

// Load Dark Mode Preference
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
darkModeCheckbox.checked = savedDarkMode;
if (savedDarkMode) {
    document.body.classList.add('dark-mode');
}

// Initialize on Load
window.addEventListener('load', () => {
    initGame();
    displayLeaderboard();
});
