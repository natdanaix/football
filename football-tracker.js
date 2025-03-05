// Add this script at the bottom of the HTML file
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
            substitutions: []
        },
        teamB: {
            name: "ทีม B",
            color: "#D32F2F",
            cards: [],
            substitutions: []
        },
        isInjuryTimeActive: false,
        totalInjurySeconds: 0,
        injuryTimePeriods: [],
        currentInjuryStartTime: null,
        currentInjuryTimeDisplay: "+00:00"
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
        '#1976D2', // Blue
        '#D32F2F', // Red
        '#4CAF50', // Green
        '#FF9800', // Orange
        '#9C27B0', // Purple
        '#009688', // Teal
        '#3F51B5', // Indigo
        '#E91E63', // Pink
        '#FFC107', // Amber
        '#00BCD4', // Cyan
        '#FF5722', // Deep Orange
        '#673AB7', // Deep Purple
        '#03A9F4', // Light Blue
        '#8BC34A'  // Light Green
    ];

    // Variables to track current modal context
    let currentCardContext = {
        isTeamA: true,
        isYellow: true,
        cardToEdit: null
    };

    let currentSubContext = {
        isTeamA: true,
        subToEdit: null
    };

    // Initialize the page
    function init() {
        // Load saved data
        loadSavedMatchData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize color pickers
        initColorPickers();
        
        // Set up auto save timer
        autoSaveTimer = setInterval(saveMatchData, 10000);
        
        // If no match is started, show team settings modal
        if (!matchState.isMatchStarted) {
            setTimeout(showTeamCustomizationDialog, 500);
        }
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Match controls
        startMatchBtn.addEventListener('click', startMatch);
        injuryBtn.addEventListener('click', toggleInjuryTime);
        injuryFab.addEventListener('click', toggleInjuryTime);
        
        // Team A buttons
        teamAYellowBtn.addEventListener('click', () => showCardDialog(true, true));
        teamARedBtn.addEventListener('click', () => showCardDialog(true, false));
        teamASubBtn.addEventListener('click', () => showSubstitutionDialog(true));
        
        // Team B buttons
        teamBYellowBtn.addEventListener('click', () => showCardDialog(false, true));
        teamBRedBtn.addEventListener('click', () => showCardDialog(false, false));
        teamBSubBtn.addEventListener('click', () => showSubstitutionDialog(false));
        
        // Tab switching
        tabElements.forEach(tab => {
            tab.addEventListener('click', () => {
                const team = tab.dataset.team;
                const tabType = tab.dataset.tab;
                
                // Remove active class from all tabs of this team
                document.querySelectorAll(`.tab[data-team="${team}"]`).forEach(t => {
                    t.classList.remove('active');
                });
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab contents for this team
                if (team === 'a') {
                    teamACardsContent.classList.remove('active');
                    teamASubsContent.classList.remove('active');
                    
                    if (tabType === 'cards') {
                        teamACardsContent.classList.add('active');
                    } else {
                        teamASubsContent.classList.add('active');
                    }
                } else {
                    teamBCardsContent.classList.remove('active');
                    teamBSubsContent.classList.remove('active');
                    
                    if (tabType === 'cards') {
                        teamBCardsContent.classList.add('active');
                    } else {
                        teamBSubsContent.classList.add('active');
                    }
                }
            });
        });
        
        // Settings button
        settingsBtn.addEventListener('click', () => {
            if (!matchState.isMatchStarted) {
                showTeamCustomizationDialog();
            } else {
                showResetConfirmDialog();
            }
        });
        
        // Team Settings Modal
        closeTeamSettingsBtn.addEventListener('click', () => {
            teamSettingsModal.style.display = 'none';
        });
        
        saveTeamSettingsBtn.addEventListener('click', saveTeamSettings);
        cancelTeamSettingsBtn.addEventListener('click', () => {
            teamSettingsModal.style.display = 'none';
        });
        
        // Card Modal
        closeCardModalBtn.addEventListener('click', () => {
            cardModal.style.display = 'none';
        });
        
        saveCardBtn.addEventListener('click', saveCardEvent);
        cancelCardBtn.addEventListener('click', () => {
            cardModal.style.display = 'none';
        });
        
        // Substitution Modal
        closeSubModalBtn.addEventListener('click', () => {
            subModal.style.display = 'none';
        });
        
        saveSubBtn.addEventListener('click', saveSubstitutionEvent);
        cancelSubBtn.addEventListener('click', () => {
            subModal.style.display = 'none';
        });
        
        // Injury Summary Modal
        closeInjurySummaryBtn.addEventListener('click', () => {
            injurySummaryModal.style.display = 'none';
        });
        
        closeInjurySummaryConfirmBtn.addEventListener('click', () => {
            injurySummaryModal.style.display = 'none';
        });
        
        // Reset Confirmation Modal
        closeResetConfirmBtn.addEventListener('click', () => {
            resetConfirmModal.style.display = 'none';
        });
        
        cancelResetBtn.addEventListener('click', () => {
            resetConfirmModal.style.display = 'none';
        });
        
        confirmResetBtn.addEventListener('click', resetAllData);
    }

    // Initialize color pickers
    function initColorPickers() {
        // Clear existing options
        teamAColorPicker.innerHTML = '';
        teamBColorPicker.innerHTML = '';
        
        // Add color options
        availableColors.forEach(color => {
            // Team A color option
            const optionA = document.createElement('div');
            optionA.className = 'color-option';
            optionA.style.backgroundColor = color;
            if (color === matchState.teamA.color) {
                optionA.classList.add('selected');
            }
            optionA.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('#teamAColorPicker .color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                optionA.classList.add('selected');
            });
            teamAColorPicker.appendChild(optionA);
            
            // Team B color option
            const optionB = document.createElement('div');
            optionB.className = 'color-option';
            optionB.style.backgroundColor = color;
            if (color === matchState.teamB.color) {
                optionB.classList.add('selected');
            }
            optionB.addEventListener('click', () => {
                // Remove selected class from all options
                document.querySelectorAll('#teamBColorPicker .color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option
                optionB.classList.add('selected');
            });
            teamBColorPicker.appendChild(optionB);
        });
    }

    // Load saved match data from localStorage
    function loadSavedMatchData() {
        const savedData = localStorage.getItem('matchData');
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Update match state
            matchState = {
                ...matchState,
                ...parsedData,
                startTime: parsedData.startTime ? new Date(parsedData.startTime) : null,
                currentInjuryStartTime: parsedData.currentInjuryStartTime ? new Date(parsedData.currentInjuryStartTime) : null
            };
            
            // Update UI
            updateUI();
            
            // Start timers if match is in progress
            if (matchState.isMatchStarted) {
                startTimers();
            }
        }
    }

    // Save match data to localStorage
    function saveMatchData() {
        localStorage.setItem('matchData', JSON.stringify({
            ...matchState,
            startTime: matchState.startTime ? matchState.startTime.toISOString() : null,
            currentInjuryStartTime: matchState.currentInjuryStartTime ? matchState.currentInjuryStartTime.toISOString() : null
        }));
    }

    // Clear all match data
    function clearMatchData() {
        localStorage.removeItem('matchData');
    }

    // Update UI based on current match state
    function updateUI() {
        // Update team headers
        teamAHeader.textContent = matchState.teamA.name;
        teamAHeader.style.backgroundColor = matchState.teamA.color;
        
        teamBHeader.textContent = matchState.teamB.name;
        teamBHeader.style.backgroundColor = matchState.teamB.color;
        
        // Update team button colors
        teamASubBtn.style.backgroundColor = matchState.teamA.color;
        teamBSubBtn.style.backgroundColor = matchState.teamB.color;
        
        // Update time display
        matchTimeEl.textContent = matchState.elapsedTime;
        
        // Update injury time display
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
        
        // Show/hide match controls based on match state
        if (matchState.isMatchStarted) {
            matchControlsEl.style.display = 'none';
            injuryControlsEl.style.display = 'flex';
            injuryFab.style.display = 'flex';
        } else {
            matchControlsEl.style.display = 'flex';
            injuryControlsEl.style.display = 'none';
            injuryFab.style.display = 'none';
        }
        
        // Render team cards and substitutions
        renderTeamCards();
        renderTeamSubstitutions();
    }

    // Render team cards
    function renderTeamCards() {
        // Team A cards
        const teamACardsHTML = matchState.teamA.cards.map(card => createCardHTML(card, true)).join('');
        if (teamACardsHTML) {
            teamACardsEmpty.style.display = 'none';
            teamACardsContent.innerHTML = teamACardsEmpty.outerHTML + teamACardsHTML;
        } else {
            teamACardsEmpty.style.display = 'flex';
        }
        
        // Team B cards
        const teamBCardsHTML = matchState.teamB.cards.map(card => createCardHTML(card, false)).join('');
        if (teamBCardsHTML) {
            teamBCardsEmpty.style.display = 'none';
            teamBCardsContent.innerHTML = teamBCardsEmpty.outerHTML + teamBCardsHTML;
        } else {
            teamBCardsEmpty.style.display = 'flex';
        }
    }

    // Create HTML for a card event
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

    // Render team substitutions
    function renderTeamSubstitutions() {
        // Team A substitutions
        const teamASubsHTML = matchState.teamA.substitutions.map(sub => createSubHTML(sub, true)).join('');
        if (teamASubsHTML) {
            teamASubsEmpty.style.display = 'none';
            teamASubsContent.innerHTML = teamASubsEmpty.outerHTML + teamASubsHTML;
        } else {
            teamASubsEmpty.style.display = 'flex';
        }
        
        // Team B substitutions
        const teamBSubsHTML = matchState.teamB.substitutions.map(sub => createSubHTML(sub, false)).join('');
        if (teamBSubsHTML) {
            teamBSubsEmpty.style.display = 'none';
            teamBSubsContent.innerHTML = teamBSubsEmpty.outerHTML + teamBSubsHTML;
        } else {
            teamBSubsEmpty.style.display = 'flex';
        }
    }

    // Create HTML for a substitution event
    function createSubHTML(sub, isTeamA) {
        return `
            <div class="event-card" data-id="${sub.id}">
                <div class="event-icon ${isTeamA ? 'sub-icon-a' : 'sub-icon-b'}">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">เปลี่ยนตัว: #${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก</div>
                    <div class="event-time">เวลา: ${sub.timeStamp}</div>
                </div>
                <button class="edit-btn" onclick="editSubstitution('${sub.id}', ${isTeamA})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    // Start match
    function startMatch() {
        matchState.isMatchStarted = true;
        matchState.startTime = new Date();
        
        startTimers();
        updateUI();
        saveMatchData();
    }

    // Start timers
    function startTimers() {
        // Clear existing timers
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        
        // Start match timer
        matchTimer = setInterval(updateMatchTime, 1000);
        
        // Start injury timer if active
        if (matchState.isInjuryTimeActive && matchState.currentInjuryStartTime) {
            injuryTimer = setInterval(updateInjuryTime, 1000);
        }
    }

    // Update match time
    function updateMatchTime() {
        if (!matchState.startTime) return;
        
        const now = new Date();
        const difference = now - matchState.startTime;
        
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        
        matchState.elapsedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        matchTimeEl.textContent = matchState.elapsedTime;
    }

    // Toggle injury time
    function toggleInjuryTime() {
        if (!matchState.isMatchStarted) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        matchState.isInjuryTimeActive = !matchState.isInjuryTimeActive;
        
        if (matchState.isInjuryTimeActive) {
            // Start injury time
            matchState.currentInjuryStartTime = new Date();
            injuryTimer = setInterval(updateInjuryTime, 1000);
            
            injuryTimeEl.style.display = 'block';
            totalInjuryEl.style.display = 'none';
            
            injuryBtn.classList.add('active');
            injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> หยุดทดเวลา';
            
            injuryFab.classList.add('injury-active');
        } else {
            // Stop injury time and record period
            if (matchState.currentInjuryStartTime) {
                const now = new Date();
                const injuryDuration = now - matchState.currentInjuryStartTime;
                const injurySeconds = Math.floor(injuryDuration / 1000);
                
                // Add to total injury time
                matchState.totalInjurySeconds += injurySeconds;
                
                // Record injury period
                const mins = String(Math.floor(injurySeconds / 60)).padStart(2, '0');
                const secs = String(injurySeconds % 60).padStart(2, '0');
                matchState.injuryTimePeriods.push(`+${mins}:${secs}`);
                
                // Show injury time summary
                showInjuryTimeSummary(injurySeconds);
            }
            
            // Reset current injury time
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

    // Update injury time
    function updateInjuryTime() {
        if (!matchState.currentInjuryStartTime) return;
        
        const now = new Date();
        const difference = now - matchState.currentInjuryStartTime;
        
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        
        matchState.currentInjuryTimeDisplay = `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        injuryTimeEl.textContent = matchState.currentInjuryTimeDisplay;
    }

    // Get total injury time display
    function getTotalInjuryTimeDisplay() {
        const minutes = Math.floor(matchState.totalInjurySeconds / 60);
        const seconds = matchState.totalInjurySeconds % 60;
        
        return `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Show injury time summary
    function showInjuryTimeSummary(currentPeriodSeconds) {
        // Calculate total injury time
        const totalMins = String(Math.floor(matchState.totalInjurySeconds / 60)).padStart(2, '0');
        const totalSecs = String(matchState.totalInjurySeconds % 60).padStart(2, '0');
        
        // Calculate current period time
        const currentMins = String(Math.floor(currentPeriodSeconds / 60)).padStart(2, '0');
        const currentSecs = String(currentPeriodSeconds % 60).padStart(2, '0');
        
        // Create summary HTML
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
        
        // Update modal content and show
        injurySummaryContent.innerHTML = summaryHTML;
        injurySummaryModal.style.display = 'flex';
    }

    // Show team customization dialog
    function showTeamCustomizationDialog() {
        // Set current values
        teamANameInput.value = matchState.teamA.name;
        teamBNameInput.value = matchState.teamB.name;
        
        // Initialize color pickers
        initColorPickers();
        
        // Show modal
        teamSettingsModal.style.display = 'flex';
    }

    // Save team settings
    function saveTeamSettings() {
        // Get team names (use default if empty)
        const teamAName = teamANameInput.value.trim() || 'ทีม A';
        const teamBName = teamBNameInput.value.trim() || 'ทีม B';
        
        // Get selected colors
        const teamAColorOption = document.querySelector('#teamAColorPicker .color-option.selected');
        const teamBColorOption = document.querySelector('#teamBColorPicker .color-option.selected');
        
        const teamAColor = teamAColorOption ? teamAColorOption.style.backgroundColor : matchState.teamA.color;
        const teamBColor = teamBColorOption ? teamBColorOption.style.backgroundColor : matchState.teamB.color;
        
        // Update match state
        matchState.teamA.name = teamAName;
        matchState.teamA.color = teamAColor;
        
        matchState.teamB.name = teamBName;
        matchState.teamB.color = teamBColor;
        
        // Update UI
        updateUI();
        
        // Save data
        saveMatchData();
        
        // Hide modal
        teamSettingsModal.style.display = 'none';
    }

    // Show card dialog
    function showCardDialog(isTeamA, isYellow, cardToEdit = null) {
        if (!matchState.isMatchStarted && !cardToEdit) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        // Set context
        currentCardContext = {
            isTeamA,
            isYellow,
            cardToEdit
        };
        
        // Set modal title
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        const cardType = isYellow ? 'ใบเหลือง' : 'ใบแดง';
        cardModalTitle.textContent = `${cardToEdit ? 'แก้ไข ' : ''}${cardType} - ${teamName}`;
        
        // Set input value if editing
        playerNumberInput.value = cardToEdit ? cardToEdit.playerNumber : '';
        
        // Show/hide delete button if editing
        if (cardToEdit) {
            // Check if delete button already exists
            let deleteBtn = document.getElementById('deleteCardBtn');
            
            if (!deleteBtn) {
                // Create delete button if it doesn't exist
                deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteCardBtn';
                deleteBtn.className = 'modal-btn delete-btn';
                deleteBtn.textContent = 'ลบ';
                deleteBtn.addEventListener('click', deleteCardEvent);
                
                // Insert before cancel button
                cardModalActions.insertBefore(deleteBtn, cancelCardBtn);
            }
        } else {
            // Remove delete button if it exists
            const deleteBtn = document.getElementById('deleteCardBtn');
            if (deleteBtn) {
                deleteBtn.remove();
            }
        }
        
        // Update save button style based on card type
        saveCardBtn.style.backgroundColor = isYellow ? '#FFC107' : '#D32F2F';
        saveCardBtn.style.color = isYellow ? 'black' : 'white';
        
        // Show modal
        cardModal.style.display = 'flex';
        playerNumberInput.focus();
    }

  // Save card event (continued)
function saveCardEvent() {
    const playerNumber = playerNumberInput.value.trim();
    
    if (!playerNumber) {
        alert('กรุณาระบุหมายเลขผู้เล่น');
        return;
    }
    
    const { isTeamA, isYellow, cardToEdit } = currentCardContext;
    
    // Current timestamp
    const currentTimeStamp = cardToEdit ? cardToEdit.timeStamp : 
        (matchState.isInjuryTimeActive ? 
            `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
            matchState.elapsedTime);
    
    if (cardToEdit) {
        // Update existing card
        cardToEdit.playerNumber = playerNumber;
    } else {
        // Create new card
        const newCard = {
            id: Date.now().toString(),
            isYellow,
            timeStamp: currentTimeStamp,
            playerNumber
        };
        
        // Add to correct team
        if (isTeamA) {
            matchState.teamA.cards.push(newCard);
        } else {
            matchState.teamB.cards.push(newCard);
        }
    }
    
    // Update UI
    renderTeamCards();
    
    // Save data
    saveMatchData();
    
    // Hide modal
    cardModal.style.display = 'none';
}

