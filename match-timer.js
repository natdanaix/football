let matchTimer;
let injuryTimer;
let countdownTimer;
let injuryTimeSeconds = 0;

function startMatch() {
    matchState.isMatchStarted = true;
    matchState.startTime = new Date();
    matchState.isSecondHalf = false;

    startTimers();
    updateUI();
    saveMatchData();
}

function startTimers() {
    clearInterval(matchTimer);
    clearInterval(injuryTimer);

    matchTimer = setInterval(updateMatchTime, 1000);

    if (matchState.isInjuryTimeActive && matchState.currentInjuryStartTime) {
        injuryTimer = setInterval(updateInjuryTime, 1000);
    }
}

function updateMatchTime() {
    if (!matchState.startTime) return;

    const now = new Date();
    const difference = now - matchState.startTime;

    const minutes = Math.floor(difference / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    matchState.elapsedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    matchTimeEl.textContent = matchState.elapsedTime;

    if (minutes === 45 && seconds === 0 && !matchState.isSecondHalf) {
        startCountdown();
    }

    if (minutes === 90 && seconds === 0 && matchState.isSecondHalf) {
        startCountdown();
    }
}

function startCountdown() {
    if (matchState.totalInjurySeconds > 0) {
        injuryTimeSeconds = matchState.totalInjurySeconds;
        countdownTimer = setInterval(updateCountdown, 1000);
    }
}

function updateCountdown() {
    if (injuryTimeSeconds > 0) {
        injuryTimeSeconds--;

        const minutes = Math.floor(injuryTimeSeconds / 60);
        const seconds = injuryTimeSeconds % 60;

        matchTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        clearInterval(countdownTimer);
        matchTimeEl.textContent = "00:00";
        alert("การแข่งขันสิ้นสุดลงแล้ว");
    }
}
