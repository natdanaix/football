// เวอร์ชันที่ได้รับการแก้ไขของ football-tracker.js
// สร้างตัวแปร global เพื่อเข้าถึงได้จากไฟล์อื่นabcdef

window.init = function() {
    // Initialize data storage
    const dataStorage = new MatchDataStorage();
    
    // Match state now comes from the storage
    let matchState = dataStorage.matchState;

    // Timer variables
    let matchTimer;
    let injuryTimer;

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

    const addAnotherSubSection = document.createElement('div');
    addAnotherSubSection.innerHTML = `
        <div class="input-group" id="additionalSubsContainer">
            <!-- Additional player substitutions will be added here -->
        </div>
        <button class="modal-btn add-btn" id="addAnotherSubBtn">
            <i class="fas fa-plus"></i> เพิ่มผู้เล่นที่จัดเปลี่ยนตัว
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

    // Load data using the storage class
    dataStorage.loadSavedMatchData();
    matchState = dataStorage.matchState;
    
    setupEventListeners();
    initColorPickers();
    
    if (!matchState.isMatchStarted) {
        setTimeout(showTeamCustomizationDialog, 500);
    }
    
    updateUI();
    
    if (matchState.isMatchStarted) {
        startTimers();
    }

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

        closeSubModalBtn.addEventListener('click', () => closeSubstitutionDialog());
        saveSubBtn.addEventListener('click', saveSubstitutionEvent);
        cancelSubBtn.addEventListener('click', () => closeSubstitutionDialog());

        closeInjurySummaryBtn.addEventListener('click', () => injurySummaryModal.style.display = 'none');
        closeInjurySummaryConfirmBtn.addEventListener('click', () => injurySummaryModal.style.display = 'none');

        closeResetConfirmBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
        cancelResetBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
        confirmResetBtn.addEventListener('click', resetAllData);
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
            totalInjuryEl.textContent = dataStorage.getTotalInjuryTimeDisplay();
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

    function showTeamCustomizationDialog() {
        teamANameInput.value = matchState.teamA.name;
        teamBNameInput.value = matchState.teamB.name;
        teamSettingsModal.style.display = 'flex';
    }

    function startMatch() {
        dataStorage.startMatch();
        matchState = dataStorage.matchState;
        startTimers();
        updateUI();
    }

    function startTimers() {
        if (matchTimer) clearInterval(matchTimer);
        if (injuryTimer) clearInterval(injuryTimer);
        
        matchTimer = setInterval(() => {
            dataStorage.updateMatchTime();
            matchTimeEl.textContent = matchState.elapsedTime;
        }, 1000);
        
        injuryTimer = setInterval(() => {
            if (matchState.isInjuryTimeActive) {
                dataStorage.updateInjuryTime();
                injuryTimeEl.textContent = matchState.currentInjuryTimeDisplay;
            }
        }, 1000);
    }

    function toggleInjuryTime() {
        const result = dataStorage.toggleInjuryTime();
        if (result.success) {
            updateUI();
        }
    }

    function endMatch() {
        stopTimers();
        dataStorage.endMatch();
        matchState = dataStorage.matchState;
        updateUI();
        showInjurySummary();
    }

    function stopTimers() {
        if (matchTimer) clearInterval(matchTimer);
        if (injuryTimer) clearInterval(injuryTimer);
        matchTimer = null;
        injuryTimer = null;
    }

    function showInjurySummary() {
        const exportData = dataStorage.getExportData();
        injurySummaryContent.innerHTML = `
            <div style="margin-bottom: 15px;">
                <p><strong>เวลาการแข่งขัน:</strong> ${exportData.matchTime}</p>
                <p><strong>รวมเวลาทดเจ็บ:</strong> ${exportData.totalInjuryTime}</p>
            </div>
            ${exportData.injuryTimePeriods.length > 0 ? `
                <div style="margin-bottom: 15px;">
                    <p><strong>รายละเอียดเวลาทดเจ็บ:</strong></p>
                    <ul style="padding-left: 20px;">
                        ${exportData.injuryTimePeriods.map((period, index) => 
                            `<li>ช่วงที่ ${index + 1}: ${period}</li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        injurySummaryModal.style.display = 'flex';
    }

    function saveTeamSettings() {
        const teamAName = teamANameInput.value;
        const teamBName = teamBNameInput.value;
        
        const teamAColorOption = document.querySelector('#teamAColorPicker .color-option.selected');
        const teamBColorOption = document.querySelector('#teamBColorPicker .color-option.selected');
        
        const teamAColor = teamAColorOption ? teamAColorOption.style.backgroundColor : matchState.teamA.color;
        const teamBColor = teamBColorOption ? teamBColorOption.style.backgroundColor : matchState.teamB.color;
        
        dataStorage.updateTeamSettings(teamAName, teamAColor, teamBName, teamBColor);
        matchState = dataStorage.matchState;
        updateUI();
        
        teamSettingsModal.style.display = 'none';
    }

    function showCardDialog(isTeamA, isYellow, cardToEdit = null) {
        currentCardContext = {
            isTeamA,
            isYellow,
            cardToEdit
        };
        
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        const cardType = isYellow ? 'ใบเหลือง' : 'ใบแดง';
        cardModalTitle.textContent = `${cardType} - ${teamName}`;
        
        if (cardToEdit) {
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            const card = team.cards.find(c => c.id === cardToEdit);
            if (card) {
                playerNumberInput.value = card.playerNumber;
            }
        } else {
            playerNumberInput.value = '';
        }
        
        cardModal.style.display = 'flex';
    }

    function saveCardEvent() {
        const playerNumber = playerNumberInput.value.trim();
        if (!playerNumber) {
            alert('กรุณาระบุหมายเลขผู้เล่น');
            return;
        }
        
        const { isTeamA, isYellow, cardToEdit } = currentCardContext;
        dataStorage.saveCard(isTeamA, isYellow, playerNumber, cardToEdit);
        updateUI();
        
        cardModal.style.display = 'none';
    }

    function showSubstitutionDialog(isTeamA, windowId = null) {
        if (!isTeamA && !windowId && dataStorage.hasReachedMaxSubWindows(false)) {
            alert(`${matchState.teamB.name} ได้ใช้โอกาสเปลี่ยนตัวครบ 3 ครั้งแล้ว`);
            return;
        }
        
        if (isTeamA && !windowId && dataStorage.hasReachedMaxSubWindows(true)) {
            alert(`${matchState.teamA.name} ได้ใช้โอกาสเปลี่ยนตัวครบ 3 ครั้งแล้ว`);
            return;
        }
        
        currentSubContext = {
            isTeamA,
            subToEdit: windowId,
            additionalSubs: []
        };
        
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        subModalTitle.textContent = `เปลี่ยนตัว - ${teamName}`;
        
        // Clear previous fields
        playerInInput.value = '';
        playerOutInput.value = '';
        
        // If editing, populate with existing values
        if (windowId) {
            const team = isTeamA ? 'teamA' : 'teamB';
            const subs = matchState[team].substitutions.filter(
                sub => sub.windowId === windowId || sub.id === windowId
            );
            
            if (subs.length > 0) {
                playerInInput.value = subs[0].playerInNumber;
                playerOutInput.value = subs[0].playerOutNumber;
                
                // Add additional subs if any
                if (subs.length > 1) {
                    for (let i = 1; i < subs.length; i++) {
                        currentSubContext.additionalSubs.push({
                            playerIn: subs[i].playerInNumber,
                            playerOut: subs[i].playerOutNumber
                        });
                    }
                }
            }
        }
        
        subModal.style.display = 'flex';
    }

    function closeSubstitutionDialog() {
        subModal.style.display = 'none';
        currentSubContext.additionalSubs = [];
    }

    function saveSubstitutionEvent() {
        const playerIn = playerInInput.value.trim();
        const playerOut = playerOutInput.value.trim();
        
        if (!playerIn || !playerOut) {
            alert('กรุณาระบุหมายเลขผู้เล่นที่เข้าและออก');
            return;
        }
        
        const { isTeamA, subToEdit, additionalSubs } = currentSubContext;
        
        // Create players array with main substitution and any additional ones
        const players = [{ playerIn, playerOut }, ...additionalSubs];
        
        dataStorage.saveSubstitutionWindow(isTeamA, players, subToEdit);
        updateUI();
        
        subModal.style.display = 'none';
    }

    function updateSubstitutionButtonsState() {
        // Disable substitution buttons if max windows reached
        if (dataStorage.hasReachedMaxSubWindows(true)) {
            teamASubBtn.disabled = true;
            teamASubBtn.classList.add('disabled');
        } else {
            teamASubBtn.disabled = false;
            teamASubBtn.classList.remove('disabled');
        }
        
        if (dataStorage.hasReachedMaxSubWindows(false)) {
            teamBSubBtn.disabled = true;
            teamBSubBtn.classList.add('disabled');
        } else {
            teamBSubBtn.disabled = false;
            teamBSubBtn.classList.remove('disabled');
        }
    }

    function renderTeamCards() {
        // Render Team A cards
        if (matchState.teamA.cards.length > 0) {
            teamACardsEmpty.style.display = 'none';
            teamACardsContent.innerHTML = matchState.teamA.cards
                .sort((a, b) => {
                    const timeA = a.timeStamp.replace(/\+.*$/, '');
                    const timeB = b.timeStamp.replace(/\+.*$/, '');
                    const [minsA, secsA] = timeA.split(':').map(Number);
                    const [minsB, secsB] = timeB.split(':').map(Number);
                    if (minsA !== minsB) return minsA - minsB;
                    return secsA - secsB;
                })
                .map(card => `
                    <div class="event-card">
                        <div class="event-icon ${card.isYellow ? 'yellow-icon' : 'red-icon'}">
                            <i class="fas fa-square"></i>
                        </div>
                        <div class="event-details">
                            <div class="event-title">หมายเลข ${card.playerNumber}</div>
                            <div class="event-time">${card.timeStamp}</div>
                        </div>
                        <button class="edit-btn" onclick="editCard(true, '${card.id}')">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                `)
                .join('');
        } else {
            teamACardsEmpty.style.display = 'flex';
        }
        
        // Render Team B cards
        if (matchState.teamB.cards.length > 0) {
            teamBCardsEmpty.style.display = 'none';
            teamBCardsContent.innerHTML = matchState.teamB.cards
                .sort((a, b) => {
                    const timeA = a.timeStamp.replace(/\+.*$/, '');
                    const timeB = b.timeStamp.replace(/\+.*$/, '');
                    const [minsA, secsA] = timeA.split(':').map(Number);
                    const [minsB, secsB] = timeB.split(':').map(Number);
                    if (minsA !== minsB) return minsA - minsB;
                    return secsA - secsB;
                })
                .map(card => `
                    <div class="event-card">
                        <div class="event-icon ${card.isYellow ? 'yellow-icon' : 'red-icon'}">
                            <i class="fas fa-square"></i>
                        </div>
                        <div class="event-details">
                            <div class="event-title">หมายเลข ${card.playerNumber}</div>
                            <div class="event-time">${card.timeStamp}</div>
                        </div>
                        <button class="edit-btn" onclick="editCard(false, '${card.id}')">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                `)
                .join('');
        } else {
            teamBCardsEmpty.style.display = 'flex';
        }
    }

    function renderTeamSubstitutions() {
        // Group substitutions by window for Team A
        const teamAWindows = dataStorage.groupSubstitutionsByWindow(matchState.teamA.substitutions);
        
        if (teamAWindows.length > 0) {
            teamASubsEmpty.style.display = 'none';
            teamASubsContent.innerHTML = teamAWindows
                .map(window => {
                    const subs = window.substitutions.map(sub => `
                        <p>เข้า: ${sub.playerInNumber} - ออก: ${sub.playerOutNumber}</p>
                    `).join('');
                    
                    return `
                        <div class="event-card">
                            <div class="event-icon sub-icon-a">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="event-details">
                                <div class="event-title">การเปลี่ยนตัว</div>
                                <div class="event-time">${window.timeStamp}</div>
                                ${subs}
                            </div>
                            <button class="edit-btn" onclick="editSubstitution(true, '${window.id}')">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    `;
                })
                .join('');
        } else {
            teamASubsEmpty.style.display = 'flex';
        }
        
        // Group substitutions by window for Team B
        const teamBWindows = dataStorage.groupSubstitutionsByWindow(matchState.teamB.substitutions);
        
        if (teamBWindows.length > 0) {
            teamBSubsEmpty.style.display = 'none';
            teamBSubsContent.innerHTML = teamBWindows
                .map(window => {
                    const subs = window.substitutions.map(sub => `
                        <p>เข้า: ${sub.playerInNumber} - ออก: ${sub.playerOutNumber}</p>
                    `).join('');
                    
                    return `
                        <div class="event-card">
                            <div class="event-icon sub-icon-b">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="event-details">
                                <div class="event-title">การเปลี่ยนตัว</div>
                                <div class="event-time">${window.timeStamp}</div>
                                ${subs}
                            </div>
                            <button class="edit-btn" onclick="editSubstitution(false, '${window.id}')">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </div>
                    `;
                })
                .join('');
        } else {
            teamBSubsEmpty.style.display = 'flex';
        }
    }

    function showResetConfirmDialog() {
        resetConfirmModal.style.display = 'flex';
    }

    function resetAllData() {
        stopTimers();
        dataStorage.resetMatchState();
        matchState = dataStorage.matchState;
        updateUI();
        resetConfirmModal.style.display = 'none';
    }

    // Global functions for edit buttons
    window.editCard = function(isTeamA, cardId) {
        const team = isTeamA ? matchState.teamA : matchState.teamB;
        const card = team.cards.find(c => c.id === cardId);
        if (card) {
            showCardDialog(isTeamA, card.isYellow, cardId);
        }
    };

    window.editSubstitution = function(isTeamA, windowId) {
        showSubstitutionDialog(isTeamA, windowId);
    };
};
