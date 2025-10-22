let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const message = document.getElementById('message');
const attemptsDisplay = document.getElementById('attempts');

submitBtn.addEventListener('click', checkGuess);
resetBtn.addEventListener('click', resetGame);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

function checkGuess() {
    const userGuess = parseInt(guessInput.value);
    
    if (!userGuess || userGuess < 1 || userGuess > 100) {
        message.textContent = 'Please enter a valid number between 1 and 100!';
        message.className = 'wrong';
        return;
    }
    
    attempts++;
    
    if (userGuess === randomNumber) {
        message.textContent = `🎉 Correct! You won in ${attempts} attempts!`;
        message.className = 'correct';
        submitBtn.disabled = true;
        guessInput.disabled = true;
    } else if (userGuess < randomNumber) {
        message.textContent = '📈 Too low! Try a higher number.';
        message.className = 'wrong';
    } else {
        message.textContent = '📉 Too high! Try a lower number.';
        message.className = 'wrong';
    }
    
    attemptsDisplay.textContent = `Attempts: ${attempts}`;
    guessInput.value = '';
    guessInput.focus();
}

function resetGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    message.textContent = '';
    message.className = '';
    attemptsDisplay.textContent = '';
    guessInput.value = '';
    submitBtn.disabled = false;
    guessInput.disabled = false;
    guessInput.focus();
}
