document.addEventListener('DOMContentLoaded', function() {
    // Match state
    let matchState = {
        isMatchStarted: false,
        startTime: null,
        elapsedTime: "00:00",
        teamA: {
            name: "ทีม A",
            color: "#1976D2",
            cards: [],
            substitutions: [],
            subWindows: 0,
        },
        teamB: {
            name: "ทีม B",
            color: "#D32F2F",
            cards: [],
            substitutions: [],
            subWindows: 0,
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

    // Timer variables
    let matchTimer;
    let injuryTimer;
    let autoSaveTimer;

    // DOM Elements
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

    // Team A buttons
    const teamAYellowBtn = document.getElementById('teamAYellowBtn');
    const teamARedBtn = document.getElementById('teamARedBtn');
    const teamASubBtn = document.getElementById('teamASubBtn');

    // Team B buttons
    const teamBYellowBtn = document.getElementById('teamBYellowBtn');
    const teamBRedBtn = document.getElementById('teamBRedBtn');
    const teamBSubBtn = document.getElementById('teamBSubBtn');

    // Content containers
    const teamACardsContent = document.getElementById('teamACardsContent');
    const teamASubsContent = document.getElementById('teamASubsContent');
    const teamBCardsContent = document.getElementById('teamBCardsContent');
    const teamBSubsContent = document.getElementById('teamBSubsContent');

    // Empty states
    const teamACardsEmpty = document.getElementById('teamACardsEmpty');
    const teamASubsEmpty = document.getElementById('teamASubsEmpty');
    const teamBCardsEmpty = document.getElementById('teamBCardsEmpty');
    const teamBSubsEmpty = document.getElementById('teamBSubsEmpty');

    // Tab elements
    const tabElements = document.querySelectorAll('.tab');

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');

    // Team Settings Modal
    const teamSettingsModal = document.getElementById('teamSettingsModal');
    const closeTeamSettingsBtn = document.getElementById('closeTeamSettingsBtn');
    const teamANameInput = document.getElementById('teamANameInput');
    const teamBNameInput = document.getElementById('teamBNameInput');
    const teamAColorPicker = document.getElementById('teamAColorPicker');
    const teamBColorPicker = document.getElementById('teamBColorPicker');
    const saveTeamSettingsBtn = document.getElementById('saveTeamSettingsBtn');
    const cancelTeamSettingsBtn = document.getElementById('cancelTeamSettingsBtn');

    // Card Modal
    const cardModal = document.getElementById('cardModal');
    const cardModalTitle = document.getElementById('cardModalTitle');
    const playerNumberInput = document.getElementById('playerNumberInput');
    const saveCardBtn = document.getElementById('saveCardBtn');
    const cancelCardBtn = document.getElementById('cancelCardBtn');
    const closeCardModalBtn = document.getElementById('closeCardModalBtn');
    const cardModalActions = document.getElementById('cardModalActions');

    // Substitution Modal
    const subModal = document.getElementById('subModal');
    const subModalTitle = document.getElementById('subModalTitle');
    const playerInInput = document.getElementById('playerInInput');
    const playerOutInput = document.getElementById('playerOutInput');
    const saveSubBtn = document.getElementById('saveSubBtn');
    const cancelSubBtn = document.getElementById('cancelSubBtn');
    const closeSubModalBtn = document.getElementById('closeSubModalBtn');
    const subModalActions = document.getElementById('subModalActions');

    // Add Another Player Substitution section
    const addAnotherSubSection = document.createElement('div');
    addAnotherSubSection.innerHTML = `
        <div class="input-group" id="additionalSubsContainer">
            <!-- Additional player substitutions will be added here -->
        </div>
        <button class="modal-btn add-btn" id="addAnotherSubBtn">
            <i class="fas fa-plus"></i> เพิ่มผู้เล่นที่จะเปลี่ยนตัว
        </button>
    `;

    // Injury Summary Modal
    const injurySummaryModal = document.getElementById('injurySummaryModal');
    const injurySummaryContent = document.getElementById('injurySummaryContent');
    const closeInjurySummaryBtn = document.getElementById('closeInjurySummaryBtn');
    const closeInjurySummaryConfirmBtn = document.getElementById('closeInjurySummaryConfirmBtn');

    // Reset Confirmation Modal
    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const closeResetConfirmBtn = document.getElementById('closeResetConfirmBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    // Match Summary Modal
    const matchSummaryModal = document.getElementById('matchSummaryModal');
    const matchSummaryContent = document.getElementById('matchSummaryContent');
    const closeMatchSummaryBtn = document.getElementById('closeMatchSummaryBtn');
    const closeMatchSummaryConfirmBtn = document.getElementById('closeMatchSummaryConfirmBtn');
    const saveAsPdfBtn = document.getElementById('saveAsPdfBtn');

    // Available team colors
    const availableColors = [
        '#1976D2', '#D32F2F', '#4CAF50', '#FF9800', '#9C27B0',
        '#009688', '#3F51B5', '#E91E63', '#FFC107', '#00BCD4',
        '#FF5722', '#673AB7', '#03A9F4', '#8BC34A'
    ];

    // Variables to track current modal context
    let currentCardContext = {
        isTeamA: true,
        isYellow: true,
        cardToEdit: null
    };

    let currentSubContext = {
        isTeamA: true,
        subToEdit: null,
        additionalSubs: []
    };

    // Initialize the page
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

    // Set up all event listeners
    function setupEventListeners() {
        startMatchBtn.addEventListener('click', startMatch);
        injuryBtn.addEventListener('click', toggleInjuryTime);
        injuryFab.addEventListener('click', toggleInjuryTime);
        endMatchBtn.addEventListener('click', endMatch);

        teamAYellowBtn.addEventListener('click', () => showCardDialog(true, true));
        teamARedBtn.addEventListener('click', () => showCardDialog(true, false));
        teamASubBtn.addEventListener('click', () => showSubstitutionDialog(true));
        
        teamBYellowBtn.addEventListener('click', () => showCardDialog(false, true));
        teamBRedBtn.addEventListener('click', () => showCardDialog(false, false));
        teamBSubBtn.addEventListener('click', () => showSubstitutionDialog(false));
        
        tabElements.forEach(tab => {
            tab.addEventListener('click', () => {
                const team = tab.dataset.team;
                const tabType = tab.dataset.tab;
                document.querySelectorAll(`.tab[data-team="${team}"]`).forEach(t => {
                    t.classList.remove('active');
                });
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
        
        closeSubModalBtn.addEventListener('click', closeSubstitutionDialog);
        saveSubBtn.addEventListener('click', saveSubstitutionEvent);
        cancelSubBtn.addEventListener('click', closeSubstitutionDialog);
        
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

    // Initialize color pickers
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

    // Load saved match data
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
                matchState.activeSubWindow = { teamA: false, teamB: false };
            }
            updateUI();
            if (matchState.isMatchStarted) startTimers();
        }
    }

    function calculateUsedSubWindows(substitutions) {
        if (!substitutions || substitutions.length === 0) return 0;
        const windows = new Set();
        substitutions.forEach(sub => {
            windows.add(sub.windowId || sub.id);
        });
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

    function updateSubstitutionButtonsState() {
        if (matchState.isMatchStarted) {
            if (matchState.teamA.subWindows >= 3 && !matchState.activeSubWindow.teamA) {
                teamASubBtn.disabled = true;
                teamASubBtn.classList.add('disabled');
                teamASubBtn.innerHTML = 'ใช้โควต้าหมดแล้ว';
            } else {
                teamASubBtn.disabled = false;
                teamASubBtn.classList.remove('disabled');
                teamASubBtn.innerHTML = 'เปลี่ยนตัว' + (matchState.activeSubWindow.teamA ? ' (เปิดอยู่)' : '');
            }
            
            if (matchState.teamB.subWindows >= 3 && !matchState.activeSubWindow.teamB) {
                teamBSubBtn.disabled = true;
                teamBSubBtn.classList.add('disabled');
                teamBSubBtn.innerHTML = 'ใช้โควต้าหมดแล้ว';
            } else {
                teamBSubBtn.disabled = false;
                teamBSubBtn.classList.remove('disabled');
                teamBSubBtn.innerHTML = 'เปลี่ยนตัว' + (matchState.activeSubWindow.teamB ? ' (เปิดอยู่)' : '');
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
        return `
            <div class="event-card" data-id="${card.id}">
                <div class="event-icon ${card.isYellow ? 'yellow-icon' : 'red-icon'}">
                    <i class="fas fa-square"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">${card.isYellow ? 'ใบเหลือง' : 'ใบแดง'} - #${card.playerNumber}</div>
                    <div class="event-time">เวลา: ${card.timeStamp}</div>
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
            const windowId = sub.windowId || sub.id;
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
                <span class="player-numbers">#${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก</span>
            </div>`
        ).join('');
        
        return `
            <div class="event-card sub-window" data-id="${window.id}">
                <div class="event-icon ${isTeamA ? 'sub-icon-a' : 'sub-icon-b'}">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">ช่วงเปลี่ยนตัวที่ ${windowNumber} (${window.substitutions.length} คน)</div>
                    <div class="event-time">เวลา: ${window.timeStamp}</div>
                    <div class="substitutions-list">
                        ${subsHTML}
                    </div>
                </div>
                <button class="edit-btn" onclick="editSubstitutionWindow('${window.id}', ${isTeamA})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    function startMatch() {
        matchState.isMatchStarted = true;
        matchState.startTime = new Date();
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
    }

    function toggleInjuryTime() {
        if (!matchState.isMatchStarted) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        matchState.isInjuryTimeActive = !matchState.isInjuryTimeActive;
        
        if (matchState.isInjuryTimeActive) {
            matchState.currentInjuryStartTime = new Date();
            injuryTimer = setInterval(updateInjuryTime, 1000);
            injuryTimeEl.style.display = 'block';
            totalInjuryEl.style.display = 'none';
            injuryBtn.classList.add('active');
            injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> หยุดทดเวลา';
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
            matchState.currentInjuryTimeDisplay = '+00:00';
            injuryTimeEl.style.display = 'none';
            totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
            totalInjuryEl.style.display = 'block';
            injuryBtn.classList.remove('active');
            injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> ทดเวลา';
            injuryFab.classList.remove('injury-active');
        }
        
        saveMatchData();
    }

    function updateInjuryTime() {
        if (!matchState.currentInjuryStartTime) return;
        const now = new Date();
        const difference = now - matchState.currentInjuryStartTime;
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        matchState.currentInjuryTimeDisplay = `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        injuryTimeEl.textContent = matchState.currentInjuryTimeDisplay;
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
            <p>เวลาทดเจ็บช่วงนี้: +${currentMins}:${currentSecs}</p>
            <p style="margin-top: 8px;">เวลาทดเจ็บสะสมทั้งหมด: +${totalMins}:${totalSecs}</p>
        `;
        
        if (matchState.injuryTimePeriods.length > 1) {
            summaryHTML += `
                <div style="margin-top: 16px;">
                    <p>ประวัติเวลาทดเจ็บ:</p>
                    <div style="margin-top: 8px;">
                        ${matchState.injuryTimePeriods.map((period, index) => 
                            `<p>ช่วงที่ ${index + 1}: ${period}</p>`
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
        const teamAName = teamANameInput.value.trim() || 'ทีม A';
        const teamBName = teamBNameInput.value.trim() || 'ทีม B';
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

    function showCardDialog(isTeamA, isYellow, cardToEdit = null) {
        if (!matchState.isMatchStarted && !cardToEdit) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        currentCardContext = { isTeamA, isYellow, cardToEdit };
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        const cardType = isYellow ? 'ใบเหลือง' : 'ใบแดง';
        cardModalTitle.textContent = `${cardToEdit ? 'แก้ไข ' : ''}${cardType} - ${teamName}`;
        playerNumberInput.value = cardToEdit ? cardToEdit.playerNumber : '';
        
        if (cardToEdit) {
            let deleteBtn = document.getElementById('deleteCardBtn');
            if (!deleteBtn) {
                deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteCardBtn';
                deleteBtn.className = 'modal-btn delete-btn';
                deleteBtn.textContent = 'ลบ';
                deleteBtn.addEventListener('click', deleteCardEvent);
                cardModalActions.insertBefore(deleteBtn, cancelCardBtn);
            }
        } else {
            const deleteBtn = document.getElementById('deleteCardBtn');
            if (deleteBtn) deleteBtn.remove();
        }
        
        saveCardBtn.style.backgroundColor = isYellow ? '#FFC107' : '#D32F2F';
        saveCardBtn.style.color = isYellow ? 'black' : 'white';
        cardModal.style.display = 'flex';
        playerNumberInput.focus();
    }

    function saveCardEvent() {
        const playerNumber = playerNumberInput.value.trim();
        if (!playerNumber) {
            alert('กรุณาระบุหมายเลขผู้เล่น');
            return;
        }
        
        const { isTeamA, isYellow, cardToEdit } = currentCardContext;
        const currentTimeStamp = cardToEdit ? cardToEdit.timeStamp : 
            (matchState.isInjuryTimeActive ? 
                `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                matchState.elapsedTime);
        
        if (cardToEdit) {
            cardToEdit.playerNumber = playerNumber;
        } else {
            const newCard = {
                id: Date.now().toString(),
                isYellow,
                timeStamp: currentTimeStamp,
                playerNumber
            };
            if (isTeamA) matchState.teamA.cards.push(newCard);
            else matchState.teamB.cards.push(newCard);
        }
        
        renderTeamCards();
        saveMatchData();
        cardModal.style.display = 'none';
    }

    function deleteCardEvent() {
        const { isTeamA, cardToEdit } = currentCardContext;
        if (!cardToEdit) return;
        if (isTeamA) {
            matchState.teamA.cards = matchState.teamA.cards.filter(card => card.id !== cardToEdit.id);
        } else {
            matchState.teamB.cards = matchState.teamB.cards.filter(card => card.id !== cardToEdit.id);
        }
        renderTeamCards();
        saveMatchData();
        cardModal.style.display = 'none';
    }

    function showSubstitutionDialog(isTeamA, windowToEdit = null) {
        if (!matchState.isMatchStarted && !windowToEdit) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        if (!windowToEdit && !matchState.activeSubWindow[isTeamA ? 'teamA' : 'teamB']) {
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            if (team.subWindows >= 3) {
                alert(`${team.name} ได้ใช้ช่วงเปลี่ยนตัวครบ 3 ครั้งแล้ว`);
                return;
            }
        }
        
        currentSubContext = { isTeamA, windowToEdit, additionalSubs: [] };
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        subModalTitle.textContent = `${windowToEdit ? 'แก้ไข ' : ''}เปลี่ยนตัว - ${teamName}`;
        playerInInput.value = '';
        playerOutInput.value = '';
        
        const additionalSubsContainer = document.getElementById('additionalSubsContainer');
        if (!additionalSubsContainer) {
            const modalContent = subModal.querySelector('.modal-content');
            modalContent.insertBefore(addAnotherSubSection, subModalActions);
            document.getElementById('addAnotherSubBtn').addEventListener('click', addAnotherSubstitution);
        } else {
            additionalSubsContainer.innerHTML = '';
        }
        
        if (windowToEdit) {
            const subs = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .filter(sub => sub.windowId === windowToEdit || sub.id === windowToEdit);
            if (subs.length > 0) {
                playerInInput.value = subs[0].playerInNumber;
                playerOutInput.value = subs[0].playerOutNumber;
                if (subs.length > 1) {
                    for (let i = 1; i < subs.length; i++) {
                        const newSubFields = createSubstitutionFields(subs[i].playerInNumber, subs[i].playerOutNumber);
                        document.getElementById('additionalSubsContainer').appendChild(newSubFields);
                    }
                }
            }
            let deleteBtn = document.getElementById('deleteSubWindowBtn');
            if (!deleteBtn) {
                deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteSubWindowBtn';
                deleteBtn.className = 'modal-btn delete-btn';
                deleteBtn.textContent = 'ลบช่วงเปลี่ยนตัวนี้';
                deleteBtn.addEventListener('click', deleteSubstitutionWindow);
                subModalActions.insertBefore(deleteBtn, cancelSubBtn);
            }
        } else {
            const deleteBtn = document.getElementById('deleteSubWindowBtn');
            if (deleteBtn) deleteBtn.remove();
        }
        
        saveSubBtn.style.backgroundColor = isTeamA ? matchState.teamA.color : matchState.teamB.color;
        subModal.style.display = 'flex';
        playerInInput.focus();
    }

    function createSubstitutionFields(playerIn = '', playerOut = '') {
        const subFieldsContainer = document.createElement('div');
        subFieldsContainer.className = 'substitution-fields';
        subFieldsContainer.innerHTML = `
            <div class="sub-header">
                <span>ผู้เล่นเพิ่มเติม</span>
                <button type="button" class="remove-sub-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="input-group">
                <div class="input-label">หมายเลขผู้เล่นที่เข้า</div>
                <input type="number" class="input-field player-in" placeholder="เลขผู้เล่นที่เข้า" value="${playerIn}">
            </div>
            <div class="input-group">
                <div class="input-label">หมายเลขผู้เล่นที่ออก</div>
                <input type="number" class="input-field player-out" placeholder="เลขผู้เล่นที่ออก" value="${playerOut}">
            </div>
        `;
        
        subFieldsContainer.querySelector('.remove-sub-btn').addEventListener('click', function() {
            subFieldsContainer.remove();
        });
        
        return subFieldsContainer;
    }

    function addAnotherSubstitution() {
        const newSubFields = createSubstitutionFields();
        document.getElementById('additionalSubsContainer').appendChild(newSubFields);
    }

    function closeSubstitutionDialog() {
        subModal.style.display = 'none';
        if (!currentSubContext.windowToEdit) {
            const team = currentSubContext.isTeamA ? 'teamA' : 'teamB';
            if (matchState.activeSubWindow[team]) {
                matchState.activeSubWindow[team] = false;
                updateSubstitutionButtonsState();
            }
        }
    }

    function saveSubstitutionEvent() {
        const playerIn = playerInInput.value.trim();
        const playerOut = playerOutInput.value.trim();
        if (!playerIn || !playerOut) {
            alert('กรุณาระบุหมายเลขผู้เล่นทั้งเข้าและออก');
            return;
        }
        
        const { isTeamA, windowToEdit } = currentSubContext;
        const team = isTeamA ? 'teamA' : 'teamB';
        const currentTimeStamp = windowToEdit ? 
            (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .find(sub => sub.windowId === windowToEdit || sub.id === windowToEdit)?.timeStamp || matchState.elapsedTime
            : 
            (matchState.isInjuryTimeActive ? 
                `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                matchState.elapsedTime);
        
        const windowId = windowToEdit || Date.now().toString();
        const substitutions = [];
        
        substitutions.push({
            id: Date.now().toString() + '-1',
            playerInNumber: playerIn,
            playerOutNumber: playerOut,
            timeStamp: currentTimeStamp,
            windowId: windowId
        });
        
        const additionalSubsContainer = document.getElementById('additionalSubsContainer');
        if (additionalSubsContainer) {
            const additionalFields = additionalSubsContainer.querySelectorAll('.substitution-fields');
            additionalFields.forEach((field, index) => {
                const addPlayerIn = field.querySelector('.player-in').value.trim();
                const addPlayerOut = field.querySelector('.player-out').value.trim();
                if (addPlayerIn && addPlayerOut) {
                    substitutions.push({
                        id: Date.now().toString() + `-${index + 2}`,
                        playerInNumber: addPlayerIn,
                        playerOutNumber: addPlayerOut,
                        timeStamp: currentTimeStamp,
                        windowId: windowId
                    });
                }
            });
        }
        
        if (windowToEdit) {
            const newSubsList = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .filter(sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit);
            if (isTeamA) matchState.teamA.substitutions = [...newSubsList, ...substitutions];
            else matchState.teamB.substitutions = [...newSubsList, ...substitutions];
        } else {
            matchState[team].subWindows++;
            if (isTeamA) matchState.teamA.substitutions = [...matchState.teamA.substitutions, ...substitutions];
            else matchState.teamB.substitutions = [...matchState.teamB.substitutions, ...substitutions];
            matchState.activeSubWindow[team] = false;
        }
        
        renderTeamSubstitutions();
        updateSubstitutionButtonsState();
        saveMatchData();
        subModal.style.display = 'none';
    }

    function deleteSubstitutionWindow() {
        const { isTeamA, windowToEdit } = currentSubContext;
        if (!windowToEdit) return;
        
        const team = isTeamA ? matchState.teamA : matchState.teamB;
        const subsInWindow = team.substitutions.filter(
            sub => sub.windowId === windowToEdit || sub.id === windowToEdit
        );
        team.substitutions = team.substitutions.filter(
            sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit
        );
        if (subsInWindow.length > 0) team.subWindows = Math.max(0, team.subWindows - 1);
        
        renderTeamSubstitutions();
        updateSubstitutionButtonsState();
        saveMatchData();
        subModal.style.display = 'none';
    }

    function showResetConfirmDialog() {
        resetConfirmModal.style.display = 'flex';
    }

    function resetAllData() {
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        matchState = {
            isMatchStarted: false,
            startTime: null,
            elapsedTime: "00:00",
            teamA: {
                name: "ทีม A",
                color: "#1976D2",
                cards: [],
                substitutions: [],
                subWindows: 0
            },
            teamB: {
                name: "ทีม B",
                color: "#D32F2F",
                cards: [],
                substitutions: [],
                subWindows: 0
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
        resetConfirmModal.style.display = 'none';
        showTeamCustomizationDialog();
    }

    function endMatch() {
        if (!matchState.isMatchStarted) {
            alert('ยังไม่มีการแข่งขันให้จบ');
            return;
        }
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        if (matchState.isInjuryTimeActive) toggleInjuryTime();
        showMatchSummary();
    }

    function showMatchSummary() {
        const teamA = matchState.teamA;
        const teamB = matchState.teamB;
        const teamAYellowCards = teamA.cards.filter(card => card.isYellow).length;
        const teamARedCards = teamA.cards.filter(card => !card.isYellow).length;
        const teamBYellowCards = teamB.cards.filter(card => card.isYellow).length;
        const teamBRedCards = teamB.cards.filter(card => !card.isYellow).length;
        const teamASubWindows = groupSubstitutionsByWindow(teamA.substitutions);
        const teamBSubWindows = groupSubstitutionsByWindow(teamB.substitutions);
        const totalMatchTime = matchState.elapsedTime;
        const totalInjuryTime = getTotalInjuryTimeDisplay();

        let summaryHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">ระยะเวลาการแข่งขัน</h3>
                <p>เวลาแข่งขันปกติ: ${totalMatchTime}</p>
                <p>เวลาทดเจ็บรวม: ${totalInjuryTime}</p>
            </div>
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">${teamA.name}</h3>
                <p>ใบเหลือง: ${teamAYellowCards} ใบ</p>
                <p>ใบแดง: ${teamARedCards} ใบ</p>
                <p>จำนวนครั้งเปลี่ยนตัว: ${teamASubWindows.length} ครั้ง (${teamA.substitutions.length} คน)</p>
                ${teamA.cards.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>รายละเอียดใบเตือน:</p>
                        ${teamA.cards.map(card => `
                            <p style="margin-left: 16px;">- ${card.isYellow ? 'ใบเหลือง' : 'ใบแดง'} #${card.playerNumber} (${card.timeStamp})</p>
                        `).join('')}
                    </div>
                ` : ''}
                ${teamASubWindows.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>รายละเอียดการเปลี่ยนตัว:</p>
                        ${teamASubWindows.map((window, index) => `
                            <p style="margin-left: 16px;">- ครั้งที่ ${index + 1} (${window.timeStamp}):</p>
                            ${window.substitutions.map(sub => `
                                <p style="margin-left: 32px;">#${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก</p>
                            `).join('')}
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div>
                <h3 style="margin-bottom: 8px;">${teamB.name}</h3>
                <p>ใบเหลือง: ${teamBYellowCards} ใบ</p>
                <p>ใบแดง: ${teamBRedCards} ใบ</p>
                <p>จำนวนครั้งเปลี่ยนตัว: ${teamBSubWindows.length} ครั้ง (${teamB.substitutions.length} คน)</p>
                ${teamB.cards.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>รายละเอียดใบเตือน:</p>
                        ${teamB.cards.map(card => `
                            <p style="margin-left: 16px;">- ${card.isYellow ? 'ใบเหลือง' : 'ใบแดง'} #${card.playerNumber} (${card.timeStamp})</p>
                        `).join('')}
                    </div>
                ` : ''}
                ${teamBSubWindows.length > 0 ? `
                    <div style="margin-top: 8px;">
                        <p>รายละเอียดการเปลี่ยนตัว:</p>
                        ${teamBSubWindows.map((window, index) => `
                            <p style="margin-left: 16px;">- ครั้งที่ ${index + 1} (${window.timeStamp}):</p>
                            ${window.substitutions.map(sub => `
                                <p style="margin-left: 32px;">#${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก</p>
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
    
    // Title
    doc.setFontSize(16);
    doc.text("Match Summary", 105, 10, { align: "center" });
    
    // Match Data
    const teamA = matchState.teamA;
    const teamB = matchState.teamB;
    const teamAYellowCards = teamA.cards.filter(card => card.isYellow).length;
    const teamARedCards = teamA.cards.filter(card => !card.isYellow).length;
    const teamBYellowCards = teamB.cards.filter(card => card.isYellow).length;
    const teamBRedCards = teamB.cards.filter(card => !card.isYellow).length;
    const teamASubWindows = groupSubstitutionsByWindow(teamA.substitutions);
    const teamBSubWindows = groupSubstitutionsByWindow(teamB.substitutions);
    
    let yPos = 20;
    
    // Match Duration
    doc.setFontSize(14);
    doc.text("Match Duration", 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Normal Time: ${matchState.elapsedTime}`, 10, yPos);
    yPos += 7;
    doc.text(`Total Injury Time: ${getTotalInjuryTimeDisplay()}`, 10, yPos);
    yPos += 15;
    
    // Team A Summary
    doc.setFontSize(14);
    doc.text(teamA.name, 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Yellow Cards: ${teamAYellowCards}`, 10, yPos);
    yPos += 7;
    doc.text(`Red Cards: ${teamARedCards}`, 10, yPos);
    yPos += 7;
    doc.text(`Substitution Windows: ${teamASubWindows.length} (${teamA.substitutions.length} players)`, 10, yPos);
    yPos += 10;

    if (teamA.cards.length > 0) {
        doc.text("Card Details:", 10, yPos);
        yPos += 7;
        teamA.cards.forEach(card => {
            doc.text(`- ${card.isYellow ? 'Yellow' : 'Red'} Card #${card.playerNumber} at ${card.timeStamp}`, 15, yPos);
            yPos += 7;
            if (yPos > 280) { doc.addPage(); yPos = 10; }
        });
    }

    if (teamASubWindows.length > 0) {
        yPos += 5;
        doc.text("Substitution Details:", 10, yPos);
        yPos += 7;
        teamASubWindows.forEach((window, index) => {
            doc.text(`- Window ${index + 1} at ${window.timeStamp}:`, 15, yPos);
            yPos += 7;
            window.substitutions.forEach(sub => {
                doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                yPos += 7;
                if (yPos > 280) { doc.addPage(); yPos = 10; }
            });
        });
    }
    
    yPos += 15;
    
    // Team B Summary
    doc.setFontSize(14);
    doc.text(teamB.name, 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Yellow Cards: ${teamBYellowCards}`, 10, yPos);
    yPos += 7;
    doc.text(`Red Cards: ${teamBRedCards}`, 10, yPos);
    yPos += 7;
    doc.text(`Substitution Windows: ${teamBSubWindows.length} (${teamB.substitutions.length} players)`, 10, yPos);
    yPos += 10;

    if (teamB.cards.length > 0) {
        doc.text("Card Details:", 10, yPos);
        yPos += 7;
        teamB.cards.forEach(card => {
            doc.text(`- ${card.isYellow ? 'Yellow' : 'Red'} Card #${card.playerNumber} at ${card.timeStamp}`, 15, yPos);
            yPos += 7;
            if (yPos > 280) { doc.addPage(); yPos = 10; }
        });
    }

    if (teamBSubWindows.length > 0) {
        yPos += 5;
        doc.text("Substitution Details:", 10, yPos);
        yPos += 7;
        teamBSubWindows.forEach((window, index) => {
            doc.text(`- Window ${index + 1} at ${window.timeStamp}:`, 15, yPos);
            yPos += 7;
            window.substitutions.forEach(sub => {
                doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                yPos += 7;
                if (yPos > 280) { doc.addPage(); yPos = 10; }
            });
        });
    }
    
    // Save PDF
    doc.save(`Match_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
}

    window.editCard = function(cardId, isTeamA) {
        const card = isTeamA 
            ? matchState.teamA.cards.find(c => c.id === cardId)
            : matchState.teamB.cards.find(c => c.id === cardId);
        if (card) showCardDialog(isTeamA, card.isYellow, card);
    };

    window.editSubstitutionWindow = function(windowId, isTeamA) {
        showSubstitutionDialog(isTeamA, windowId);
    };

    init();
});
