function updateUI() {
    teamAHeader.textContent = matchState.teamA.name;
    teamAHeader.style.backgroundColor = matchState.teamA.color;

    teamBHeader.textContent = matchState.teamB.name;
    teamBHeader.style.backgroundColor = matchState.teamB.color;

    teamASubBtn.style.backgroundColor = matchState.teamA.color;
    teamBSubBtn.style.backgroundColor = matchState.teamB.color;

    updateSubstitutionButtonsState();

    matchTimeEl.textContent = matchState.elapsedTime;

    if (matchState.isInjuryTimeActive) {
        injuryTimeEl.textContent = matchState.currentInjuryTimeDisplay;
        injuryTimeEl.style.display = 'block';
        totalInjuryEl.style.display = 'none';

        injuryBtn.classList.add('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> หยุดทดเวลา';

        injuryFab.classList.add('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    } else if (matchState.totalInjurySeconds > 0) {
        injuryTimeEl.style.display = 'none';
        totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
        totalInjuryEl.style.display = 'block';

        injuryBtn.classList.remove('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> ทดเวลา';

        injuryFab.classList.remove('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    } else {
        injuryTimeEl.style.display = 'none';
        totalInjuryEl.style.display = 'none';

        injuryBtn.classList.remove('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> ทดเวลา';

        injuryFab.classList.remove('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    }

    if (matchState.isMatchStarted) {
        matchControlsEl.style.display = 'none';
        injuryControlsEl.style.display = 'flex';
        injuryFab.style.display = 'flex';
    } else {
        matchControlsEl.style.display = 'flex';
        injuryControlsEl.style.display = 'none';
        injuryFab.style.display = 'none';
    }

    renderTeamCards();
    renderTeamSubstitutions();
}
