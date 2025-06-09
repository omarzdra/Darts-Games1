let dartsLeft = 3;
let numberOfRounds = 1;

function useDart() {
    dartsLeft--;
    updateDartsDisplay();
    sessionStorage.setItem("dartsLeft", dartsLeft);
    if (dartsLeft === 0) {
        numberOfRounds++;
        updateRoundDisplay();
        dartsLeft = 3;
        updateDartsDisplay();
    }
    sessionStorage.setItem("roundNumber", numberOfRounds);
}

function updateDartsDisplay() {
    const display = document.getElementById("roundDarts");
    const icons = ["🎯", "🎯", "🎯"];
    display.innerText = icons.slice(0, dartsLeft).join(" ");
}

function updateRoundDisplay() {
    document.getElementById("roundNumber").innerText = numberOfRounds;
}

function outsideHit() {
    useDart();
}

function checkCurrentState() {
    let allClosed = true;
    for (let i = 10; i <= 20; i++) {
        const parts = document.getElementById(`${i}x`).innerText.trim().split(' ').filter(x => x === 'X');
        if (parts.length > 0) {
            allClosed = false;
            break;
        }
    }
    const bullParts = document.getElementById(`25x`).innerText.trim().split(' ').filter(x => x === 'X');
    if (bullParts.length > 0) {
        allClosed = false;
    }

    if (allClosed) {
        showGameOverModal();
    }
}
function showGameOverModal() {
    const score = parseInt(document.getElementById("score").innerText.trim(), 10);
    const rounds = numberOfRounds;
    const playerId = 1;
    const name = "Cricket - Singleplayer"; 

    document.getElementById("finalScore").innerText = score;
    document.getElementById("finalRounds").innerText = rounds;

    fetch("http://localhost:3000/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            game_name: name,
            player_id: playerId,
            total_score: score,
            total_rounds: rounds
        })
    }).then(res => res.json())
      .then(data => console.log("Stats sent:", data))
      .catch(err => console.error("Error while sending:", err));

    const modal = new bootstrap.Modal(document.getElementById("gameOverModal"));
    modal.show();
}




function updateField(number, hits) {
    const currentX = document.getElementById(`${number}x`);
    const currentScore = document.getElementById(`scoreOnly${number}`);
    const currentOverallScore = document.getElementById(`score`);

    let parts = currentX.innerText.trim().split(' ').filter(x => x === 'X');
    let score = parseInt(currentScore.innerText.trim(), 10);
    let overallScore = parseInt(currentOverallScore.innerText.trim(), 10);

    let toRemove = Math.min(hits, parts.length);
    for (let i = 0; i < toRemove; i++) parts.pop();

    if (parts.length < hits) {
        const extraHits = hits - toRemove;
        score += extraHits * number;
        overallScore += extraHits * number;
    }

    currentX.innerText = parts.join(' ');
    currentScore.innerText = score;
    currentOverallScore.innerText = overallScore;

    if (parts.length === 0) {
        document.getElementById(`${number}title`).style.textDecoration = "line-through";
        sessionStorage.setItem(`${number}titleDecoration`, "line-through");
    }

    sessionStorage.setItem(`${number}x`, parts.join(' '));
    sessionStorage.setItem(`scoreOnly${number}`, score);
    sessionStorage.setItem("score", overallScore);
    sessionStorage.setItem("dartsLeft", dartsLeft);
    sessionStorage.setItem("roundNumber", numberOfRounds);

    checkCurrentState();
}

function XMinus(number) {
    useDart();
    updateField(number, 1);
}

function XXMinus(doubleValue) {
    useDart();
    updateField(doubleValue / 2, 2);
}

function XXXMinus(tripleValue) {
    useDart();
    updateField(tripleValue / 3, 3);
}

function resetAll() {
    for (let i = 10; i <= 20; i++) {
        document.getElementById(`${i}x`).innerText = "X X X";
        document.getElementById(`scoreOnly${i}`).innerText = "0";
        document.getElementById(`${i}title`).style.textDecoration = "none";
        sessionStorage.removeItem(`${i}x`);
        sessionStorage.removeItem(`scoreOnly${i}`);
        sessionStorage.removeItem(`${i}titleDecoration`);
    }

    document.getElementById(`25x`).innerText = "X X X";
    document.getElementById(`scoreOnly25`).innerText = "0";
    document.getElementById(`25title`).style.textDecoration = "none";
    sessionStorage.removeItem(`25x`);
    sessionStorage.removeItem(`scoreOnly25`);
    sessionStorage.removeItem(`25titleDecoration`);

    document.getElementById(`roundDarts`).innerText = "🎯 🎯 🎯";
    document.getElementById(`score`).innerText = "0";
    document.getElementById(`roundNumber`).innerText = "1";

    sessionStorage.removeItem(`score`);
    sessionStorage.removeItem(`dartsLeft`);
    sessionStorage.removeItem(`roundNumber`);

    dartsLeft = 3;
    numberOfRounds = 1;
}

function restoreFromSession() {
    for (let i = 10; i <= 20; i++) {
        const xVal = sessionStorage.getItem(`${i}x`);
        const scoreVal = sessionStorage.getItem(`scoreOnly${i}`);
        const decoVal = sessionStorage.getItem(`${i}titleDecoration`);

        if (xVal !== null) document.getElementById(`${i}x`).innerText = xVal;
        if (scoreVal !== null) document.getElementById(`scoreOnly${i}`).innerText = scoreVal;
        if (decoVal !== null) document.getElementById(`${i}title`).style.textDecoration = decoVal;
    }

    const bullX = sessionStorage.getItem(`25x`);
    const bullScore = sessionStorage.getItem(`scoreOnly25`);
    const bullDeco = sessionStorage.getItem(`25titleDecoration`);

    if (bullX !== null) document.getElementById(`25x`).innerText = bullX;
    if (bullScore !== null) document.getElementById(`scoreOnly25`).innerText = bullScore;
    if (bullDeco !== null) document.getElementById(`25title`).style.textDecoration = bullDeco;

    const score = sessionStorage.getItem(`score`);
    if (score !== null) document.getElementById(`score`).innerText = score;

    const savedDarts = sessionStorage.getItem("dartsLeft");
    if (savedDarts !== null) {
        dartsLeft = parseInt(savedDarts, 10);
    }

    const savedRound = sessionStorage.getItem("roundNumber");
    if (savedRound !== null) {
        numberOfRounds = parseInt(savedRound, 10);
    }

    updateDartsDisplay();
    updateRoundDisplay();
}

window.onload = restoreFromSession;
