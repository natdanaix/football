function loadSavedMatchData() {
    const savedData = localStorage.getItem('matchData');

    if (savedData) {
        const parsedData = JSON.parse(savedData);

        matchState = {
            ...matchState,
            ...parsedData,
            startTime: parsedData.startTime ? new Date(parsedData.startTime) : null,
            currentInjuryStartTime: parsedData.currentInjuryStartTime ? new Date(parsedData.currentInjuryStartTime) : null
        };

        if (matchState.teamA.subWindows === undefined) {
            matchState.teamA.subWindows = calculateUsedSubWindows(matchState.teamA.substitutions);
        }

        if (matchState.teamB.subWindows === undefined) {
            matchState.teamB.subWindows = calculateUsedSubWindows(matchState.teamB.substitutions);
        }

        if (!matchState.activeSubWindow) {
            matchState.activeSubWindow = {
                teamA: false,
                teamB: false
            };
        }

        updateUI();

        if (matchState.isMatchStarted) {
            startTimers();
        }
    }
}

function saveMatchData() {
    localStorage.setItem('matchData', JSON.stringify({
        ...matchState,
        startTime: matchState.startTime ? matchState.startTime.toISOString() : null,
        currentInjuryStartTime: matchState.currentInjuryStartTime ? matchState.currentInjuryStartTime.toISOString() : null
    }));
}

function clearMatchData() {
    localStorage.removeItem('matchData');
}