// Delete card event
function deleteCardEvent() {
    const { isTeamA, cardToEdit } = currentCardContext;
    
    if (!cardToEdit) return;
    
    // Remove from correct team
    if (isTeamA) {
        matchState.teamA.cards = matchState.teamA.cards.filter(card => card.id !== cardToEdit.id);
    } else {
        matchState.teamB.cards = matchState.teamB.cards.filter(card => card.id !== cardToEdit.id);
    }
    
    // Update UI
    renderTeamCards();
    
    // Save data
    saveMatchData();
    
    // Hide modal
    cardModal.style.display = 'none';
}

// Show substitution dialog
function showSubstitutionDialog(isTeamA, subToEdit = null) {
    if (!matchState.isMatchStarted && !subToEdit) {
        alert('โปรดเริ่มการแข่งขันก่อน');
        return;
    }
    
    // Set context
    currentSubContext = {
        isTeamA,
        subToEdit
    };
    
    // Set modal title
    const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
    subModalTitle.textContent = `${subToEdit ? 'แก้ไข ' : ''}เปลี่ยนตัว - ${teamName}`;
    
    // Set input values if editing
    playerInInput.value = subToEdit ? subToEdit.playerInNumber : '';
    playerOutInput.value = subToEdit ? subToEdit.playerOutNumber : '';
    
    // Show/hide delete button if editing
    if (subToEdit) {
        // Check if delete button already exists
        let deleteBtn = document.getElementById('deleteSubBtn');
        
        if (!deleteBtn) {
            // Create delete button if it doesn't exist
            deleteBtn = document.createElement('button');
            deleteBtn.id = 'deleteSubBtn';
            deleteBtn.className = 'modal-btn delete-btn';
            deleteBtn.textContent = 'ลบ';
            deleteBtn.addEventListener('click', deleteSubstitutionEvent);
            
            // Insert before cancel button
            subModalActions.insertBefore(deleteBtn, cancelSubBtn);
        }
    } else {
        // Remove delete button if it exists
        const deleteBtn = document.getElementById('deleteSubBtn');
        if (deleteBtn) {
            deleteBtn.remove();
        }
    }
    
    // Update save button style based on team
    saveSubBtn.style.backgroundColor = isTeamA ? matchState.teamA.color : matchState.teamB.color;
    
    // Show modal
    subModal.style.display = 'flex';
    playerInInput.focus();
}

