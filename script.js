document.addEventListener('DOMContentLoaded', function() {
    let matchState = {
        isMatchStarted: false,
        isSecondHalf: false,
        startTime: null,
        elapsedTime: "00:00",
        firstHalfEndTime: null,
        firstHalfInjurySeconds: 0,
        teamA: {
            name: "Team A",
            color: "#1976D2",
            cards: [],
            substitutions: [],
            subWindows: 0,
            goals: 0,
            halfTimeSubUsed: false
        },
        teamB: {
            name: "Team B",
            color: "#D32F2F",
            cards: [],
            substitutions: [],
            subWindows: 0,
            goals: 0,
            halfTimeSubUsed: false
        },
        isInjuryTimeActive: false,
        totalInjurySeconds: 0,
        injuryTimePeriods: [],
        currentInjuryStartTime: null,
        currentInjuryTimeDisplay: "+00:00",
        activeSubWindow: {
            teamA: false,
            teamB: false
        }
    };

    let matchTimer;
    let injuryTimer;
    let autoSaveTimer;

    const halfTimeSubTeamABtn = document.getElementById('halfTimeSubTeamABtn');
    const halfTimeSubTeamBBtn = document.getElementById('halfTimeSubTeamBBtn');
    const startSecondHalfBtn = document.getElementById('startSecondHalfBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const matchTimeEl = document.getElementById('matchTime');
    const injuryTimeEl = document.getElementById('injuryTime');
    const totalInjuryEl = document.getElementById('totalInjury');
    const startMatchBtn = document.getElementById('startMatchBtn');
    const matchControlsEl = document.getElementById('matchControls');
    const injuryControlsEl = document.getElementById('injuryControls');
    const injuryBtn = document.getElementById('injuryBtn');
    const injuryFab = document.getElementById('injuryFab');
    const teamAHeader = document.getElementById('teamAHeader');
    const teamBHeader = document.getElementById('teamBHeader');
    const endMatchBtn = document.getElementById('endMatchBtn');

    const teamAYellowBtn = document.getElementById('teamAYellowBtn');
    const teamARedBtn = document.getElementById('teamARedBtn');
    const teamASubBtn = document.getElementById('teamASubBtn');
    const teamAGoalBtn = document.getElementById('teamAGoalBtn');
    const teamBYellowBtn = document.getElementById('teamBYellowBtn');
    const teamBRedBtn = document.getElementById('teamBRedBtn');
    const teamBSubBtn = document.getElementById('teamBSubBtn');
    const teamBGoalBtn = document.getElementById('teamBGoalBtn');

    const teamACardsContent = document.getElementById('teamACardsContent');
    const teamASubsContent = document.getElementById('teamASubsContent');
    const teamBCardsContent = document.getElementById('teamBCardsContent');
    const teamBSubsContent = document.getElementById('teamBSubsContent');

    const teamACardsEmpty = document.getElementById('teamACardsEmpty');
    const teamASubsEmpty = document.getElementById('teamASubsEmpty');
    const teamBCardsEmpty = document.getElementById('teamBCardsEmpty');
    const teamBSubsEmpty = document.getElementById('teamBSubsEmpty');

    const tabElements = document.querySelectorAll('.tab');
    const settingsBtn = document.getElementById('settingsBtn');

    const teamSettingsModal = document.getElementById('teamSettingsModal');
    const closeTeamSettingsBtn = document.getElementById('closeTeamSettingsBtn');
    const teamANameInput = document.getElementById('teamANameInput');
    const teamBNameInput = document.getElementById('teamBNameInput');
    const teamAColorPicker = document.getElementById('teamAColorPicker');
    const teamBColorPicker = document.getElementById('teamBColorPicker');
    const saveTeamSettingsBtn = document.getElementById('saveTeamSettingsBtn');
    const cancelTeamSettingsBtn = document.getElementById('cancelTeamSettingsBtn');

    const cardModal = document.getElementById('cardModal');
    const cardModalTitle = document.getElementById('cardModalTitle');
    const playerNumberInput = document.getElementById('playerNumberInput');
    const saveCardBtn = document.getElementById('saveCardBtn');
    const cancelCardBtn = document.getElementById('cancelCardBtn');
    const closeCardModalBtn = document.getElementById('closeCardModalBtn');
    const cardModalActions = document.getElementById('cardModalActions');

    const subModalA = document.getElementById('subModalA');
    const subModalTitleA = document.getElementById('subModalTitleA');
    const playerInNumberA = document.getElementById('playerInNumberA');
    const playerOutNumberA = document.getElementById('playerOutNumberA');
    const addSubBtnA = document.getElementById('addSubBtnA');
    const cancelSubBtnA = document.getElementById('cancelSubBtnA');
    const closeSubModalABtn = document.getElementById('closeSubModalABtn');

    const subModalB = document.getElementById('subModalB');
    const subModalTitleB = document.getElementById('subModalTitleB');
    const playerInNumberB = document.getElementById('playerInNumberB');
    const playerOutNumberB = document.getElementById('playerOutNumberB');
    const addSubBtnB = document.getElementById('addSubBtnB');
    const cancelSubBtnB = document.getElementById('cancelSubBtnB');
    const closeSubModalBBtn = document.getElementById('closeSubModalBBtn');

    const injurySummaryModal = document.getElementById('injurySummaryModal');
    const injurySummaryContent = document.getElementById('injurySummaryContent');
    const closeInjurySummaryBtn = document.getElementById('closeInjurySummaryBtn');
    const closeInjurySummaryConfirmBtn = document.getElementById('closeInjurySummaryConfirmBtn');

    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const closeResetConfirmBtn = document.getElementById('closeResetConfirmBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    const matchSummaryModal = document.getElementById('matchSummaryModal');
    const matchSummaryContent = document.getElementById('matchSummaryContent');
    const closeMatchSummaryBtn = document.getElementById('closeMatchSummaryBtn');
    const closeMatchSummaryConfirmBtn = document.getElementById('closeMatchSummaryConfirmBtn');
    const saveAsPdfBtn = document.getElementById('saveAsPdfBtn');

    const availableColors = [
        '#1976D2', '#D32F2F', '#4CAF50', '#FF9800', '#9C27B0',
        '#009688', '#3F51B5', '#E91E63', '#FFC107', '#00BCD4',
        '#FF5722', '#673AB7', '#03A9F4', '#8BC34A'
    ];

    let currentCardContext = {
        isTeamA: true,
        isYellow: true,
        isGoal: false,
        cardToEdit: null
    };

    function init() {
        loadSavedMatchData();
        setupEventListeners();
        initColorPickers();
        autoSaveTimer = setInterval(saveMatchData, 10000);
        if (!matchState.isMatchStarted) {
            setTimeout(showTeamCustomizationDialog, 500);
        }
        updateSubstitutionButtonsState();
    }

    function addSubstitution(team, isHalfTime = false) {
        const playerInNumber = document.getElementById(`playerInNumber${team}`).value;
        const playerOutNumber = document.getElementById(`playerOutNumber${team}`).value;
        
        if (!playerInNumber || !playerOutNumber) {
            alert('Please enter both player numbers');
            return;
        }
        
        const teamData = team === 'A' ? matchState.teamA : matchState.teamB;
        
        if (teamData.substitutions.length >= 5) {
            alert(`Maximum of 5 substitutions reached for ${teamData.name}`);
            return;
        }
        
        if (isHalfTime) {
            if (teamData.halfTimeSubUsed) {
                alert(`Half-time substitution already used for ${teamData.name}`);
                return;
            }
            teamData.halfTimeSubUsed = true;
        }
        
        const subData = {
            playerInNumber,
            playerOutNumber,
            timeStamp: isHalfTime ? "Half-Time" : matchState.elapsedTime
        };
        
        if (team === 'A') {
            if (!isHalfTime && !matchState.activeSubWindow.teamA) {
                matchState.teamA.subWindows += 1;
                matchState.activeSubWindow.teamA = true;
            }
            matchState.teamA.substitutions.push(subData);
        } else {
            if (!isHalfTime && !matchState.activeSubWindow.teamB) {
                matchState.teamB.subWindows += 1;
                matchState.activeSubWindow.teamB = true;
            }
            matchState.teamB.substitutions.push(subData);
        }
        
        closeModal(`subModal${team}`);
        saveMatchData();
        updateUI();
    }

    function showSubModal(team, isHalfTime = false) {
        const modal = document.getElementById(`subModal${team}`);
        const title = document.getElementById(`subModalTitle${team}`);
        title.textContent = isHalfTime ? `${matchState[team === 'A' ? 'teamA' : 'teamB'].name} - Half-Time Substitution` : `${matchState[team === 'A' ? 'teamA' : 'teamB'].name} - Substitution`;
        document.getElementById(`playerInNumber${team}`).value = '';
        document.getElementById(`playerOutNumber${team}`).value = '';
        document.getElementById(`addSubBtn${team}`).onclick = () => addSubstitution(team, isHalfTime);
        modal.style.display = 'flex';
    }

    function setupEventListeners() {
        startSecondHalfBtn.addEventListener('click', startSecondHalf);
        startMatchBtn.addEventListener('click', startMatch);
        injuryBtn.addEventListener('click', toggleInjuryTime);
        injuryFab.addEventListener('click', toggleInjuryTime);
        endMatchBtn.addEventListener('click', endMatch);
        resetDataBtn.addEventListener('click', resetAllData);
        halfTimeSubTeamABtn.addEventListener('click', () => showSubModal('A', true));
        halfTimeSubTeamBBtn.addEventListener('click', () => showSubModal('B', true));

        teamAYellowBtn.addEventListener('click', () => showCardDialog(true, true, false));
        teamARedBtn.addEventListener('click', () => showCardDialog(true, false, false));
        teamASubBtn.addEventListener('click', () => showSubstitutionDialog(true));
        teamAGoalBtn.addEventListener('click', () => showCardDialog(true, false, true));
        
        teamBYellowBtn.addEventListener('click', () => showCardDialog(false, true, false));
        teamBRedBtn.addEventListener('click', () => showCardDialog(false, false, false));
        teamBSubBtn.addEventListener('click', () => showSubstitutionDialog(false));
        teamBGoalBtn.addEventListener('click', () => showCardDialog(false, false, true));
        
        tabElements.forEach(tab => {
            tab.addEventListener('click', () => {
                const team = tab.dataset.team;
                const tabType = tab.dataset.tab;
                document.querySelectorAll(`.tab[data-team="${team}"]`).forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                if (team === 'a') {
                    teamACardsContent.classList.remove('active');
                    teamASubsContent.classList.remove('active');
                    if (tabType === 'cards') teamACardsContent.classList.add('active');
                    else teamASubsContent.classList.add('active');
                } else {
                    teamBCardsContent.classList.remove('active');
                    teamBSubsContent.classList.remove('active');
                    if (tabType === 'cards') teamBCardsContent.classList.add('active');
                    else teamBSubsContent.classList.add('active');
                }
            });
        });
        
        settingsBtn.addEventListener('click', () => {
            if (!matchState.isMatchStarted) showTeamCustomizationDialog();
            else showResetConfirmDialog();
        });
        
        closeTeamSettingsBtn.addEventListener('click', () => teamSettingsModal.style.display = 'none');
        saveTeamSettingsBtn.addEventListener('click', saveTeamSettings);
        cancelTeamSettingsBtn.addEventListener('click', () => teamSettingsModal.style.display = 'none');
        
        closeCardModalBtn.addEventListener('click', () => cardModal.style.display = 'none');
        saveCardBtn.addEventListener('click', saveCardEvent);
        cancelCardBtn.addEventListener('click', () => cardModal.style.display = 'none');
        
        closeSubModalABtn.addEventListener('click', () => closeModal('subModalA'));
        addSubBtnA.addEventListener('click', () => addSubstitution('A', matchState.firstHalfEndTime && !matchState.isSecondHalf));
        cancelSubBtnA.addEventListener('click', () => closeModal('subModalA'));
        
        closeSubModalBBtn.addEventListener('click', () => closeModal('subModalB'));
        addSubBtnB.addEventListener('click', () => addSubstitution('B', matchState.firstHalfEndTime && !matchState.isSecondHalf));
        cancelSubBtnB.addEventListener('click', () => closeModal('subModalB'));
        
        closeInjurySummaryBtn.addEventListener('click', () => injurySummaryModal.style.display = 'none');
        closeInjurySummaryConfirmBtn.addEventListener('click', () => injurySummaryModal.style.display = 'none');
        
        closeResetConfirmBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
        cancelResetBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
        confirmResetBtn.addEventListener('click', resetAllData);

        closeMatchSummaryBtn.addEventListener('click', () => matchSummaryModal.style.display = 'none');
        closeMatchSummaryConfirmBtn.addEventListener('click', () => {
            matchSummaryModal.style.display = 'none';
            resetAllData();
        });
        saveAsPdfBtn.addEventListener('click', saveSummaryAsPdf);
    }

    function initColorPickers() {
        teamAColorPicker.innerHTML = '';
        teamBColorPicker.innerHTML = '';
        
        availableColors.forEach(color => {
            const optionA = document.createElement('div');
            optionA.className = 'color-option';
            optionA.style.backgroundColor = color;
            if (color === matchState.teamA.color) optionA.classList.add('selected');
            optionA.addEventListener('click', () => {
                document.querySelectorAll('#teamAColorPicker .color-option').forEach(opt => opt.classList.remove('selected'));
                optionA.classList.add('selected');
            });
            teamAColorPicker.appendChild(optionA);
            
            const optionB = document.createElement('div');
            optionB.className = 'color-option';
            optionB.style.backgroundColor = color;
            if (color === matchState.teamB.color) optionB.classList.add('selected');
            optionB.addEventListener('click', () => {
                document.querySelectorAll('#teamBColorPicker .color-option').forEach(opt => opt.classList.remove('selected'));
                optionB.classList.add('selected');
            });
            teamBColorPicker.appendChild(optionB);
        });
    }

    function loadSavedMatchData() {
        const savedData = localStorage.getItem('matchData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            matchState = {
                ...matchState,
                ...parsedData,
                startTime: parsedData.startTime ? new Date(parsedData.startTime) : null,
                currentInjuryStartTime: parsedData.currentInjuryStartTime ? new Date(parsedData.currentInjuryStartTime) : null,
                teamA: { ...matchState.teamA, ...parsedData.teamA, goals: parsedData.teamA.goals || 0 },
                teamB: { ...matchState.teamB, ...parsedData.teamB, goals: parsedData.teamB.goals || 0 }
            };
            if (matchState.teamA.subWindows === undefined) {
                matchState.teamA.subWindows = calculateUsedSubWindows(matchState.teamA.substitutions);
            }
            if (matchState.teamB.subWindows === undefined) {
                matchState.teamB.subWindows = calculateUsedSubWindows(matchState.teamB.substitutions);
            }
            if (!matchState.activeSubWindow) {
                matchState.activeSubWindow = { teamA: false, teamB: false };
            }
            updateUI();
            if (matchState.isMatchStarted) startTimers();
        }
    }

    function calculateUsedSubWindows(substitutions) {
        if (!substitutions || substitutions.length === 0) return 0;
        const windows = new Set();
        substitutions.forEach(sub => windows.add(sub.timeStamp));
        return windows.size;
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

   function updateUI() {
    teamAHeader.textContent = matchState.teamA.name;
    teamAHeader.style.backgroundColor = matchState.teamA.color;
    teamBHeader.textContent = matchState.teamB.name;
    teamBHeader.style.backgroundColor = matchState.teamB.color;
    
    const teamAScoreEl = document.getElementById('teamAScore');
    const teamBScoreEl = document.getElementById('teamBScore');
    teamAScoreEl.textContent = matchState.teamA.goals;
    teamBScoreEl.textContent = matchState.teamB.goals;
    
    teamASubBtn.style.backgroundColor = matchState.teamA.color;
    teamBSubBtn.style.backgroundColor = matchState.teamB.color;
    
    if (!matchState.isMatchStarted && !matchState.isSecondHalf && matchState.firstHalfEndTime) {
        halfTimeSubTeamABtn.style.display = matchState.teamA.halfTimeSubUsed ? 'none' : 'inline-block';
        halfTimeSubTeamBBtn.style.display = matchState.teamB.halfTimeSubUsed ? 'none' : 'inline-block';
    } else {
        halfTimeSubTeamABtn.style.display = 'none';
        halfTimeSubTeamBBtn.style.display = 'none';
    }
    
    updateSubstitutionButtonsState();
    matchTimeEl.textContent = matchState.elapsedTime;
    
    if (matchState.isInjuryTimeActive) {
        injuryTimeEl.innerHTML = matchState.currentInjuryTimeDisplay;
        injuryTimeEl.style.display = 'inline-flex';
        totalInjuryEl.style.display = 'none';
        injuryBtn.classList.add('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Stop Injury Time';
        injuryFab.classList.add('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    } else if (matchState.totalInjurySeconds > 0) {
        injuryTimeEl.style.display = 'none';
        totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
        totalInjuryEl.style.display = 'block';
        injuryBtn.classList.remove('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Injury Time';
        injuryFab.classList.remove('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    } else {
        injuryTimeEl.style.display = 'none';
        totalInjuryEl.style.display = 'none';
        injuryBtn.classList.remove('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Injury Time';
        injuryFab.classList.remove('injury-active');
        injuryFab.innerHTML = '<i class="fas fa-stopwatch"></i>';
    }
    
    if (matchState.isMatchStarted) {
        matchControlsEl.style.display = 'none';
        injuryControlsEl.style.display = 'flex';
        injuryFab.style.display = 'flex';
        startSecondHalfBtn.style.display = 'none';
    } else {
        matchControlsEl.style.display = 'flex';
        injuryControlsEl.style.display = 'none';
        injuryFab.style.display = 'none';
        startSecondHalfBtn.style.display = matchState.isSecondHalf ? 'none' : (matchState.firstHalfEndTime ? 'block' : 'none');
    }
    
    renderTeamCards();
    renderTeamSubstitutions();
}

    function updateSubstitutionButtonsState() {
        if (matchState.isMatchStarted) {
            if (matchState.teamA.subWindows >= 3 && !matchState.activeSubWindow.teamA) {
                teamASubBtn.disabled = true;
                teamASubBtn.classList.add('disabled');
                teamASubBtn.innerHTML = 'Substitution Quota Exhausted';
            } else {
                teamASubBtn.disabled = false;
                teamASubBtn.classList.remove('disabled');
                teamASubBtn.innerHTML = 'Substitution' + (matchState.activeSubWindow.teamA ? ' (Active)' : '');
            }
            
            if (matchState.teamB.subWindows >= 3 && !matchState.activeSubWindow.teamB) {
                teamBSubBtn.disabled = true;
                teamBSubBtn.classList.add('disabled');
                teamBSubBtn.innerHTML = 'Substitution Quota Exhausted';
            } else {
                teamBSubBtn.disabled = false;
                teamBSubBtn.classList.remove('disabled');
                teamBSubBtn.innerHTML = 'Substitution' + (matchState.activeSubWindow.teamB ? ' (Active)' : '');
            }
        }
    }

    function renderTeamCards() {
        const teamACardsHTML = matchState.teamA.cards.map(card => createCardHTML(card, true)).join('');
        if (teamACardsHTML) {
            teamACardsEmpty.style.display = 'none';
            teamACardsContent.innerHTML = teamACardsEmpty.outerHTML + teamACardsHTML;
        } else {
            teamACardsEmpty.style.display = 'flex';
        }
        
        const teamBCardsHTML = matchState.teamB.cards.map(card => createCardHTML(card, false)).join('');
        if (teamBCardsHTML) {
            teamBCardsEmpty.style.display = 'none';
            teamBCardsContent.innerHTML = teamBCardsEmpty.outerHTML + teamBCardsHTML;
        } else {
            teamBCardsEmpty.style.display = 'flex';
        }
    }

    function createCardHTML(card, isTeamA) {
        const eventType = card.isYellow ? 'Yellow Card' : (card.isGoal ? 'Goal' : 'Red Card');
        return `
            <div class="event-card" data-id="${card.id}">
                <div class="event-icon ${card.isYellow ? 'yellow-icon' : (card.isGoal ? 'goal-icon' : 'red-icon')}">
                    <i class="fas fa-${card.isGoal ? 'futbol' : 'square'}"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">${eventType} - #${card.playerNumber}</div>
                    <div class="event-time">Time: ${card.timeStamp}</div>
                </div>
                <button class="edit-btn" onclick="editCard('${card.id}', ${isTeamA})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    function groupSubstitutionsByWindow(subs) {
        const windows = {};
        subs.forEach(sub => {
            const windowId = sub.timeStamp;
            if (!windows[windowId]) {
                windows[windowId] = {
                    id: windowId,
                    substitutions: [],
                    timeStamp: sub.timeStamp
                };
            }
            windows[windowId].substitutions.push(sub);
        });
        return Object.values(windows).sort((a, b) => {
            if (a.timeStamp === "Half-Time") return -1;
            if (b.timeStamp === "Half-Time") return 1;
            const timeA = a.timeStamp.replace(/\+.*$/, '');
            const timeB = b.timeStamp.replace(/\+.*$/, '');
            const [minsA, secsA] = timeA.split(':').map(Number);
            const [minsB, secsB] = timeB.split(':').map(Number);
            if (minsA !== minsB) return minsA - minsB;
            return secsA - secsB;
        });
    }

    function renderTeamSubstitutions() {
        const teamASubWindows = groupSubstitutionsByWindow(matchState.teamA.substitutions);
        const teamBSubWindows = groupSubstitutionsByWindow(matchState.teamB.substitutions);
        
        const teamASubsHTML = teamASubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, true)
        ).join('');
        
        const teamBSubsHTML = teamBSubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, false)
        ).join('');
        
        if (teamASubsHTML) {
            teamASubsEmpty.style.display = 'none';
            teamASubsContent.innerHTML = teamASubsEmpty.outerHTML + teamASubsHTML;
        } else {
            teamASubsEmpty.style.display = 'flex';
        }
        
        if (teamBSubsHTML) {
            teamBSubsEmpty.style.display = 'none';
            teamBSubsContent.innerHTML = teamBSubsEmpty.outerHTML + teamBSubsHTML;
        } else {
            teamBSubsEmpty.style.display = 'flex';
        }
    }

    function createSubWindowHTML(window, windowNumber, isTeamA) {
        const subsHTML = window.substitutions.map(sub => 
            `<div class="sub-entry">
                <span class="player-numbers">#${sub.playerInNumber} In, #${sub.playerOutNumber} Out</span>
            </div>`
        ).join('');
        
        return `
            <div class="event-card sub-window" data-id="${window.id}">
                <div class="event-icon ${isTeamA ? 'sub-icon-a' : 'sub-icon-b'}">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">Substitution Window ${windowNumber} (${window.substitutions.length} Players)</div>
                    <div class="event-time">Time: ${window.timeStamp}</div>
                    <div class="substitutions-list">
                        ${subsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    function startMatch() {
        if (matchState.isSecondHalf) return;
        matchState.isMatchStarted = true;
        matchState.startTime = new Date();
        startTimers();
        updateUI();
        saveMatchData();
    }

    function startSecondHalf() {
        if (matchState.isSecondHalf) return;
        matchState.isMatchStarted = true;
        matchState.isSecondHalf = true;
        matchState.startTime = new Date();
        matchState.elapsedTime = "45:00";
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
    const totalSeconds = Math.floor(difference / 1000);
    let baseMinutes = matchState.isSecondHalf ? 45 : 0;
    const maxMinutes = matchState.isSecondHalf ? 90 : 45;
    const regularMinutes = Math.min(maxMinutes, baseMinutes + Math.floor(totalSeconds / 60));
    const regularSeconds = totalSeconds % 60;
    matchState.elapsedTime = `${String(regularMinutes).padStart(2, '0')}:${String(regularSeconds).padStart(2, '0')}`;
    
    const maxTimeSeconds = (matchState.isSecondHalf ? 90 : 45) * 60;
    if (totalSeconds >= maxTimeSeconds && matchState.totalInjurySeconds > 0) {
        const elapsedSinceMax = totalSeconds - maxTimeSeconds;
        const remainingInjurySeconds = Math.max(0, matchState.totalInjurySeconds - elapsedSinceMax);
        const injuryMinutes = Math.floor(remainingInjurySeconds / 60);
        const injurySeconds = remainingInjurySeconds % 60;
        const countdownDisplay = `<i class="fas fa-stopwatch"></i> +${String(injuryMinutes).padStart(2, '0')}:${String(injurySeconds).padStart(2, '0')}`;
        
        injuryTimeEl.innerHTML = countdownDisplay;
        injuryTimeEl.style.display = 'inline-flex';
        injuryTimeEl.style.color = '#D32F2F';
        totalInjuryEl.style.display = 'none';
        
        if (remainingInjurySeconds === 0) {
            if (matchState.isInjuryTimeActive) toggleInjuryTime();
            endMatch();
        }
    } else {
        matchTimeEl.textContent = matchState.elapsedTime;
        if (!matchState.isInjuryTimeActive) {
            injuryTimeEl.style.display = 'none';
            if (matchState.totalInjurySeconds > 0) {
                totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
                totalInjuryEl.style.display = 'block';
            } else {
                totalInjuryEl.style.display = 'none';
            }
        }
    }
}

   function toggleInjuryTime() {
    if (!matchState.isMatchStarted) {
        alert('Please start the match first');
        return;
    }
    
    matchState.isInjuryTimeActive = !matchState.isInjuryTimeActive;
    
    if (matchState.isInjuryTimeActive) {
        matchState.currentInjuryStartTime = new Date();
        matchState.currentInjuryTimeDisplay = '<i class="fas fa-stopwatch"></i> +00:00'; // ตั้งค่าเริ่มต้นทันที
        injuryTimeEl.innerHTML = matchState.currentInjuryTimeDisplay;
        injuryTimeEl.style.display = 'inline-flex'; // แสดงทันที
        totalInjuryEl.style.display = 'none';
        injuryTimer = setInterval(updateInjuryTime, 1000);
        injuryBtn.classList.add('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Stop Injury Time';
        injuryFab.classList.add('injury-active');
    } else {
        if (matchState.currentInjuryStartTime) {
            const now = new Date();
            const injuryDuration = now - matchState.currentInjuryStartTime;
            const injurySeconds = Math.floor(injuryDuration / 1000);
            matchState.totalInjurySeconds += injurySeconds;
            const mins = String(Math.floor(injurySeconds / 60)).padStart(2, '0');
            const secs = String(injurySeconds % 60).padStart(2, '0');
            matchState.injuryTimePeriods.push(`+${mins}:${secs}`);
            showInjuryTimeSummary(injurySeconds);
        }
        clearInterval(injuryTimer);
        matchState.currentInjuryStartTime = null;
        matchState.currentInjuryTimeDisplay = '<i class="fas fa-stopwatch"></i> +00:00';
        injuryTimeEl.style.display = 'none';
        if (matchState.totalInjurySeconds > 0) {
            totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
            totalInjuryEl.style.display = 'block';
        }
        injuryBtn.classList.remove('active');
        injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Injury Time';
        injuryFab.classList.remove('injury-active');
    }
    
    updateUI();
    saveMatchData();
}

   function updateInjuryTime() {
    if (!matchState.currentInjuryStartTime) return;
    const now = new Date();
    const difference = now - matchState.currentInjuryStartTime;
    const minutes = Math.floor(difference / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);
    matchState.currentInjuryTimeDisplay = `<i class="fas fa-stopwatch"></i> +${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    injuryTimeEl.innerHTML = matchState.currentInjuryTimeDisplay;
    injuryTimeEl.style.display = 'inline-flex';
}

    function getTotalInjuryTimeDisplay() {
        const minutes = Math.floor(matchState.totalInjurySeconds / 60);
        const seconds = matchState.totalInjurySeconds % 60;
        return `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function showInjuryTimeSummary(currentPeriodSeconds) {
        const totalMins = String(Math.floor(matchState.totalInjurySeconds / 60)).padStart(2, '0');
        const totalSecs = String(matchState.totalInjurySeconds % 60).padStart(2, '0');
        const currentMins = String(Math.floor(currentPeriodSeconds / 60)).padStart(2, '0');
        const currentSecs = String(currentPeriodSeconds % 60).padStart(2, '0');
        
        let summaryHTML = `
            <p>Current Injury Time Period: +${currentMins}:${currentSecs}</p>
            <p style="margin-top: 8px;">Total Accumulated Injury Time: +${totalMins}:${totalSecs}</p>
        `;
        
        if (matchState.injuryTimePeriods.length > 1) {
            summaryHTML += `
                <div style="margin-top: 16px;">
                    <p>Injury Time History:</p>
                    <div style="margin-top: 8px;">
                        ${matchState.injuryTimePeriods.map((period, index) => 
                            `<p>Period ${index + 1}: ${period}</p>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
        
        injurySummaryContent.innerHTML = summaryHTML;
        injurySummaryModal.style.display = 'flex';
    }

    function showTeamCustomizationDialog() {
        teamANameInput.value = matchState.teamA.name;
        teamBNameInput.value = matchState.teamB.name;
        initColorPickers();
        teamSettingsModal.style.display = 'flex';
    }

    function saveTeamSettings() {
        const teamAName = teamANameInput.value.trim() || 'Team A';
        const teamBName = teamBNameInput.value.trim() || 'Team B';
        const teamAColorOption = document.querySelector('#teamAColorPicker .color-option.selected');
        const teamBColorOption = document.querySelector('#teamBColorPicker .color-option.selected');
        const teamAColor = teamAColorOption ? teamAColorOption.style.backgroundColor : matchState.teamA.color;
        const teamBColor = teamBColorOption ? teamBColorOption.style.backgroundColor : matchState.teamB.color;
        
        matchState.teamA.name = teamAName;
        matchState.teamA.color = teamAColor;
        matchState.teamB.name = teamBName;
        matchState.teamB.color = teamBColor;
        
        updateUI();
        saveMatchData();
        teamSettingsModal.style.display = 'none';
    }

    function showCardDialog(isTeamA, isYellow, isGoal, cardToEdit = null) {
        if (!matchState.isMatchStarted && !cardToEdit) {
            alert('Please start the match first');
            return;
        }
        
        currentCardContext = { isTeamA, isYellow, isGoal, cardToEdit };
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        const eventType = isGoal ? 'Goal' : (isYellow ? 'Yellow Card' : 'Red Card');
        cardModalTitle.textContent = `${cardToEdit ? 'Edit ' : ''}${eventType} - ${teamName}`;
        playerNumberInput.value = cardToEdit ? cardToEdit.playerNumber : '';
        
        if (cardToEdit) {
            let deleteBtn = document.getElementById('deleteCardBtn');
            if (!deleteBtn) {
                deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteCardBtn';
                deleteBtn.className = 'modal-btn delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', deleteCardEvent);
                cardModalActions.insertBefore(deleteBtn, cancelCardBtn);
            }
        } else {
            const deleteBtn = document.getElementById('deleteCardBtn');
            if (deleteBtn) deleteBtn.remove();
        }
        
        saveCardBtn.style.backgroundColor = isGoal ? '#4CAF50' : (isYellow ? '#FFC107' : '#D32F2F');
        saveCardBtn.style.color = isYellow ? 'black' : 'white';
        cardModal.style.display = 'flex';
        playerNumberInput.focus();
    }

    function saveCardEvent() {
        const playerNumber = playerNumberInput.value.trim();
        if (!playerNumber) {
            alert('Please enter a player number');
            return;
        }
        
        const { isTeamA, isYellow, isGoal, cardToEdit } = currentCardContext;
        const currentTimeStamp = cardToEdit ? cardToEdit.timeStamp : 
            (matchState.isInjuryTimeActive ? 
                `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                matchState.elapsedTime);
        
        if (cardToEdit) {
            cardToEdit.playerNumber = playerNumber;
            if (cardToEdit.isGoal && !isGoal) {
                if (isTeamA) matchState.teamA.goals--;
                else matchState.teamB.goals--;
            } else if (!cardToEdit.isGoal && isGoal) {
                if (isTeamA) matchState.teamA.goals++;
                else matchState.teamB.goals++;
            }
        } else {
            const newCard = {
                id: Date.now().toString(),
                isYellow,
                isGoal,
                timeStamp: currentTimeStamp,
                playerNumber
            };
            if (isTeamA) {
                matchState.teamA.cards.push(newCard);
                if (isGoal) matchState.teamA.goals++;
            } else {
                matchState.teamB.cards.push(newCard);
                if (isGoal) matchState.teamB.goals++;
            }
        }
        
        renderTeamCards();
        updateUI();
        saveMatchData();
        cardModal.style.display = 'none';
    }

    function deleteCardEvent() {
        const { isTeamA, cardToEdit } = currentCardContext;
        if (!cardToEdit) return;
        if (isTeamA) {
            matchState.teamA.cards = matchState.teamA.cards.filter(card => card.id !== cardToEdit.id);
            if (cardToEdit.isGoal) matchState.teamA.goals--;
        } else {
            matchState.teamB.cards = matchState.teamB.cards.filter(card => card.id !== cardToEdit.id);
            if (cardToEdit.isGoal) matchState.teamB.goals--;
        }
        renderTeamCards();
        updateUI();
        saveMatchData();
        cardModal.style.display = 'none';
    }

    function showSubstitutionDialog(isTeamA) {
        if (!matchState.isMatchStarted) {
            alert('Please start the match first');
            return;
        }
        
        const team = isTeamA ? 'A' : 'B';
        showSubModal(team, false);
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    function showResetConfirmDialog() {
        resetConfirmModal.style.display = 'flex';
    }

    function resetAllData() {
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        matchState = {
            isMatchStarted: false,
            isSecondHalf: false,
            startTime: null,
            elapsedTime: "00:00",
            firstHalfEndTime: null,
            firstHalfInjurySeconds: 0,
            teamA: {
                name: "Team A",
                color: "#1976D2",
                cards: [],
                substitutions: [],
                subWindows: 0,
                goals: 0,
                halfTimeSubUsed: false
            },
            teamB: {
                name: "Team B",
                color: "#D32F2F",
                cards: [],
                substitutions: [],
                subWindows: 0,
                goals: 0,
                halfTimeSubUsed: false
            },
            isInjuryTimeActive: false,
            totalInjurySeconds: 0,
            injuryTimePeriods: [],
            currentInjuryStartTime: null,
            currentInjuryTimeDisplay: "+00:00",
            activeSubWindow: {
                teamA: false,
                teamB: false
            }
        };
        clearMatchData();
        updateUI();
    }

    function endMatch() {
        if (!matchState.isMatchStarted) {
            alert('There is no match to end');
            return;
        }
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        if (matchState.isInjuryTimeActive) toggleInjuryTime();
        
        if (!matchState.isSecondHalf) {
            matchState.firstHalfEndTime = matchState.elapsedTime;
            matchState.firstHalfInjurySeconds = matchState.totalInjurySeconds;
            matchState.isMatchStarted = false;
            startSecondHalfBtn.style.display = 'block';
            updateUI();
            saveMatchData();
        } else {
            showMatchSummary();
        }
    }

    function showMatchSummary() {
        const teamA = matchState.teamA;
        const teamB = matchState.teamB;
        const teamAYellowCards = teamA.cards.filter(card => card.isYellow).length;
        const teamARedCards = teamA.cards.filter(card => !card.isYellow && !card.isGoal).length;
        const teamAGoals = teamA.goals;
        const teamBYellowCards = teamB.cards.filter(card => card.isYellow).length;
        const teamBRedCards = teamB.cards.filter(card => !card.isYellow && !card.isGoal).length;
        const teamBGoals = teamB.goals;
        const teamASubWindows = groupSubstitutionsByWindow(teamA.substitutions);
        const teamBSubWindows = groupSubstitutionsByWindow(teamB.substitutions);
        const firstHalfTime = matchState.firstHalfEndTime || "45:00";
        const secondHalfTime = matchState.elapsedTime;
        const firstHalfInjury = matchState.firstHalfInjurySeconds;
        const secondHalfInjury = matchState.totalInjurySeconds - firstHalfInjury;

        let summaryHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">Match Duration</h3>
                <p>First Half: ${firstHalfTime} (Injury Time: +${String(Math.floor(firstHalfInjury / 60)).padStart(2, '0')}:${String(firstHalfInjury % 60).padStart(2, '0')})</p>
                <p>Second Half: ${secondHalfTime} (Injury Time: +${String(Math.floor(secondHalfInjury / 60)).padStart(2, '0')}:${String(secondHalfInjury % 60).padStart(2, '0')})</p>
                <p>Total Injury Time: ${getTotalInjuryTimeDisplay()}</p>
            </div>
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">${teamA.name}</h3>
                <p>Goals: ${teamAGoals}</p>
                <p>Yellow Cards: ${teamAYellowCards}</p>
                <p>Red Cards: ${teamARedCards}</p>
                <p>Substitution Windows: ${teamASubWindows.length} (${teamA.substitutions.length} Players)</p>
                ${teamA.cards.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>Event Details:</p>
                        ${teamA.cards.map(card => `
                            <p style="margin-left: 16px;">- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})</p>
                        `).join('')}
                    </div>
                ` : ''}
                ${teamASubWindows.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>Substitution Details:</p>
                        ${teamASubWindows.map((window, index) => `
                            <p style="margin-left: 16px;">- Window ${index + 1} (${window.timeStamp}):</p>
                            ${window.substitutions.map(sub => `
                                <p style="margin-left: 32px;">#${sub.playerInNumber} In, #${sub.playerOutNumber} Out</p>
                            `).join('')}
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div>
                <h3 style="margin-bottom: 8px;">${teamB.name}</h3>
                <p>Goals: ${teamBGoals}</p>
                <p>Yellow Cards: ${teamBYellowCards}</p>
                <p>Red Cards: ${teamBRedCards}</p>
                <p>Substitution Windows: ${teamBSubWindows.length} (${teamB.substitutions.length} Players)</p>
                ${teamB.cards.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>Event Details:</p>
                        ${teamB.cards.map(card => `
                            <p style="margin-left: 16px;">- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})</p>
                        `).join('')}
                    </div>
                ` : ''}
                ${teamBSubWindows.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>Substitution Details:</p>
                        ${teamBSubWindows.map((window, index) => `
                            <p style="margin-left: 16px;">- Window ${index + 1} (${window.timeStamp}):</p>
                            ${window.substitutions.map(sub => `
                                <p style="margin-left: 32px;">#${sub.playerInNumber} In, #${sub.playerOutNumber} Out</p>
                            `).join('')}
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        matchSummaryContent.innerHTML = summaryHTML;
        matchSummaryModal.style.display = 'flex';
        matchState.isMatchStarted = false;
        updateUI();
        saveMatchData();
    }

    function saveSummaryAsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Match Summary", 105, 10, { align: "center" });
        
        const teamA = matchState.teamA;
        const teamB = matchState.teamB;
        const teamAYellowCards = teamA.cards.filter(card => card.isYellow).length;
        const teamARedCards = teamA.cards.filter(card => !card.isYellow && !card.isGoal).length;
        const teamAGoals = teamA.goals;
        const teamBYellowCards = teamB.cards.filter(card => card.isYellow).length;
        const teamBRedCards = teamB.cards.filter(card => !card.isYellow && !card.isGoal).length;
        const teamBGoals = teamB.goals;
        const teamASubWindows = groupSubstitutionsByWindow(teamA.substitutions);
        const teamBSubWindows = groupSubstitutionsByWindow(teamB.substitutions);
        const firstHalfInjury = matchState.firstHalfInjurySeconds;
        const secondHalfInjury = matchState.totalInjurySeconds - firstHalfInjury;
        
        let yPos = 20;
        
        doc.setFontSize(14);
        doc.text("Match Duration", 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`First Half: ${matchState.firstHalfEndTime || "45:00"} (Injury: +${String(Math.floor(firstHalfInjury / 60)).padStart(2, '0')}:${String(firstHalfInjury % 60).padStart(2, '0')})`, 10, yPos);
        yPos += 7;
        doc.text(`Second Half: ${matchState.elapsedTime} (Injury: +${String(Math.floor(secondHalfInjury / 60)).padStart(2, '0')}:${String(secondHalfInjury % 60).padStart(2, '0')})`, 10, yPos);
        yPos += 7;
        doc.text(`Total Injury Time: ${getTotalInjuryTimeDisplay()}`, 10, yPos);
        yPos += 10;
        
        doc.setFontSize(14);
        doc.text(teamA.name, 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Goals: ${teamAGoals}`, 10, yPos);
        yPos += 7;
        doc.text(`Yellow Cards: ${teamAYellowCards}`, 10, yPos);
        yPos += 7;
        doc.text(`Red Cards: ${teamARedCards}`, 10, yPos);
        yPos += 7;
        doc.text(`Substitution Windows: ${teamASubWindows.length} (${teamA.substitutions.length} Players)`, 10, yPos);
        yPos += 7;
        
        if (teamA.cards.length > 0) {
            yPos += 5;
            doc.text("Event Details:", 10, yPos);
            yPos += 7;
            teamA.cards.forEach(card => {
                doc.text(`- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 10;
                }
            });
        }
        
        if (teamASubWindows.length > 0) {
            yPos += 5;
            doc.text("Substitution Details:", 10, yPos);
            yPos += 7;
            teamASubWindows.forEach((window, index) => {
                doc.text(`- Window ${index + 1} (${window.timeStamp}):`, 15, yPos);
                yPos += 7;
                window.substitutions.forEach(sub => {
                    doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                    yPos += 7;
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 10;
                    }
                });
            });
        }
        
        yPos += 10;
        
        doc.setFontSize(14);
        doc.text(teamB.name, 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Goals: ${teamBGoals}`, 10, yPos);
        yPos += 7;
        doc.text(`Yellow Cards: ${teamBYellowCards}`, 10, yPos);
        yPos += 7;
        doc.text(`Red Cards: ${teamBRedCards}`, 10, yPos);
        yPos += 7;
        doc.text(`Substitution Windows: ${teamBSubWindows.length} (${teamB.substitutions.length} Players)`, 10, yPos);
        yPos += 7;
        
        if (teamB.cards.length > 0) {
            yPos += 5;
            doc.text("Event Details:", 10, yPos);
            yPos += 7;
            teamB.cards.forEach(card => {
                doc.text(`- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 10;
                }
            });
        }
        
        if (teamBSubWindows.length > 0) {
            yPos += 5;
            doc.text("Substitution Details:", 10, yPos);
            yPos += 7;
            teamBSubWindows.forEach((window, index) => {
                doc.text(`- Window ${index + 1} (${window.timeStamp}):`, 15, yPos);
                yPos += 7;
                window.substitutions.forEach(sub => {
                    doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                    yPos += 7;
                    if (yPos > 280) {
                        doc.addPage();
                        yPos = 10;
                    }
                });
            });
        }
        
        doc.save(`Match_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    window.editCard = function(cardId, isTeamA) {
        const card = isTeamA 
            ? matchState.teamA.cards.find(c => c.id === cardId)
            : matchState.teamB.cards.find(c => c.id === cardId);
        if (card) showCardDialog(isTeamA, card.isYellow, card.isGoal, card);
    };

    init();
});
