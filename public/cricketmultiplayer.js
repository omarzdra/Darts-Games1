// Game state
let currentPlayer = 1;
let dartsLeft = [3, 3]; // Darts left for each player
let numberOfRounds = [1, 1]; // Rounds for each player
let gameOver = false;

// Cricket numbers (20 down to 15 and bull)
const cricketNumbers = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 25];

// Initialize player states
const playerStates = {};
for (const num of cricketNumbers) {
    playerStates[num] = {
        1: { marks: 3, score: 0 },
        2: { marks: 3, score: 0 }
    };
}

// Scores
const playerScores = [0, 0];

// Use a dart for the current player
function useDart() {
    dartsLeft[currentPlayer - 1]--;
    updateDartsDisplay();
    
    if (dartsLeft[currentPlayer - 1] === 0) {
        numberOfRounds[currentPlayer - 1]++;
        updateRoundDisplay();
        dartsLeft[currentPlayer - 1] = 3;
        updateDartsDisplay();
    }
}

// Update darts display for current player
function updateDartsDisplay() {
    const display = document.getElementById(`roundDarts${currentPlayer}`);
    const icons = ["🎯", "🎯", "🎯"];
    display.innerText = icons.slice(0, dartsLeft[currentPlayer - 1]).join(" ");
}

// Update round display for current player
function updateRoundDisplay() {
    document.getElementById(`roundNumber${currentPlayer}`).innerText = numberOfRounds[currentPlayer - 1];
}

// Outside hit
function outsideHit(player) {
    if (player !== currentPlayer || gameOver) return;
    useDart();
}

// Switch player
function switchPlayer() {
    if (gameOver) return;
    
    // Reset darts for current player if they have any left
    if (dartsLeft[currentPlayer - 1] < 3) {
        numberOfRounds[currentPlayer - 1]++;
        updateRoundDisplay();
        dartsLeft[currentPlayer - 1] = 3;
        updateDartsDisplay();
    }
    
    // Switch to other player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    // Update UI to show active player
    document.getElementById('player1Section').classList.toggle('player-active', currentPlayer === 1);
    document.getElementById('player2Section').classList.toggle('player-active', currentPlayer === 2);
    
    // Check if game is over
    checkGameOver();
}

// Update field for current player
function updateField(number, hits) {
    if (gameOver) return;
    
    const playerState = playerStates[number][currentPlayer];
    const opponentState = playerStates[number][currentPlayer === 1 ? 2 : 1];
    
    // If player has already closed this number, just add to score
    if (playerState.marks <= 0) {
        playerScores[currentPlayer - 1] += number * hits;
        document.getElementById(`score${currentPlayer}`).innerText = playerScores[currentPlayer - 1];
        useDart();
        return;
    }
    
    // Remove marks
    const marksToRemove = Math.min(hits, playerState.marks);
    playerState.marks -= marksToRemove;
    
    // If there are remaining hits after closing, add to score
    const remainingHits = hits - marksToRemove;
    if (remainingHits > 0 && playerState.marks <= 0) {
        // Only score if opponent hasn't closed this number
        if (opponentState.marks > 0) {
            playerScores[currentPlayer - 1] += number * remainingHits;
            document.getElementById(`score${currentPlayer}`).innerText = playerScores[currentPlayer - 1];
        }
    }
    
    // Update UI
    updateNumberDisplay(number);
    useDart();
    
    // Check if game is over
    checkGameOver();
}

// Update number display in UI
function updateNumberDisplay(number) {
    const playerState = playerStates[number][currentPlayer];
    const xElement = document.getElementById(`${number}x${currentPlayer}`);
    const scoreElement = document.getElementById(`scoreOnly${number}_${currentPlayer}`);
    
    // Update X marks
    xElement.innerText = 'X'.repeat(playerState.marks).split('').join(' ');
    
    // Update score
    scoreElement.innerText = playerScores[currentPlayer - 1];
    
    // Strike through if closed
    if (playerState.marks <= 0) {
        document.getElementById(`${number}title`).style.textDecoration = "line-through";
    }
}

// Check if game is over
function checkGameOver() {
    // Check if current player has closed all numbers
    const allClosed = cricketNumbers.every(num => playerStates[num][currentPlayer].marks <= 0);
    
    if (allClosed) {
        // Check if current player has higher score
        const otherPlayer = currentPlayer === 1 ? 2 : 1;
        if (playerScores[currentPlayer - 1] >= playerScores[otherPlayer - 1]) {
            endGame(currentPlayer);
        } else {
            // Other player gets one more turn
            switchPlayer();
        }
    }
}

// End the game
function endGame(winner) {
    gameOver = true;
    
    // Update modal
    document.getElementById('winnerName').innerText = `Player ${winner}`;
    document.getElementById('finalScore').innerText = playerScores[winner - 1];
    document.getElementById('finalRounds').innerText = Math.max(...numberOfRounds);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('gameOverModal'));
    modal.show();
    
    // Highlight winner section
    document.getElementById(`player${winner}Section`).classList.add('player-finished');
}

// Button handlers
function XMinus(number, hits) {
    if (gameOver || currentPlayer !== hits) return;
    updateField(number, 1);
}

function XXMinus(number, hits) {
    if (gameOver || currentPlayer !== hits) return;
    updateField(number, 2);
}

function XXXMinus(number, hits) {
    if (gameOver || currentPlayer !== hits) return;
    updateField(number, 3);
}

// Reset all game state
function resetAll() {
    currentPlayer = 1;
    dartsLeft = [3, 3];
    numberOfRounds = [1, 1];
    gameOver = false;
    
    // Reset player states
    for (const num of cricketNumbers) {
        playerStates[num] = {
            1: { marks: 3, score: 0 },
            2: { marks: 3, score: 0 }
        };
    }
    
    // Reset scores
    playerScores[0] = 0;
    playerScores[1] = 0;
    
    // Reset UI
    for (const num of cricketNumbers) {
        document.getElementById(`${num}x1`).innerText = 'X X X';
        document.getElementById(`${num}x2`).innerText = 'X X X';
        document.getElementById(`scoreOnly${num}_1`).innerText = '0';
        document.getElementById(`scoreOnly${num}_2`).innerText = '0';
        document.getElementById(`${num}title`).style.textDecoration = 'none';
    }
    
    document.getElementById('score1').innerText = '0';
    document.getElementById('score2').innerText = '0';
    document.getElementById('roundDarts1').innerText = '🎯 🎯 🎯';
    document.getElementById('roundDarts2').innerText = '🎯 🎯 🎯';
    document.getElementById('roundNumber1').innerText = '1';
    document.getElementById('roundNumber2').innerText = '1';
    
    // Reset player sections
    document.getElementById('player1Section').classList.add('player-active');
    document.getElementById('player2Section').classList.remove('player-active');
    document.getElementById('player1Section').classList.remove('player-finished');
    document.getElementById('player2Section').classList.remove('player-finished');
}

// Initialize game
function initGame() {
    resetAll();
}

// Initialize when page loads
window.onload = initGame;