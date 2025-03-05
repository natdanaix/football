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
            substitutions: [],
            subWindows: 0, // Track number of substitution windows used (max 3)
        },
        teamB: {
            name: "ทีม B",
            color: "#D32F2F",
            cards: [],
            substitutions: [],
            subWindows: 0, // Track number of substitution windows used (max 3)
        },
        isInjuryTimeActive: false,
        totalInjurySeconds: 0,
        injuryTimePeriods: [],
        currentInjuryStartTime: null,
        currentInjuryTimeDisplay: "+00:00",
        // Track if we're currently in an open substitution window
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

    // New: Add Another Player Substitution section
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
        subToEdit: null,
        additionalSubs: [] // For tracking multiple substitutions in one window
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
        
        // Initialize substitution button states
        updateSubstitutionButtonsState();
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
            closeSubstitutionDialog();
        });
        
        saveSubBtn.addEventListener('click', saveSubstitutionEvent);
        cancelSubBtn.addEventListener('click', () => {
            closeSubstitutionDialog();
        });
        
        // Add event listener for "Add Another Sub" button - will be initialized when modal opens
        
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
            
            // Ensure subWindows property exists on both teams
            if (matchState.teamA.subWindows === undefined) {
                matchState.teamA.subWindows = calculateUsedSubWindows(matchState.teamA.substitutions);
            }
            
            if (matchState.teamB.subWindows === undefined) {
                matchState.teamB.subWindows = calculateUsedSubWindows(matchState.teamB.substitutions);
            }
            
            // Ensure activeSubWindow property exists
            if (!matchState.activeSubWindow) {
                matchState.activeSubWindow = {
                    teamA: false,
                    teamB: false
                };
            }
            
            // Update UI
            updateUI();
            
            // Start timers if match is in progress
            if (matchState.isMatchStarted) {
                startTimers();
            }
        }
    }

    // Calculate used substitution windows from existing substitution data
    function calculateUsedSubWindows(substitutions) {
        if (!substitutions || substitutions.length === 0) return 0;
        
        // Group substitutions by windowId
        const windows = new Set();
        substitutions.forEach(sub => {
            if (sub.windowId) {
                windows.add(sub.windowId);
            } else {
                // For backward compatibility, each sub without windowId counts as its own window
                windows.add(sub.id);
            }
        });
        
        return windows.size;
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
        
        // Update substitution button states
        updateSubstitutionButtonsState();
        
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

    // Update the substitution button states based on available windows
    function updateSubstitutionButtonsState() {
        if (matchState.isMatchStarted) {
            // Team A sub button
            if (matchState.teamA.subWindows >= 3 && !matchState.activeSubWindow.teamA) {
                teamASubBtn.disabled = true;
                teamASubBtn.classList.add('disabled');
                teamASubBtn.innerHTML = 'ใช้โควต้าหมดแล้ว';
            } else {
                teamASubBtn.disabled = false;
                teamASubBtn.classList.remove('disabled');
                teamASubBtn.innerHTML = 'เปลี่ยนตัว' + (matchState.activeSubWindow.teamA ? ' (เปิดอยู่)' : '');
            }
            
            // Team B sub button
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

    // Group substitutions by window for display
    function groupSubstitutionsByWindow(subs) {
        const windows = {};
        
        subs.forEach(sub => {
            const windowId = sub.windowId || sub.id; // For backward compatibility
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
            // Sort by timestamp (roughly)
            const timeA = a.timeStamp.replace(/\+.*$/, ''); // Remove injury time part
            const timeB = b.timeStamp.replace(/\+.*$/, ''); // Remove injury time part
            
            const [minsA, secsA] = timeA.split(':').map(Number);
            const [minsB, secsB] = timeB.split(':').map(Number);
            
            if (minsA !== minsB) return minsA - minsB;
            return secsA - secsB;
        });
    }

    // Render team substitutions
    function renderTeamSubstitutions() {
        // Group substitutions by window
        const teamASubWindows = groupSubstitutionsByWindow(matchState.teamA.substitutions);
        const teamBSubWindows = groupSubstitutionsByWindow(matchState.teamB.substitutions);
        
        // Create HTML for each window and the substitutions within it
        const teamASubsHTML = teamASubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, true)
        ).join('');
        
        const teamBSubsHTML = teamBSubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, false)
        ).join('');
        
        // Update the content
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

    // Create HTML for a substitution window
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

    // Save card event
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

    // Show substitution dialog for a new substitution window or editing existing one
    function showSubstitutionDialog(isTeamA, windowToEdit = null) {
        if (!matchState.isMatchStarted && !windowToEdit) {
            alert('โปรดเริ่มการแข่งขันก่อน');
            return;
        }
        
        // Check if team has reached their substitution limit
        if (!windowToEdit && !matchState.activeSubWindow[isTeamA ? 'teamA' : 'teamB']) {
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            if (team.subWindows >= 3) {
                alert(`${team.name} ได้ใช้ช่วงเปลี่ยนตัวครบ 3 ครั้งแล้ว`);
                return;
            }
        }
        
        // Set context
        currentSubContext = {
            isTeamA,
            windowToEdit,
            additionalSubs: []
        };
        
        // Set modal title
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        subModalTitle.textContent = `${windowToEdit ? 'แก้ไข ' : ''}เปลี่ยนตัว - ${teamName}`;
        
        // Clear existing fields
        playerInInput.value = '';
        playerOutInput.value = '';
        
        // Create container for additional substitutions
        const additionalSubsContainer = document.getElementById('additionalSubsContainer');
        if (!additionalSubsContainer) {
            // If the first time showing this modal with our new UI, add the container
            const modalContent = subModal.querySelector('.modal-content');
            // Add the container for additional subs
            modalContent.insertBefore(addAnotherSubSection, subModalActions);
            
            // Add event listener for the add button
            document.getElementById('addAnotherSubBtn').addEventListener('click', addAnotherSubstitution);
        } else {
            // Clear any existing fields
            additionalSubsContainer.innerHTML = '';
        }
        
        // If editing an existing window, prepopulate the fields with the substitutions
        if (windowToEdit) {
            // Find substitutions in this window
            const subs = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .filter(sub => sub.windowId === windowToEdit || sub.id === windowToEdit);
            
            if (subs.length > 0) {
                // First substitution in first input fields
                playerInInput.value = subs[0].playerInNumber;
                playerOutInput.value = subs[0].playerOutNumber;
                
                // Remaining substitutions in additional fields
                if (subs.length > 1) {
                    for (let i = 1; i < subs.length; i++) {
                        const newSubFields = createSubstitutionFields(subs[i].playerInNumber, subs[i].playerOutNumber);
                        document.getElementById('additionalSubsContainer').appendChild(newSubFields);
                    }
                }
            }
            
            // Add delete button for window if it doesn't exist
            let deleteBtn = document.getElementById('deleteSubWindowBtn');
            if (!deleteBtn) {
                deleteBtn = document.createElement('button');
                deleteBtn.id = 'deleteSubWindowBtn';
                deleteBtn.className = 'modal-btn delete-btn';
                deleteBtn.textContent = 'ลบช่วงเปลี่ยนตัวนี้';
                deleteBtn.addEventListener('click', deleteSubstitutionWindow);
                
                // Insert before cancel button
                subModalActions.insertBefore(deleteBtn, cancelSubBtn);
            }
        } else {
            // Remove delete button if it exists
            const deleteBtn = document.getElementById('deleteSubWindowBtn');
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

    // Create fields for additional substitution
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
        
        // Add event listener for remove button
        const removeButton = subFieldsContainer.querySelector('.remove-sub-btn');
        removeButton.addEventListener('click', function() {
            subFieldsContainer.remove();
        });
        
        return subFieldsContainer;
    }

    // Add another substitution field
    function addAnotherSubstitution() {
        const newSubFields = createSubstitutionFields();
        document.getElementById('additionalSubsContainer').appendChild(newSubFields);
    }

    // Close substitution dialog and clean up
    function closeSubstitutionDialog() {
        subModal.style.display = 'none';
        
        // If this was a new window that was being created and user cancels,
        // make sure we don't leave an active window state
        if (!currentSubContext.windowToEdit) {
            const team = currentSubContext.isTeamA ? 'teamA' : 'teamB';
            if (matchState.activeSubWindow[team]) {
                matchState.activeSubWindow[team] = false;
                updateSubstitutionButtonsState();
            }
        }
    }

    // Save substitution event for a window
    function saveSubstitutionEvent() {
        // Validate first substitution
        const playerIn = playerInInput.value.trim();
        const playerOut = playerOutInput.value.trim();
        
        if (!playerIn || !playerOut) {
            alert('กรุณาระบุหมายเลขผู้เล่นทั้งเข้าและออก');
            return;
        }
        
        const { isTeamA, windowToEdit } = currentSubContext;
        const team = isTeamA ? 'teamA' : 'teamB';
        
        // Current timestamp
        const currentTimeStamp = windowToEdit ? 
            // Get timestamp from the first substitution in this window
            (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .find(sub => sub.windowId === windowToEdit || sub.id === windowToEdit)?.timeStamp || matchState.elapsedTime
            : 
            (matchState.isInjuryTimeActive ? 
                `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                matchState.elapsedTime);
        
        // Generate window ID if new
        const windowId = windowToEdit || Date.now().toString();
        
        // Collect all substitutions
        const substitutions = [];
        
        // Add first substitution
        substitutions.push({
            id: Date.now().toString() + '-1',
            playerInNumber: playerIn,
            playerOutNumber: playerOut,
            timeStamp: currentTimeStamp,
            windowId: windowId
        });
        
        // Add additional substitutions if any
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
        
        // Handle the window tracking logic
        if (windowToEdit) {
            // Delete old substitutions in this window
            const newSubsList = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .filter(sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit);
            
            // Add new substitutions
            if (isTeamA) {
                matchState.teamA.substitutions = [...newSubsList, ...substitutions];
            } else {
                matchState.teamB.substitutions = [...newSubsList, ...substitutions];
            }
        } else {
            // If this is a new window, increment the window count
            matchState[team].subWindows++;
            
            // Add new substitutions
            if (isTeamA) {
                matchState.teamA.substitutions = [...matchState.teamA.substitutions, ...substitutions];
            } else {
                matchState.teamB.substitutions = [...matchState.teamB.substitutions, ...substitutions];
            }
            
            // Close the active window
            matchState.activeSubWindow[team] = false;
        }
        
        // Update UI
        renderTeamSubstitutions();
        updateSubstitutionButtonsState();
        
        // Save data
        saveMatchData();
        
        // Hide modal
        subModal.style.display = 'none';
    }

    // Delete substitution window and all subs in it
    function deleteSubstitutionWindow() {
        const { isTeamA, windowToEdit } = currentSubContext;
        
        if (!windowToEdit) return;
        
        // Find all substitutions in this window
        const team = isTeamA ? matchState.teamA : matchState.teamB;
        const subsInWindow = team.substitutions.filter(
            sub => sub.windowId === windowToEdit || sub.id === windowToEdit
        );
        
        // Remove all substitutions in this window
        team.substitutions = team.substitutions.filter(
            sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit
        );
        
        // Decrement the window count if this was a complete window
        if (subsInWindow.length > 0) {
            team.subWindows = Math.max(0, team.subWindows - 1);
        }
        
        // Update UI
        renderTeamSubstitutions();
        updateSubstitutionButtonsState();
        
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

    // Edit substitution window function (called from sub cards)
    window.editSubstitutionWindow = function(windowId, isTeamA) {
        showSubstitutionDialog(isTeamA, windowId);
    };

    // Initialize the app
    init();

});