// Save substitution event
function saveSubstitutionEvent() {
    const playerIn = playerInInput.value.trim();
    const playerOut = playerOutInput.value.trim();
    
    if (!playerIn || !playerOut) {
        alert('กรุณาระบุหมายเลขผู้เล่นทั้งเข้าและออก');
        return;
    }
    
    const { isTeamA, subToEdit } = currentSubContext;
    
    // Current timestamp
    const currentTimeStamp = subToEdit ? subToEdit.timeStamp : 
        (matchState.isInjuryTimeActive ? 
            `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
            matchState.elapsedTime);
    
    if (subToEdit) {
        // Update existing substitution
        subToEdit.playerInNumber = playerIn;
        subToEdit.playerOutNumber = playerOut;
    } else {
        // Create new substitution
        const newSub = {
            id: Date.now().toString(),
            playerInNumber: playerIn,
            playerOutNumber: playerOut,
            timeStamp: currentTimeStamp
        };
        
        // Add to correct team
        if (isTeamA) {
            matchState.teamA.substitutions.push(newSub);
        } else {
            matchState.teamB.substitutions.push(newSub);
        }
    }
    
    // Update UI
    renderTeamSubstitutions();
    
    // Save data
    saveMatchData();
    
    // Hide modal
    subModal.style.display = 'none';
}

// Delete substitution event
function deleteSubstitutionEvent() {
    const { isTeamA, subToEdit } = currentSubContext;
    
    if (!subToEdit) return;
    
    // Remove from correct team
    if (isTeamA) {
        matchState.teamA.substitutions = matchState.teamA.substitutions.filter(sub => sub.id !== subToEdit.id);
    } else {
        matchState.teamB.substitutions = matchState.teamB.substitutions.filter(sub => sub.id !== subToEdit.id);
    }
    
    // Update UI
    renderTeamSubstitutions();
    
    // Save data
    saveMatchData();
    
    // Hide modal
    subModal.style.display = 'none';
}

// Show reset confirmation dialog
function showResetConfirmDialog() {
    resetConfirmModal.style.display = 'flex';
}

// Reset all data
function resetAllData() {
    // Stop timers
    clearInterval(matchTimer);
    clearInterval(injuryTimer);
    
    // Reset match state
    matchState = {
        isMatchStarted: false,
        startTime: null,
        elapsedTime: "00:00",
        teamA: {
            name: "ทีม A",
            color: "#1976D2",
            cards: [],
            substitutions: []
        },
        teamB: {
            name: "ทีม B",
            color: "#D32F2F",
            cards: [],
            substitutions: []
        },
        isInjuryTimeActive: false,
        totalInjurySeconds: 0,
        injuryTimePeriods: [],
        currentInjuryStartTime: null,
        currentInjuryTimeDisplay: "+00:00"
    };
    
    // Clear localStorage
    clearMatchData();
    
    // Update UI
    updateUI();
    
    // Hide reset modal
    resetConfirmModal.style.display = 'none';
    
    // Show team settings modal
    showTeamCustomizationDialog();
}

// Edit card function (called from event cards)
window.editCard = function(cardId, isTeamA) {
    // Find card
    const card = isTeamA 
        ? matchState.teamA.cards.find(c => c.id === cardId)
        : matchState.teamB.cards.find(c => c.id === cardId);
    
    if (card) {
        showCardDialog(isTeamA, card.isYellow, card);
    }
};

// Edit substitution function (called from sub cards)
window.editSubstitution = function(subId, isTeamA) {
    // Find substitution
    const sub = isTeamA 
        ? matchState.teamA.substitutions.find(s => s.id === subId)
        : matchState.teamB.substitutions.find(s => s.id === subId);
    
    if (sub) {
        showSubstitutionDialog(isTeamA, sub);
    }
};

// Initialize the app
init();

}); 