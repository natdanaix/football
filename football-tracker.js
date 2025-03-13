document.addEventListener('DOMContentLoaded', function() {
    // Match state
    let matchState = {
        isMatchStarted: false,
        isFirstHalf: true,
        isHalfTime: false,
        startTime: null,
        elapsedTime: "00:00",
        currentHalfTime: 45 * 60, // 45 minutes in seconds
        teamA: {
            name: "Team A",
            color: "#1976D2",
            cards: [],
            substitutions: [],
            halfTimeSubstitutions: [], // Store half-time substitutions separately
            hasUsedHalfTimeSub: false,
            subWindows: 0,
            playerCount: 0, // Track number of players substituted
            goals: 0
        },
        teamB: {
            name: "Team B",
            color: "#D32F2F",
            cards: [],
            substitutions: [],
            halfTimeSubstitutions: [], // Store half-time substitutions separately
            hasUsedHalfTimeSub: false, 
            subWindows: 0,
            playerCount: 0, // Track number of players substituted
            goals: 0
        },
        isInjuryTimeActive: false,
        isAddingInjuryTime: false,
        remainingInjuryTime: 0, // Remaining injury time in seconds
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
    const teamANameEl = document.getElementById('teamAName');
const teamBNameEl = document.getElementById('teamBName');
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

    // Team A buttons
    const teamAYellowBtn = document.getElementById('teamAYellowBtn');
    const teamARedBtn = document.getElementById('teamARedBtn');
    const teamASubBtn = document.getElementById('teamASubBtn');
    const teamAGoalBtn = document.getElementById('teamAGoalBtn');

    // Team B buttons
    const teamBYellowBtn = document.getElementById('teamBYellowBtn');
    const teamBRedBtn = document.getElementById('teamBRedBtn');
    const teamBSubBtn = document.getElementById('teamBSubBtn');
    const teamBGoalBtn = document.getElementById('teamBGoalBtn');

    // Create half-time substitution buttons
    let teamAHalfSubBtn, teamBHalfSubBtn;

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

    // Card Modal (reused for goals)
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

    // Half-time Modal
    let halfTimeModal;

    // Add Another Player Substitution section
    const addAnotherSubSection = document.createElement('div');
    addAnotherSubSection.innerHTML = `
        <div class="input-group" id="additionalSubsContainer">
            <!-- Additional player substitutions will be added here -->
        </div>
        <button class="modal-btn add-btn" id="addAnotherSubBtn">
            <i class="fas fa-plus"></i> Add Another Substitution
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
  // Available team colors
const availableColors = [
    '#1976D2', '#D32F2F', '#4CAF50', '#FF9800', '#9C27B0',
    '#009688', '#3F51B5', '#E91E63', '#FFC107', '#00BCD4',
    '#FF5722', '#673AB7', '#03A9F4', '#8BC34A', '#000000', '#ffffff' // เพิ่มสีดำและสีขาว
];

    // Variables to track current modal context
    let currentCardContext = {
        isTeamA: true,
        isYellow: true,
        isGoal: false,
        cardToEdit: null
    };

    let currentSubContext = {
        isTeamA: true,
        isHalfTime: false,
        subToEdit: null,
        additionalSubs: []
    };

    // Initialize the page
function init() {
    createHalfTimeSubButtons();
    // คอมเมนต์บรรทัดนี้ออกถ้าไม่ต้องการสร้าง halfTimeModal
    // createHalfTimeModal(); 
    createSecondHalfConfirmModal(); // เพิ่มการสร้าง modal ยืนยันเริ่มครึ่งหลัง
    loadSavedMatchData();
    setupEventListeners();
    initColorPickers();
    autoSaveTimer = setInterval(saveMatchData, 10000);
    if (!matchState.isMatchStarted) {
        setTimeout(showTeamCustomizationDialog, 500);
    }
    updateSubstitutionButtonsState();
}
    
function scrollToBottom(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}
function createSecondHalfConfirmModal() {
    // ตรวจสอบว่ามี modal อยู่แล้วหรือไม่
    if (document.getElementById('secondHalfConfirmModal')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'secondHalfConfirmModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">เริ่มครึ่งหลัง</div>
                <button class="close-btn" id="closeSecondHalfConfirmBtn">×</button>
            </div>
            <p>คุณพร้อมที่จะเริ่มการแข่งขันครึ่งหลังใช่หรือไม่?</p>
            <div class="modal-actions">
                <button class="modal-btn cancel-btn" id="cancelSecondHalfBtn">ยกเลิก</button>
                <button class="modal-btn confirm-btn" id="confirmSecondHalfBtn">ยืนยัน</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // เพิ่ม Event Listeners
    document.getElementById('closeSecondHalfConfirmBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('cancelSecondHalfBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    document.getElementById('confirmSecondHalfBtn').addEventListener('click', () => {
        document.getElementById('secondHalfConfirmModal').style.display = 'none';
        // ตั้งค่าให้แน่ใจว่าเริ่มครึ่งหลังที่ 45:00
        matchState.isFirstHalf = false;
        matchState.elapsedTime = "45:00";
        startMatch();
    });
}
    // Create half-time substitution buttons
    function createHalfTimeSubButtons() {
        // Create Team A half-time sub button
        teamAHalfSubBtn = document.createElement('button');
        teamAHalfSubBtn.className = 'action-btn sub-btn-a';
        teamAHalfSubBtn.id = 'teamAHalfSubBtn';
        teamAHalfSubBtn.textContent = 'Half-time Sub';
        teamAHalfSubBtn.style.gridRow = '4';
        teamAHalfSubBtn.style.gridColumn = '1 / span 2';
        
        // Create Team B half-time sub button
        teamBHalfSubBtn = document.createElement('button');
        teamBHalfSubBtn.className = 'action-btn sub-btn-b';
        teamBHalfSubBtn.id = 'teamBHalfSubBtn';
        teamBHalfSubBtn.textContent = 'Half-time Sub';
        teamBHalfSubBtn.style.gridRow = '4';
        teamBHalfSubBtn.style.gridColumn = '1 / span 2';
        
        // Add buttons to the DOM
        const teamAActions = document.querySelector('.team-a .team-actions');
        const teamBActions = document.querySelector('.team-b .team-actions');
        
        teamAActions.appendChild(teamAHalfSubBtn);
        teamBActions.appendChild(teamBHalfSubBtn);
    }

    // Create the half-time modal
    function createHalfTimeModal() {
        halfTimeModal = document.createElement('div');
        halfTimeModal.className = 'modal';
        halfTimeModal.id = 'halfTimeModal';
        
        halfTimeModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Half-time</div>
                    <button class="close-btn" id="closeHalfTimeBtn">×</button>
                </div>
                <p>First half ended. Ready to start second half?</p>
                <div class="modal-actions">
                    <button class="modal-btn confirm-btn" id="startSecondHalfBtn">Start Second Half</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(halfTimeModal);
        
        // Add event listeners
        document.getElementById('closeHalfTimeBtn').addEventListener('click', () => {
            halfTimeModal.style.display = 'none';
        });
        
        document.getElementById('startSecondHalfBtn').addEventListener('click', startSecondHalf);
    }

    // Set up all event listeners
  function setupEventListeners() {
    const savePdfBtn = document.getElementById('savePdfBtn');
    if (savePdfBtn) {
        savePdfBtn.addEventListener('click', saveCurrentMatchAsPdf);
    }
    
    setupSavePdfButton();
    // ปุ่มเริ่มการแข่งขัน (เพิ่มการตรวจสอบว่าเป็นครึ่งหลังหรือไม่)
    startMatchBtn.addEventListener('click', () => {
        if (matchState.isHalfTime) {
            // ถ้าเป็นครึ่งหลัง แสดง popup ยืนยัน
            showSecondHalfConfirmDialog();
        } else {
            // ถ้าเป็นครึ่งแรก เริ่มเกมได้เลย
            startMatch();
        }
    });

    injuryBtn.addEventListener('click', toggleInjuryTime);
    injuryFab.addEventListener('click', toggleInjuryTime);
    endMatchBtn.addEventListener('click', endMatch);
    resetDataBtn.addEventListener('click', function() {
        // Show confirmation dialog instead of directly resetting
        showResetConfirmDialog();
    });
   
    teamAYellowBtn.addEventListener('click', () => showCardDialog(true, true, false));
    teamARedBtn.addEventListener('click', () => showCardDialog(true, false, false));
    teamASubBtn.addEventListener('click', () => showSubstitutionDialog(true, false));
    
    teamAHalfSubBtn.addEventListener('click', () => {
        // อนุญาตให้ใช้ปุ่ม Half-time Substitution ได้ตลอดเวลา
        showSubstitutionDialog(true, true);
    });
    
    teamAGoalBtn.addEventListener('click', () => showCardDialog(true, false, true));
    
    teamBYellowBtn.addEventListener('click', () => showCardDialog(false, true, false));
    teamBRedBtn.addEventListener('click', () => showCardDialog(false, false, false));
    teamBSubBtn.addEventListener('click', () => showSubstitutionDialog(false, false));
    
    teamBHalfSubBtn.addEventListener('click', () => {
        // อนุญาตให้ใช้ปุ่ม Half-time Substitution ได้ตลอดเวลา
        showSubstitutionDialog(false, true);
    });
    
    teamBGoalBtn.addEventListener('click', () => showCardDialog(false, false, true));
    
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
    closeInjurySummaryConfirmBtn.addEventListener('click', () => {
        injurySummaryModal.style.display = 'none';
        if (matchState.isHalfTime) {
            showHalfTimeDialog();
        }
    });
    
    closeResetConfirmBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
    cancelResetBtn.addEventListener('click', () => resetConfirmModal.style.display = 'none');
    confirmResetBtn.addEventListener('click', () => {
        resetAllData();
        resetConfirmModal.style.display = 'none';
    });

    closeMatchSummaryBtn.addEventListener('click', () => matchSummaryModal.style.display = 'none');
    closeMatchSummaryConfirmBtn.addEventListener('click', () => {
        matchSummaryModal.style.display = 'none';
        resetAllData();
    });
    saveAsPdfBtn.addEventListener('click', saveSummaryAsPdf);
    
    // ถ้ามีการใช้ Half-time Modal
    if (document.getElementById('closeHalfTimeBtn')) {
        document.getElementById('closeHalfTimeBtn').addEventListener('click', () => {
            halfTimeModal.style.display = 'none';
        });
    }
    
    if (document.getElementById('startSecondHalfBtn')) {
        document.getElementById('startSecondHalfBtn').addEventListener('click', showSecondHalfConfirmDialog);
    }

    // เพิ่ม Event Listeners สำหรับ Second Half Confirm Modal
    if (document.getElementById('closeSecondHalfConfirmBtn')) {
        document.getElementById('closeSecondHalfConfirmBtn').addEventListener('click', () => {
            document.getElementById('secondHalfConfirmModal').style.display = 'none';
        });
    }
    
    if (document.getElementById('cancelSecondHalfBtn')) {
        document.getElementById('cancelSecondHalfBtn').addEventListener('click', () => {
            document.getElementById('secondHalfConfirmModal').style.display = 'none';
        });
    }
    
    if (document.getElementById('confirmSecondHalfBtn')) {
        document.getElementById('confirmSecondHalfBtn').addEventListener('click', () => {
            document.getElementById('secondHalfConfirmModal').style.display = 'none';
            startMatch();
        });
    }
}
    function showSecondHalfConfirmDialog() {
    const modal = document.getElementById('secondHalfConfirmModal');
    if (!modal) {
        createSecondHalfConfirmModal();
    }
    document.getElementById('secondHalfConfirmModal').style.display = 'flex';
}
function showHalfTimeSummary() {
    if (!document.getElementById('halfTimeSummaryModal')) {
        createHalfTimeSummaryModal();
    }
    
    const isFirstHalf = matchState.isFirstHalf;
    const halfTimeSummaryTitle = document.getElementById('halfTimeSummaryTitle');
    halfTimeSummaryTitle.textContent = isFirstHalf ? 'First Half Summary' : 'Second Half Summary';
    
    const teamA = matchState.teamA;
    const teamB = matchState.teamB;
    
    // Filter events that occurred in the current half
    const isHalfTimeEvent = (timeStamp) => {
        if (timeStamp === "Half-time") return false;
        
        // For second half, check if minutes are >= 45 (or in your case >= 2)
        if (!isFirstHalf) {
            const minutes = parseInt(timeStamp.split(':')[0]);
            return minutes >= 45; // Adjust to 45 for full match time
        }
        
        // For first half, check if minutes are < 45 (or in your case < 2)
        const minutes = parseInt(timeStamp.split(':')[0]);
        return minutes < 45; // Adjust to 45 for full match time
    };
    
    // Filter cards for current half
    const teamAHalfCards = teamA.cards.filter(card => isHalfTimeEvent(card.timeStamp));
    const teamBHalfCards = teamB.cards.filter(card => isHalfTimeEvent(card.timeStamp));
    
    // Filter substitutions for current half
    const teamAHalfSubs = teamA.substitutions.filter(sub => isHalfTimeEvent(sub.timeStamp));
    const teamBHalfSubs = teamB.substitutions.filter(sub => isHalfTimeEvent(sub.timeStamp));
    
    // Count events
    const teamAYellowCards = teamAHalfCards.filter(card => card.isYellow).length;
    const teamARedCards = teamAHalfCards.filter(card => !card.isYellow && !card.isGoal).length;
    const teamAGoals = teamAHalfCards.filter(card => card.isGoal).length;
    
    const teamBYellowCards = teamBHalfCards.filter(card => card.isYellow).length;
    const teamBRedCards = teamBHalfCards.filter(card => !card.isYellow && !card.isGoal).length;
    const teamBGoals = teamBHalfCards.filter(card => card.isGoal).length;
    
    // Group substitutions by window
    const teamASubWindows = groupSubstitutionsByWindow(teamAHalfSubs);
    const teamBSubWindows = groupSubstitutionsByWindow(teamBHalfSubs);
    
    // Build summary HTML
    let summaryHTML = `
        <div style="margin-bottom: 16px;">
            <h3 style="margin-bottom: 8px;">${isFirstHalf ? 'First Half' : 'Second Half'} Statistics</h3>
            <p>Time: ${matchState.elapsedTime}</p>
            <p>Injury Time: ${getTotalInjuryTimeDisplay()}</p>
        </div>
        <div style="margin-bottom: 16px;">
            <h3 style="margin-bottom: 8px;">${teamA.name}</h3>
            <p>Goals: ${teamAGoals}</p>
            <p>Yellow Cards: ${teamAYellowCards}</p>
            <p>Red Cards: ${teamARedCards}</p>
            ${teamAHalfCards.length > 0 ? `
                <div style="margin-top: 8px;">
                    <p>Event Details:</p>
                    ${teamAHalfCards.map(card => `
                        <p style="margin-left: 16px;">- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})</p>
                    `).join('')}
                </div>
            ` : ''}
            ${teamASubWindows.length > 0 ? `
                <div style="margin-top: 8px;">
                    <p>Substitution Details:</p>
                    ${teamASubWindows.map((window, index) => `
                        <p style="margin-left: 16px;">- ${window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`} (${window.timeStamp}):</p>
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
            ${teamBHalfCards.length > 0 ? `
                <div style="margin-top: 8px;">
                    <p>Event Details:</p>
                    ${teamBHalfCards.map(card => `
                        <p style="margin-left: 16px;">- ${card.isGoal ? 'Goal' : (card.isYellow ? 'Yellow Card' : 'Red Card')} #${card.playerNumber} (${card.timeStamp})</p>
                    `).join('')}
                </div>
            ` : ''}
            ${teamBSubWindows.length > 0 ? `
                <div style="margin-top: 8px;">
                    <p>Substitution Details:</p>
                    ${teamBSubWindows.map((window, index) => `
                        <p style="margin-left: 16px;">- ${window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`} (${window.timeStamp}):</p>
                        ${window.substitutions.map(sub => `
                            <p style="margin-left: 32px;">#${sub.playerInNumber} In, #${sub.playerOutNumber} Out</p>
                        `).join('')}
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('halfTimeSummaryContent').innerHTML = summaryHTML;
    document.getElementById('halfTimeSummaryModal').style.display = 'flex';
}
function createHalfTimeSummaryModal() {
    if (document.getElementById('halfTimeSummaryModal')) {
        return; // Modal already exists
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'halfTimeSummaryModal';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <div class="modal-title" id="halfTimeSummaryTitle">Half-time Summary</div>
                <button class="close-btn" id="closeHalfTimeSummaryBtn">×</button>
            </div>
            <div class="summary-container" id="halfTimeSummaryContent"></div>
            <div class="modal-actions">
                <button class="modal-btn confirm-btn" id="saveHalfTimePdfBtn">Save as PDF</button>
                <button class="modal-btn confirm-btn" id="closeHalfTimeSummaryConfirmBtn">Continue</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('closeHalfTimeSummaryBtn').addEventListener('click', () => {
        modal.style.display = 'none';
        if (matchState.isFirstHalf) {
            endFirstHalf(); // Continue to half-time after closing
        }
    });
    
    document.getElementById('closeHalfTimeSummaryConfirmBtn').addEventListener('click', () => {
        document.getElementById('halfTimeSummaryModal').style.display = 'none';
        
        // Complete the half-time process after closing the summary
        if (matchState.isFirstHalf) {
            // Set match state for half-time
            matchState.isHalfTime = true;
            matchState.isMatchStarted = false;
            matchState.isInjuryTimeActive = false;
            matchState.isFirstHalf = false; 
            matchState.isAddingInjuryTime = false;
            matchState.totalInjurySeconds = 0;
            matchState.injuryTimePeriods = [];
            matchState.currentInjuryStartTime = null;
            matchState.currentInjuryTimeDisplay = "+00:00";
            
            // Lock display at 02:00 (or 45:00 for normal time)
            matchState.elapsedTime = "45:00";  // or "45:00"
            
            // Hide Injury Time buttons during half-time
            injuryBtn.style.display = 'none';
            injuryFab.style.display = 'none';
            
            // Update UI and save data
            updateUI();
            saveMatchData();
        }
    });
    
    document.getElementById('saveHalfTimePdfBtn').addEventListener('click', () => {
        const isHalfTime = matchState.isFirstHalf;
        saveHalfSummaryAsPdf(isHalfTime);
    });
}
function saveHalfSummaryAsPdf(isFirstHalf) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const halfTitle = isFirstHalf ? 'First Half Summary' : 'Second Half Summary';
    
    doc.setFontSize(16);
    doc.text(halfTitle, 105, 10, { align: "center" });
    
    const teamA = matchState.teamA;
    const teamB = matchState.teamB;
    
    // Filter events that occurred in the current half
    const isHalfTimeEvent = (timeStamp) => {
        if (timeStamp === "Half-time") return false;
        
        // For second half, check if minutes are >= 45 (or in your case >= 2)
        if (!isFirstHalf) {
            const minutes = parseInt(timeStamp.split(':')[0]);
            return minutes >= 45; // Adjust to 45 for full match time
        }
        
        // For first half, check if minutes are < 45 (or in your case < 2)
        const minutes = parseInt(timeStamp.split(':')[0]);
        return minutes < 45; // Adjust to 45 for full match time
    };
    
    // Filter cards for current half
    const teamAHalfCards = teamA.cards.filter(card => isHalfTimeEvent(card.timeStamp));
    const teamBHalfCards = teamB.cards.filter(card => isHalfTimeEvent(card.timeStamp));
    
    // Filter substitutions for current half
    const teamAHalfSubs = teamA.substitutions.filter(sub => isHalfTimeEvent(sub.timeStamp));
    const teamBHalfSubs = teamB.substitutions.filter(sub => isHalfTimeEvent(sub.timeStamp));
    
    // Count events
    const teamAYellowCards = teamAHalfCards.filter(card => card.isYellow).length;
    const teamARedCards = teamAHalfCards.filter(card => !card.isYellow && !card.isGoal).length;
    const teamAGoals = teamAHalfCards.filter(card => card.isGoal).length;
    
    const teamBYellowCards = teamBHalfCards.filter(card => card.isYellow).length;
    const teamBRedCards = teamBHalfCards.filter(card => !card.isYellow && !card.isGoal).length;
    const teamBGoals = teamBHalfCards.filter(card => card.isGoal).length;
    
    // Group substitutions by window
    const teamASubWindows = groupSubstitutionsByWindow(teamAHalfSubs);
    const teamBSubWindows = groupSubstitutionsByWindow(teamBHalfSubs);
    
    let yPos = 20;
    
    // Half time information
    doc.setFontSize(14);
    doc.text(`${isFirstHalf ? 'First Half' : 'Second Half'} Statistics`, 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Time: ${matchState.elapsedTime}`, 10, yPos);
    yPos += 7;
    doc.text(`Injury Time: ${getTotalInjuryTimeDisplay()}`, 10, yPos);
    yPos += 10;
    
    // Team A information
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
    
    if (teamAHalfCards.length > 0) {
        yPos += 5;
        doc.text("Event Details:", 10, yPos);
        yPos += 7;
        teamAHalfCards.forEach(card => {
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
            const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
            doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
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
    
    // Team B information
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
    
    if (teamBHalfCards.length > 0) {
        yPos += 5;
        doc.text("Event Details:", 10, yPos);
        yPos += 7;
        teamBHalfCards.forEach(card => {
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
            const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
            doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
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
    
    const halfName = isFirstHalf ? 'First_Half' : 'Second_Half';
    doc.save(`${halfName}_Summary_${new Date().toISOString().slice(0,10)}.pdf`);
}
function showResetConfirmDialog() {
    resetConfirmModal.style.display = 'flex';
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

    // Load saved match data
    function loadSavedMatchData() {
        const savedData = localStorage.getItem('matchData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            matchState = {
                ...matchState,
                ...parsedData,
                startTime: parsedData.startTime ? new Date(parsedData.startTime) : null,
                currentInjuryStartTime: parsedData.currentInjuryStartTime ? new Date(parsedData.currentInjuryStartTime) : null,
                teamA: { 
                    ...matchState.teamA, 
                    ...parsedData.teamA, 
                    goals: parsedData.teamA.goals || 0,
                    playerCount: parsedData.teamA.playerCount || 0,
                    halfTimeSubstitutions: parsedData.teamA.halfTimeSubstitutions || [],
                    hasUsedHalfTimeSub: parsedData.teamA.hasUsedHalfTimeSub || false // เพิ่มบรรทัดนี้
                },
                teamB: { 
                    ...matchState.teamB, 
                    ...parsedData.teamB, 
                    goals: parsedData.teamB.goals || 0,
                    playerCount: parsedData.teamB.playerCount || 0,
                    halfTimeSubstitutions: parsedData.teamB.halfTimeSubstitutions || [],
                    hasUsedHalfTimeSub: parsedData.teamB.hasUsedHalfTimeSub || false // เพิ่มบรรทัดนี้
                }
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

    // Modify the UI update function to always show Half-time Substitution buttons
    function updateUI() {
        console.log("Current match state:", {
            isFirstHalf: matchState.isFirstHalf,
            isHalfTime: matchState.isHalfTime,
            isMatchStarted: matchState.isMatchStarted,
            elapsedTime: matchState.elapsedTime
        });
        teamANameEl.textContent = matchState.teamA.name;
        teamBNameEl.textContent = matchState.teamB.name;
        
        // อัปเดตสีของไอคอนเสื้อตามสีทีม
        const teamAJersey = document.getElementById('teamAJersey');
        const teamBJersey = document.getElementById('teamBJersey');
        
        if (teamAJersey) teamAJersey.style.color = matchState.teamA.color;
        if (teamBJersey) teamBJersey.style.color = matchState.teamB.color;
        
        teamAHeader.style.display = 'none'; // ซ่อนแถบสีทั้งหมด
        teamBHeader.style.display = 'none'; // ซ่อนแถบสีทั้งหมด
        
        // อัปเดตคะแนนในส่วนหัว
        const teamAScoreEl = document.getElementById('teamAScore');
        const teamBScoreEl = document.getElementById('teamBScore');
        teamAScoreEl.textContent = matchState.teamA.goals;
        teamBScoreEl.textContent = matchState.teamB.goals;
        
        teamASubBtn.style.backgroundColor = matchState.teamA.color;
        teamBSubBtn.style.backgroundColor = matchState.teamB.color;
        teamAHalfSubBtn.style.backgroundColor = matchState.teamA.color;
        teamBHalfSubBtn.style.backgroundColor = matchState.teamB.color;
        
        // แสดงปุ่ม Substitution ทั้งสองปุ่มเสมอ
        teamAHalfSubBtn.style.display = 'block';
        teamBHalfSubBtn.style.display = 'block';
        teamASubBtn.style.display = 'block';
        teamBSubBtn.style.display = 'block';
        
        // ปิดการใช้งานปุ่ม Half-time Substitution ในช่วงครึ่งแรก
        if (matchState.isFirstHalf && matchState.isMatchStarted && !matchState.isHalfTime) {
            // ปิดการใช้งานปุ่ม Half-time Substitution ในช่วงครึ่งแรก
            teamAHalfSubBtn.disabled = true;
            teamAHalfSubBtn.classList.add('disabled');
            teamAHalfSubBtn.innerHTML = 'Half-time Sub';
            
            teamBHalfSubBtn.disabled = true;
            teamBHalfSubBtn.classList.add('disabled');
            teamBHalfSubBtn.innerHTML = 'Half-time Sub';
        }
        // เปิดการใช้งานปุ่ม Half-time Substitution ในช่วงพักครึ่งหรือครึ่งหลัง
        else {
            // ยังคงตรวจสอบเงื่อนไขอื่นๆ เช่น ถ้าใช้ Half-time Substitution ไปแล้ว ก็ยังคงปิดการใช้งาน
            if (matchState.teamA.hasUsedHalfTimeSub) {
                teamAHalfSubBtn.disabled = true;
                teamAHalfSubBtn.classList.add('disabled');
                teamAHalfSubBtn.innerHTML = 'Half-time Sub Used';
            } else {
                teamAHalfSubBtn.disabled = false;
                teamAHalfSubBtn.classList.remove('disabled');
                teamAHalfSubBtn.innerHTML = 'Half-time Sub';
            }
    
            if (matchState.teamB.hasUsedHalfTimeSub) {
                teamBHalfSubBtn.disabled = true;
                teamBHalfSubBtn.classList.add('disabled');
                teamBHalfSubBtn.innerHTML = 'Half-time Sub Used';
            } else {
                teamBHalfSubBtn.disabled = false;
                teamBHalfSubBtn.classList.remove('disabled');
                teamBHalfSubBtn.innerHTML = 'Half-time Sub';
            }
        }
        
        updateSubstitutionButtonsState();
        
        // แสดงเวลาการแข่งขัน
        matchTimeEl.textContent = matchState.elapsedTime;
    
    if (matchState.isInjuryTimeActive) {
        injuryTimeEl.textContent = matchState.currentInjuryTimeDisplay;
        injuryTimeEl.style.display = 'block';
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
    
    // Show/hide control buttons based on match state
    if (matchState.isMatchStarted && !matchState.isHalfTime) {
        // When match is in progress
        matchControlsEl.style.display = 'none';
        
        // Hide injury time button during injury time countdown
        if (matchState.isAddingInjuryTime) {
            injuryControlsEl.style.display = 'flex';
            injuryFab.style.display = 'none';
            injuryBtn.style.display = 'none'; // Hide injury time button
        } else {
            injuryControlsEl.style.display = 'flex';
            injuryFab.style.display = 'flex';
            injuryBtn.style.display = 'block'; // Show injury time button
        }
        
        // Update button text for second half
        if (!matchState.isFirstHalf) {
            startMatchBtn.innerHTML = '<i class="fas fa-play"></i> Start Second Half';
        }
    } else if (matchState.isHalfTime) {
        // During half-time
        matchControlsEl.style.display = 'flex';
        injuryControlsEl.style.display = 'none';
        injuryFab.style.display = 'none';
        startMatchBtn.innerHTML = '<i class="fas fa-play"></i> Start Second Half';
    } else {
        // Before match starts or after it ends
        matchControlsEl.style.display = 'flex';
        injuryControlsEl.style.display = 'none';
        injuryFab.style.display = 'none';
        startMatchBtn.innerHTML = '<i class="fas fa-play"></i> Start Match';
    }
    
     renderTeamCards();
    renderTeamSubstitutions();
}

// Modify the function to update substitution button states
function updateSubstitutionButtonsState() {
    // Check for max 5 players substituted per team
    if (matchState.isMatchStarted || matchState.isHalfTime) {
        // Team A substitution button state
        const teamAPlayerSubCount = getPlayerSubCount(true);
        const teamAWindowsUsed = matchState.teamA.subWindows;
        
        // ตรวจสอบว่าทีม A ใช้ Half-time Substitution ไปแล้วหรือยัง
        if (matchState.teamA.hasUsedHalfTimeSub) {
            teamAHalfSubBtn.disabled = true;
            teamAHalfSubBtn.classList.add('disabled');
            teamAHalfSubBtn.innerHTML = 'Half-time Sub Used';
        }
        
        if (teamAPlayerSubCount >= 5) {
            // Max players substituted
            teamASubBtn.disabled = true;
            teamASubBtn.classList.add('disabled');
            teamASubBtn.innerHTML = 'Max 5 Players Subbed';
            
            teamAHalfSubBtn.disabled = true;
            teamAHalfSubBtn.classList.add('disabled');
            teamAHalfSubBtn.innerHTML = 'Max 5 Players Subbed';
        } else if (teamAWindowsUsed >= 3 && !matchState.activeSubWindow.teamA && !matchState.isHalfTime) {
            // Max windows used for regular subs
            teamASubBtn.disabled = true;
            teamASubBtn.classList.add('disabled');
            teamASubBtn.innerHTML = 'Sub Windows Exhausted';
            
            // ตรวจสอบซ้ำว่าทีม A ใช้ Half-time Substitution ไปแล้วหรือยัง
            if (!matchState.teamA.hasUsedHalfTimeSub) {
                teamAHalfSubBtn.disabled = false;
                teamAHalfSubBtn.classList.remove('disabled');
                teamAHalfSubBtn.innerHTML = 'Half-time Sub';
            }
        } else {
            // Normal case
            teamASubBtn.disabled = false;
            teamASubBtn.classList.remove('disabled');
            teamASubBtn.innerHTML = 'Substitution' + (matchState.activeSubWindow.teamA ? ' (Active)' : '');
            
            // ตรวจสอบซ้ำว่าทีม A ใช้ Half-time Substitution ไปแล้วหรือยัง
            if (!matchState.teamA.hasUsedHalfTimeSub) {
                teamAHalfSubBtn.disabled = false;
                teamAHalfSubBtn.classList.remove('disabled');
                teamAHalfSubBtn.innerHTML = 'Half-time Sub';
            }
        }
        
        // Team B substitution button state
        const teamBPlayerSubCount = getPlayerSubCount(false);
        const teamBWindowsUsed = matchState.teamB.subWindows;
        
        // ตรวจสอบว่าทีม B ใช้ Half-time Substitution ไปแล้วหรือยัง
        if (matchState.teamB.hasUsedHalfTimeSub) {
            teamBHalfSubBtn.disabled = true;
            teamBHalfSubBtn.classList.add('disabled');
            teamBHalfSubBtn.innerHTML = 'Half-time Sub Used';
        }
        
        if (teamBPlayerSubCount >= 5) {
            // Max players substituted
            teamBSubBtn.disabled = true;
            teamBSubBtn.classList.add('disabled');
            teamBSubBtn.innerHTML = 'Max 5 Players Subbed';
            
            teamBHalfSubBtn.disabled = true;
            teamBHalfSubBtn.classList.add('disabled');
            teamBHalfSubBtn.innerHTML = 'Max 5 Players Subbed';
        } else if (teamBWindowsUsed >= 3 && !matchState.activeSubWindow.teamB && !matchState.isHalfTime) {
            // Max windows used for regular subs
            teamBSubBtn.disabled = true;
            teamBSubBtn.classList.add('disabled');
            teamBSubBtn.innerHTML = 'Sub Windows Exhausted';
            
            // ตรวจสอบซ้ำว่าทีม B ใช้ Half-time Substitution ไปแล้วหรือยัง
            if (!matchState.teamB.hasUsedHalfTimeSub) {
                teamBHalfSubBtn.disabled = false;
                teamBHalfSubBtn.classList.remove('disabled');
                teamBHalfSubBtn.innerHTML = 'Half-time Sub';
            }
        } else {
            // Normal case
            teamBSubBtn.disabled = false;
            teamBSubBtn.classList.remove('disabled');
            teamBSubBtn.innerHTML = 'Substitution' + (matchState.activeSubWindow.teamB ? ' (Active)' : '');
            
            // ตรวจสอบซ้ำว่าทีม B ใช้ Half-time Substitution ไปแล้วหรือยัง
            if (!matchState.teamB.hasUsedHalfTimeSub) {
                teamBHalfSubBtn.disabled = false;
                teamBHalfSubBtn.classList.remove('disabled');
                teamBHalfSubBtn.innerHTML = 'Half-time Sub';
            }
        }
    }
}

// Update the CSS layout for the team action buttons to accommodate both buttons
function updateTeamActionsCSS() {
    // Make both buttons visible by changing the grid layout
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .team-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto auto;
            margin-bottom: 10px;
            gap: 8px;
        }
        
        /* Make yellow and red cards fit the top row */
        .yellow-btn, .red-btn {
            grid-row: 1;
            height: 60px;
        }
        
        .yellow-btn {
            grid-column: 1;
        }
        
        .red-btn {
            grid-column: 2;
        }
        
        /* Goal button spans full width in second row */
        .goal-btn {
            grid-row: 2;
            grid-column: 1 / span 2;
            height: 42px;
        }
        
        /* Regular sub in third row */
        .sub-btn-a, .sub-btn-b {
            grid-row: 3;
            grid-column: 1 / span 2;
            height: 42px;
        }
        
        /* Half-time sub in fourth row */
        #teamAHalfSubBtn, #teamBHalfSubBtn {
            grid-row: 4;
            grid-column: 1 / span 2;
            height: 42px;
        }
        
        /* Style for disabled buttons */
        .action-btn.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }
    `;
    document.head.appendChild(styleElement);
}

// Modify the event listeners for half-time substitution buttons
function setupHalfTimeSubEventListeners() {
    teamAHalfSubBtn.addEventListener('click', () => {
        // Allow half-time subs even in second half
        showSubstitutionDialog(true, true);
    });
    
    teamBHalfSubBtn.addEventListener('click', () => {
        // Allow half-time subs even in second half
        showSubstitutionDialog(false, true);
    });
}

// Call this function after creating half-time sub buttons
function initializeHalfTimeSubButtons() {
    updateTeamActionsCSS();
    setupHalfTimeSubEventListeners();
}
    
    // Get total player substitution count for a team
    function getPlayerSubCount(isTeamA) {
        const team = isTeamA ? matchState.teamA : matchState.teamB;
        let playerCount = 0;
        
        // Count regular substitutions
        team.substitutions.forEach(sub => {
            // For each substitution window, count the number of players
            if (!sub.windowId) {
                playerCount++; // Count single subs (legacy data)
            }
        });
        
        // Count windows properly
        const windows = new Set();
        team.substitutions.forEach(sub => {
            if (sub.windowId) {
                windows.add(sub.windowId);
            }
        });
        
        // For each window, find how many players were substituted
        windows.forEach(windowId => {
            const windowSubs = team.substitutions.filter(sub => sub.windowId === windowId);
            playerCount += windowSubs.length;
        });
        
        // Add half-time substitutions
        playerCount += team.halfTimeSubstitutions.length;
        
        return playerCount;
    }

    function renderTeamCards() {
        const teamACardsHTML = matchState.teamA.cards.map(card => createCardHTML(card, true)).join('');
        if (teamACardsHTML) {
            teamACardsEmpty.style.display = 'none';
            teamACardsContent.innerHTML = teamACardsEmpty.outerHTML + teamACardsHTML;
            scrollToBottom('teamACardsContent'); // Auto-scroll to latest card
        } else {
            teamACardsEmpty.style.display = 'flex';
        }
        
        const teamBCardsHTML = matchState.teamB.cards.map(card => createCardHTML(card, false)).join('');
        if (teamBCardsHTML) {
            teamBCardsEmpty.style.display = 'none';
            teamBCardsContent.innerHTML = teamBCardsEmpty.outerHTML + teamBCardsHTML;
            scrollToBottom('teamBCardsContent'); // Auto-scroll to latest card
        } else {
            teamBCardsEmpty.style.display = 'flex';
        }
    }

    function createCardHTML(card, isTeamA) {
        let eventType, iconClass, iconHTML;
        
        if (card.isGoal) {
            eventType = 'Goal';
            iconClass = 'goal-icon';
            iconHTML = '<i class="fas fa-futbol"></i>';
        } else if (card.isYellow) {
            eventType = 'Yellow Card';
            iconClass = 'yellow-icon';
            iconHTML = '<i class="fas fa-square"></i>';
        } else if (card.isSecondYellow) {
            eventType = 'Second Yellow Card → Red Card';
            iconClass = 'red-icon';
            iconHTML = '<i class="fas fa-square"></i>';
        } else {
            eventType = 'Red Card';
            iconClass = 'red-icon';
            iconHTML = '<i class="fas fa-square"></i>';
        }
        
        let cardHTML = `
            <div class="event-card" data-id="${card.id}">
                <div class="event-icon ${iconClass}">
                    ${iconHTML}
                </div>
                <div class="event-details">
                    <div class="event-title${card.isSecondYellow ? ' second-yellow' : ''}">${eventType} - #${card.playerNumber}</div>
                    <div class="event-time">Time: ${card.timeStamp}</div>`;
        
        // Add yellow card references if this is a second yellow card
        if (card.isSecondYellow && card.yellowCardTimestamps) {
            cardHTML += `
                    <div class="event-yellow-refs">
                        <div>Yellow Card Records:</div>
                        <div>1st Yellow: ${card.yellowCardTimestamps[0]}</div>
                        <div>2nd Yellow: ${card.yellowCardTimestamps[1]}</div>
                    </div>`;
        }
        
        cardHTML += `
                </div>
                <button class="edit-btn" onclick="editCard('${card.id}', ${isTeamA})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        return cardHTML;
    }

    function groupSubstitutionsByWindow(subs) {
        const windows = {};
        subs.forEach(sub => {
            const windowId = sub.windowId || sub.id;
            if (!windows[windowId]) {
                windows[windowId] = {
                    id: windowId,
                    substitutions: [],
                    timeStamp: sub.timeStamp,
                    isHalfTime: sub.isHalfTime || false
                };
            }
            windows[windowId].substitutions.push(sub);
        });
        return Object.values(windows).sort((a, b) => {
            // Half-time subs should be sorted before regular subs
            if (a.isHalfTime && !b.isHalfTime) return -1;
            if (!a.isHalfTime && b.isHalfTime) return 1;
            
            const timeA = a.timeStamp.replace(/\+.*$/, '');
            const timeB = b.timeStamp.replace(/\+.*$/, '');
            const [minsA, secsA] = timeA.split(':').map(Number);
            const [minsB, secsB] = timeB.split(':').map(Number);
            if (minsA !== minsB) return minsA - minsB;
            return secsA - secsB;
        });
    }

    function renderTeamSubstitutions() {
        // Get all substitutions including half-time subs
        const teamASubs = [...matchState.teamA.substitutions];
        const teamBSubs = [...matchState.teamB.substitutions];
        
        // Add half-time substitutions with special marking
        matchState.teamA.halfTimeSubstitutions.forEach(sub => {
            teamASubs.push({...sub, isHalfTime: true});
        });
        
        matchState.teamB.halfTimeSubstitutions.forEach(sub => {
            teamBSubs.push({...sub, isHalfTime: true});
        });
        
        const teamASubWindows = groupSubstitutionsByWindow(teamASubs);
        const teamBSubWindows = groupSubstitutionsByWindow(teamBSubs);
        
        const teamASubsHTML = teamASubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, true)
        ).join('');
        
        const teamBSubsHTML = teamBSubWindows.map((window, index) => 
            createSubWindowHTML(window, index + 1, false)
        ).join('');
        
        if (teamASubsHTML) {
            teamASubsEmpty.style.display = 'none';
            teamASubsContent.innerHTML = teamASubsEmpty.outerHTML + teamASubsHTML;
            scrollToBottom('teamASubsContent'); // Auto-scroll to latest substitution
        } else {
            teamASubsEmpty.style.display = 'flex';
        }
        
        if (teamBSubsHTML) {
            teamBSubsEmpty.style.display = 'none';
            teamBSubsContent.innerHTML = teamBSubsEmpty.outerHTML + teamBSubsHTML;
            scrollToBottom('teamBSubsContent'); // Auto-scroll to latest substitution
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
        
        const windowTitle = window.isHalfTime ? 
            "Half-time Substitution" : 
            `Substitution Window ${windowNumber}`;
            
        return `
            <div class="event-card sub-window" data-id="${window.id}" data-half-time="${window.isHalfTime}">
                <div class="event-icon ${isTeamA ? 'sub-icon-a' : 'sub-icon-b'}">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="event-details">
                    <div class="event-title">${windowTitle} (${window.substitutions.length} Players)</div>
                    <div class="event-time">Time: ${window.timeStamp}</div>
                    <div class="substitutions-list">
                        ${subsHTML}
                    </div>
                </div>
                <button class="edit-btn" onclick="editSubstitutionWindow('${window.id}', ${isTeamA}, ${window.isHalfTime})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    function startMatch() {
        if (matchState.isMatchStarted) return;
        
        matchState.isMatchStarted = true;
        
        // เพิ่มการตรวจสอบและแสดงข้อมูลเพื่อดีบัก
        console.log("Starting match with isFirstHalf:", matchState.isFirstHalf);
        
        // ถ้าเป็นครึ่งหลัง เริ่มจาก 45:00
        if (!matchState.isFirstHalf) {
            console.log("Setting up second half time starting at 45:00");
            // กำหนดให้ startTime เป็นเวลาปัจจุบันลบด้วย 45 นาที
            matchState.startTime = new Date();
            matchState.startTime.setMinutes(matchState.startTime.getMinutes() - 45);
            // ตั้งค่า elapsedTime เริ่มต้นเป็น 45:00 เพื่อให้แน่ใจว่าจะแสดงเวลาถูกต้องทันที
            matchState.elapsedTime = "45:00";
        } else {
            // ครึ่งแรกเริ่มที่ 00:00
            console.log("Setting up first half time starting at 00:00");
            matchState.startTime = new Date();
            matchState.elapsedTime = "00:00";
        }
        
        matchTimer = setInterval(updateMatchTime, 1000);
        startMatchBtn.style.display = 'none';
        matchControlsEl.style.display = 'none';
        injuryControlsEl.style.display = 'flex';
        updateUI();
        saveMatchData();
    }

    function startSecondHalf() {
        matchState.isFirstHalf = false;
        matchState.isHalfTime = false;
        matchState.isMatchStarted = true;
        matchState.startTime = new Date();
        matchState.startTime.setSeconds(matchState.startTime.getSeconds() - (45 * 60)); // เริ่มที่ 45:00
        matchState.elapsedTime = "45:00";
        matchState.totalInjurySeconds = 0; // รีเซ็ตเวลาบาดเจ็บสำหรับครึ่งหลัง
        matchState.injuryTimePeriods = [];
        matchTimer = setInterval(updateMatchTime, 1000);
        halfTimeModal.style.display = 'none';
        updateUI();
        saveMatchData();
    }
    function startTimers() {
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        
        if (matchState.isAddingInjuryTime) {
            // We're in injury time mode after a half
            injuryTimer = setInterval(updateInjuryTimeCountdown, 1000);
        } else {
            // Normal match time
            matchTimer = setInterval(updateMatchTime, 1000);
            
            if (matchState.isInjuryTimeActive && matchState.currentInjuryStartTime) {
                injuryTimer = setInterval(updateInjuryTime, 1000);
            }
        }
    }

    function updateMatchTime() {
        if (!matchState.startTime) return;
    
        const now = new Date();
        let elapsedSeconds = Math.floor((now - matchState.startTime) / 1000);
    
        // สำหรับครึ่งแรก จำกัดที่ 45:00 เว้นแต่จะมีเวลาบาดเจ็บ
        if (matchState.isFirstHalf) {
            if (elapsedSeconds >= matchState.currentHalfTime && !matchState.isAddingInjuryTime) {
                endFirstHalf();
                return;
            }
        } else {
            // สำหรับครึ่งหลัง จำกัดที่ 90:00 เว้นแต่จะมีเวลาบาดเจ็บ
            if (elapsedSeconds >= (90 * 60) && !matchState.isAddingInjuryTime) { // 90 นาทีรวมทั้งหมด
                endMatch();
                return;
            }
        }
    
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        matchState.elapsedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        matchTimeEl.textContent = matchState.elapsedTime;
    
        if (matchState.isAddingInjuryTime) {
            updateInjuryCountdown();
        }
    }

   function prepareInjuryTimeCountdown(seconds) {
    matchState.isAddingInjuryTime = true;
    matchState.remainingInjuryTime = seconds;
    
    // Show injury time indicator
    injuryTimeEl.textContent = getTotalInjuryTimeDisplay();
    injuryTimeEl.style.display = 'block';
    
    // ซ่อนปุ่ม Injury Time และ Injury FAB ในช่วงนับถอยหลัง
    injuryBtn.style.display = 'none';
    injuryFab.style.display = 'none';
    
    // Start countdown
    injuryTimer = setInterval(updateInjuryTimeCountdown, 1000);
}

function updateInjuryTimeCountdown() {
    if (matchState.remainingInjuryTime <= 0) {
        // Injury time is over
        clearInterval(injuryTimer);
        
        if (matchState.isFirstHalf) {
            // Show the half-time summary instead of directly ending the half
            showHalfTimeSummary();
        } else {
            // Show the full match summary
            showMatchSummary();
        }
        return;
    }
    
    // Update remaining time
    matchState.remainingInjuryTime--;
    const minutes = Math.floor(matchState.remainingInjuryTime / 60);
    const seconds = matchState.remainingInjuryTime % 60;
    const display = `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    injuryTimeEl.textContent = display;
}
function endFirstHalf() {
    clearInterval(matchTimer);
    clearInterval(injuryTimer);
    
    // ล็อกเวลาที่ 45:00
    matchState.elapsedTime = "45:00";
    matchState.isMatchStarted = false;
    
    // เพิ่มบรรทัดนี้เพื่อให้แน่ใจว่าได้ตั้งค่าเป็นครึ่งหลัง
    matchState.isFirstHalf = false;
    
    // แสดงสรุปครึ่งแรก
    showHalfTimeSummary();
}

    function showHalfTimeDialog() {
        halfTimeModal.style.display = 'flex';
    }

    function toggleInjuryTime() {
        if (!matchState.isMatchStarted) {
            alert('Please start the match first');
            return;
        }
        
        matchState.isInjuryTimeActive = !matchState.isInjuryTimeActive;
        
        if (matchState.isInjuryTimeActive) {
            matchState.currentInjuryStartTime = new Date();
            injuryTimer = setInterval(updateInjuryTime, 1000);
            injuryTimeEl.style.display = 'block';
            totalInjuryEl.style.display = 'none';
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
            matchState.currentInjuryTimeDisplay = '+00:00';
            injuryTimeEl.style.display = 'none';
            totalInjuryEl.textContent = getTotalInjuryTimeDisplay();
            totalInjuryEl.style.display = 'block';
            injuryBtn.classList.remove('active');
            injuryBtn.innerHTML = '<i class="fas fa-stopwatch"></i> Injury Time';
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
        if (!matchState.isMatchStarted && !matchState.isHalfTime && !cardToEdit) {
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
            matchState.isHalfTime ? "Half-time" :
            (matchState.isInjuryTimeActive ? 
                `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                matchState.elapsedTime);
        
        // Check if player already has a red card
        if (!cardToEdit) {
            const redCards = isTeamA 
                ? matchState.teamA.cards.filter(card => card.playerNumber === playerNumber && !card.isYellow && !card.isGoal)
                : matchState.teamB.cards.filter(card => card.playerNumber === playerNumber && !card.isYellow && !card.isGoal);
            
            if (redCards.length > 0) {
                alert(`Player #${playerNumber} already has a red card and cannot receive more cards.`);
                return;
            }
        }
        
        // Check for second yellow card
        if (!cardToEdit && isYellow && !isGoal) {
            const playerYellowCards = isTeamA 
                ? matchState.teamA.cards.filter(card => card.playerNumber === playerNumber && card.isYellow)
                : matchState.teamB.cards.filter(card => card.playerNumber === playerNumber && card.isYellow);
            
            if (playerYellowCards.length > 0) {
                // Player already has a yellow card, ask to convert to red
                if (confirm(`Player #${playerNumber} already has a yellow card. Convert to red card?`)) {
                    // Create a red card with references to both yellow cards
                    const firstYellowCard = playerYellowCards[0];
                    const newCard = {
                        id: Date.now().toString(),
                        isYellow: false,
                        isGoal: false,
                        isSecondYellow: true, // Flag to indicate this is a second yellow
                        timeStamp: currentTimeStamp,
                        playerNumber,
                        // Store the timestamps of both yellow cards
                        yellowCardTimestamps: [
                            firstYellowCard.timeStamp,
                            currentTimeStamp
                        ]
                    };
                    
                    if (isTeamA) {
                        matchState.teamA.cards.push(newCard);
                    } else {
                        matchState.teamB.cards.push(newCard);
                    }
                    
                    renderTeamCards();
                    updateUI();
                    saveMatchData();
                    cardModal.style.display = 'none';
                    return;
                }
            }
            
            // Check if this is already a third yellow card attempt (two existing)
            if (playerYellowCards.length > 1) {
                alert(`Player #${playerNumber} already has 2 yellow cards and cannot receive more yellow cards.`);
                return;
            }
        }
        
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
    function convertExistingHalfTimeSubstitutions() {
        // ฟังก์ชันนี้ใช้ในกรณีที่ต้องการแปลงการเปลี่ยนตัวที่ทำในช่วงพักครึ่งให้เป็นแบบปกติ
        // เมื่อมีการอัปเดตระบบใหม่ (ไม่จำเป็นต้องใช้หากเริ่มต้นด้วยระบบใหม่ตั้งแต่แรก)
        
        // คัดลอกข้อมูลการเปลี่ยนตัวช่วงพักครึ่งไปยังประวัติการเปลี่ยนตัวปกติ
        const copyHalfTimeSubs = (team) => {
            team.halfTimeSubstitutions.forEach(sub => {
                if (!sub.isHalfTime) {
                    team.substitutions.push({
                        ...sub,
                        isHalfTime: true // ยังคงระบุว่าเป็นการเปลี่ยนตัวช่วงพักครึ่ง
                    });
                }
            });
            
            // กรองเอาเฉพาะการเปลี่ยนตัวที่ทำในช่วงพักครึ่งจริงๆ
            team.halfTimeSubstitutions = team.halfTimeSubstitutions.filter(sub => 
                sub.isHalfTime || sub.timeStamp === "Half-time"
            );
        };
        
        copyHalfTimeSubs(matchState.teamA);
        copyHalfTimeSubs(matchState.teamB);
        
        // บันทึกการเปลี่ยนแปลง
        saveMatchData();
    }
    function showSubstitutionDialog(isTeamA, isHalfTime, windowToEdit = null) {
        // ลบเงื่อนไขตรวจสอบว่าอยู่ในช่วงพักครึ่งหรือไม่ออก
        // if (isHalfTime && !matchState.isHalfTime && !windowToEdit) {
        //     alert('Half-time substitutions can only be made during half-time');
        //     return;
        // }
        
        // ตรวจสอบว่าเกมเริ่มแล้วหรือยัง (สำหรับการเปลี่ยนตัวปกติ)
        if (!matchState.isMatchStarted && !matchState.isHalfTime && !isHalfTime && !windowToEdit) {
            alert('Please start the match first');
            return;
        }
        
        // ตรวจสอบจำนวนผู้เล่นที่เปลี่ยนตัวสูงสุด (5 คน)
        const playerSubCount = getPlayerSubCount(isTeamA);
        if (playerSubCount >= 5 && !windowToEdit) {
            alert(`${isTeamA ? matchState.teamA.name : matchState.teamB.name} has already used all 5 player substitutions`);
            return;
        }
      
        
        // ตรวจสอบจำนวนช่วงเปลี่ยนตัวสูงสุด (3 ช่วง สำหรับการเปลี่ยนตัวปกติ ไม่รวมพักครึ่ง)
        if (!isHalfTime && !windowToEdit && !matchState.activeSubWindow[isTeamA ? 'teamA' : 'teamB']) {
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            if (team.subWindows >= 3) {
                alert(`${team.name} has used all 3 substitution windows`);
                return;
            }
        }
        
        // ส่วนที่เหลือของฟังก์ชันยังคงเหมือนเดิม
        currentSubContext = { isTeamA, isHalfTime, windowToEdit, additionalSubs: [] };
        const teamName = isTeamA ? matchState.teamA.name : matchState.teamB.name;
        const subType = isHalfTime ? "Half-time Substitution" : "Substitution";
        subModalTitle.textContent = `${windowToEdit ? 'Edit ' : ''}${subType} - ${teamName}`;
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
        let subs;
        // ตรวจสอบว่ากำลังแก้ไขการเปลี่ยนตัวช่วงพักครึ่งหรือช่วงปกติ
        if (isHalfTime || (windowToEdit && document.querySelector(`.event-card[data-id="${windowToEdit}"][data-half-time="true"]`))) {
            subs = (isTeamA ? matchState.teamA.halfTimeSubstitutions : matchState.teamB.halfTimeSubstitutions)
                .filter(sub => sub.windowId === windowToEdit || sub.id === windowToEdit);
        } else {
            subs = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                .filter(sub => sub.windowId === windowToEdit || sub.id === windowToEdit);
        }
        
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
            deleteBtn.textContent = 'Delete This Substitution Window';
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
                <span>Additional Player</span>
                <button type="button" class="remove-sub-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="input-group">
                <div class="input-label">Player In Number</div>
                <input type="number" class="input-field player-in" placeholder="Player In Number" value="${playerIn}">
            </div>
            <div class="input-group">
                <div class="input-label">Player Out Number</div>
                <input type="number" class="input-field player-out" placeholder="Player Out Number" value="${playerOut}">
            </div>
        `;
        
        subFieldsContainer.querySelector('.remove-sub-btn').addEventListener('click', function() {
            subFieldsContainer.remove();
        });
        
        return subFieldsContainer;
    }

    function addAnotherSubstitution() {
        // Check max player substitutions (5 players) including the new ones being added
        const { isTeamA } = currentSubContext;
        const currentCount = getPlayerSubCount(isTeamA);
        const additionalFields = document.querySelectorAll('#additionalSubsContainer .substitution-fields').length;
        
        // Count main substitution + additional ones already showing + this new one
        if (currentCount + additionalFields + 1 >= 5) {
            alert(`${isTeamA ? matchState.teamA.name : matchState.teamB.name} can only substitute a maximum of 5 players`);
            return;
        }
        
        const newSubFields = createSubstitutionFields();
        document.getElementById('additionalSubsContainer').appendChild(newSubFields);
    }

    function closeSubstitutionDialog() {
        subModal.style.display = 'none';
        if (!currentSubContext.windowToEdit && !currentSubContext.isHalfTime) {
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
            alert('Please enter both player in and player out numbers');
            return;
        }
        
        const { isTeamA, isHalfTime, windowToEdit } = currentSubContext;
        const team = isTeamA ? 'teamA' : 'teamB';
        
        // Check max player substitutions (5 players)
        const currentCount = getPlayerSubCount(isTeamA);
        const additionalFields = document.querySelectorAll('#additionalSubsContainer .substitution-fields').length;
        
        // If editing, don't count the existing substitutions
        let editingCount = 0;
        if (windowToEdit) {
            if (isHalfTime || (document.querySelector(`.event-card[data-id="${windowToEdit}"][data-half-time="true"]`))) {
                editingCount = matchState[team].halfTimeSubstitutions.filter(
                    sub => sub.windowId === windowToEdit || sub.id === windowToEdit
                ).length;
            } else {
                editingCount = matchState[team].substitutions.filter(
                    sub => sub.windowId === windowToEdit || sub.id === windowToEdit
                ).length;
            }
        }
        
        // Check if adding these would exceed the limit
        if (currentCount - editingCount + additionalFields + 1 > 5) {
            alert(`${isTeamA ? matchState.teamA.name : matchState.teamB.name} can only substitute a maximum of 5 players`);
            return;
        }
        
        // Determine time stamp
        let currentTimeStamp;
        if (windowToEdit) {
            if (isHalfTime || (document.querySelector(`.event-card[data-id="${windowToEdit}"][data-half-time="true"]`))) {
                // Get timestamp from existing half-time sub
                currentTimeStamp = (isTeamA ? matchState.teamA.halfTimeSubstitutions : matchState.teamB.halfTimeSubstitutions)
                    .find(sub => sub.windowId === windowToEdit || sub.id === windowToEdit)?.timeStamp || "Half-time";
            } else {
                // Get timestamp from existing regular sub
                currentTimeStamp = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                    .find(sub => sub.windowId === windowToEdit || sub.id === windowToEdit)?.timeStamp || matchState.elapsedTime;
            }
        } else {
            // New substitution
            currentTimeStamp = isHalfTime ? "Half-time" : 
                (matchState.isInjuryTimeActive ? 
                    `${matchState.elapsedTime} ${matchState.currentInjuryTimeDisplay}` : 
                    matchState.elapsedTime);
        }
        
        const windowId = windowToEdit || Date.now().toString();
        const substitutions = [];
        
        substitutions.push({
            id: Date.now().toString() + '-1',
            playerInNumber: playerIn,
            playerOutNumber: playerOut,
            timeStamp: currentTimeStamp,
            windowId: windowId,
            isHalfTime: isHalfTime
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
                        windowId: windowId,
                        isHalfTime: isHalfTime
                    });
                }
            });
        }
        
        if (windowToEdit) {
            if (isHalfTime || (document.querySelector(`.event-card[data-id="${windowToEdit}"][data-half-time="true"]`))) {
                // Editing half-time substitutions
                const newSubsList = (isTeamA ? matchState.teamA.halfTimeSubstitutions : matchState.teamB.halfTimeSubstitutions)
                    .filter(sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit);
                if (isTeamA) matchState.teamA.halfTimeSubstitutions = [...newSubsList, ...substitutions];
                else matchState.teamB.halfTimeSubstitutions = [...newSubsList, ...substitutions];
            } else {
                // Editing regular substitutions
                const newSubsList = (isTeamA ? matchState.teamA.substitutions : matchState.teamB.substitutions)
                    .filter(sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit);
                if (isTeamA) matchState.teamA.substitutions = [...newSubsList, ...substitutions];
                else matchState.teamB.substitutions = [...newSubsList, ...substitutions];
            }
        } else {
            // Adding new substitutions
            if (isHalfTime) {
                // Add to half-time substitutions and mark that half-time sub has been used
                if (isTeamA) {
                    matchState.teamA.halfTimeSubstitutions = [...matchState.teamA.halfTimeSubstitutions, ...substitutions];
                    matchState.teamA.hasUsedHalfTimeSub = true; // เพิ่มบรรทัดนี้
                }
                else {
                    matchState.teamB.halfTimeSubstitutions = [...matchState.teamB.halfTimeSubstitutions, ...substitutions];
                    matchState.teamB.hasUsedHalfTimeSub = true; // เพิ่มบรรทัดนี้
                }
            } else {
                // Add to regular substitutions and increment window count
                matchState[team].subWindows++;
                if (isTeamA) matchState.teamA.substitutions = [...matchState.teamA.substitutions, ...substitutions];
                else matchState.teamB.substitutions = [...matchState.teamB.substitutions, ...substitutions];
                matchState.activeSubWindow[team] = false;
            }
        }
        
        renderTeamSubstitutions();
        updateSubstitutionButtonsState();
        saveMatchData();
        subModal.style.display = 'none';
    }

    function deleteSubstitutionWindow() {
        const { isTeamA, isHalfTime, windowToEdit } = currentSubContext;
        if (!windowToEdit) return;
        
        if (isHalfTime || (document.querySelector(`.event-card[data-id="${windowToEdit}"][data-half-time="true"]`))) {
            // Deleting a half-time sub window
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            // ตรวจสอบว่าการลบนี้เป็นการลบการเปลี่ยนตัวช่วงพักครึ่งทั้งหมดหรือไม่
            const remainingHalfTimeSubs = team.halfTimeSubstitutions.filter(
                sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit
            );
            
            team.halfTimeSubstitutions = remainingHalfTimeSubs;
            
            // ถ้าไม่มีการเปลี่ยนตัวช่วงพักครึ่งเหลืออยู่ ให้รีเซ็ตตัวแปร hasUsedHalfTimeSub
            if (remainingHalfTimeSubs.length === 0) {
                if (isTeamA) {
                    matchState.teamA.hasUsedHalfTimeSub = false;
                } else {
                    matchState.teamB.hasUsedHalfTimeSub = false;
                }
            }
        } else {
            // Deleting a regular sub window
            const team = isTeamA ? matchState.teamA : matchState.teamB;
            const subsInWindow = team.substitutions.filter(
                sub => sub.windowId === windowToEdit || sub.id === windowToEdit
            );
            team.substitutions = team.substitutions.filter(
                sub => sub.windowId !== windowToEdit && sub.id !== windowToEdit
            );
            if (subsInWindow.length > 0) team.subWindows = Math.max(0, team.subWindows - 1);
        }
        
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
            isFirstHalf: true,
            isHalfTime: false,
            startTime: null,
            elapsedTime: "00:00",
            currentHalfTime: 45 * 60, // 45 minutes in seconds
            teamA: {
                name: "Team A",
                color: "#1976D2",
                cards: [],
                substitutions: [],
                halfTimeSubstitutions: [],
                hasUsedHalfTimeSub: false, // เพิ่มตัวแปรนี้
                subWindows: 0,
                playerCount: 0,
                goals: 0
            },
            teamB: {
                name: "Team B",
                color: "#D32F2F",
                cards: [],
                substitutions: [],
                halfTimeSubstitutions: [],
                hasUsedHalfTimeSub: false, // เพิ่มตัวแปรนี้
                subWindows: 0,
                playerCount: 0,
                goals: 0
            },
            isInjuryTimeActive: false,
            isAddingInjuryTime: false,
            remainingInjuryTime: 0,
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
    }

    function endMatch() {
        if (!matchState.isMatchStarted && !matchState.isAddingInjuryTime) {
            alert('There is no match to end');
            return;
        }
        clearInterval(matchTimer);
        clearInterval(injuryTimer);
        if (matchState.isInjuryTimeActive) toggleInjuryTime();
        
        // Lock at 90:00 if we're in the second half (or 4:00 in your test case)
        if (!matchState.isFirstHalf) {
            matchState.elapsedTime = "90:00"; // Change to 90:00 in real game 45min
        }
        
        matchState.isMatchStarted = false;
        matchState.isAddingInjuryTime = false;
        
        // Hide Injury Time buttons when the match ends
        injuryBtn.style.display = 'none';
        injuryFab.style.display = 'none';
        
        updateUI();
        saveMatchData();
        
        // After second half, show the half-time summary first, then the full match summary
        if (!matchState.isFirstHalf) {
            showHalfTimeSummary(); // Show second half summary
            // The full match summary will be shown after closing the half summary
        } else {
            showMatchSummary(); // If ending from first half directly
        }
    }
    function saveCurrentMatchAsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("Match Progress Report", 105, 10, { align: "center" });
        
        const teamA = matchState.teamA;
        const teamB = matchState.teamB;
        
        let yPos = 20;
        
        // Match Information
        doc.setFontSize(14);
        doc.text("Match Information", 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Current Time: ${matchState.elapsedTime}`, 10, yPos);
        yPos += 7;
        
        if (matchState.isInjuryTimeActive) {
            doc.text(`Current Injury Time: ${matchState.currentInjuryTimeDisplay}`, 10, yPos);
            yPos += 7;
        }
        
        if (matchState.totalInjurySeconds > 0) {
            doc.text(`Total Injury Time: ${getTotalInjuryTimeDisplay()}`, 10, yPos);
            yPos += 7;
        }
        
        doc.text(`Match Status: ${getMatchStatusText()}`, 10, yPos);
        yPos += 10;
        
        // Score
        doc.text(`Score: ${teamA.name} ${teamA.goals} - ${teamB.goals} ${teamB.name}`, 10, yPos);
        yPos += 10;
        
        // Team A Information
        doc.setFontSize(14);
        doc.text(teamA.name, 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        
        // Team A - Yellow Cards
        const teamAYellowCards = teamA.cards.filter(card => card.isYellow);
        if (teamAYellowCards.length > 0) {
            doc.text(`Yellow Cards (${teamAYellowCards.length}):`, 10, yPos);
            yPos += 7;
            teamAYellowCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Yellow Cards: None", 10, yPos);
            yPos += 7;
        }
        
        // Team A - Red Cards
        const teamARedCards = teamA.cards.filter(card => !card.isYellow && !card.isGoal);
        if (teamARedCards.length > 0) {
            doc.text(`Red Cards (${teamARedCards.length}):`, 10, yPos);
            yPos += 7;
            teamARedCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Red Cards: None", 10, yPos);
            yPos += 7;
        }
        
        // Team A - Goals
        const teamAGoalCards = teamA.cards.filter(card => card.isGoal);
        if (teamAGoalCards.length > 0) {
            doc.text(`Goals (${teamAGoalCards.length}):`, 10, yPos);
            yPos += 7;
            teamAGoalCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Goals: None", 10, yPos);
            yPos += 7;
        }
        
        // Team A - Substitutions
        const teamASubWindows = groupSubstitutionsByWindow([...teamA.substitutions, ...teamA.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))]);
        if (teamASubWindows.length > 0) {
            doc.text(`Substitutions (${teamASubWindows.length} windows):`, 10, yPos);
            yPos += 7;
            
            teamASubWindows.forEach((window, index) => {
                const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
                doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
                yPos += 7;
                
                window.substitutions.forEach(sub => {
                    doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                    yPos += 7;
                    checkPageBreak();
                });
            });
        } else {
            doc.text("Substitutions: None", 10, yPos);
            yPos += 7;
        }
        
        yPos += 10;
        checkPageBreak();
        
        // Team B Information
        doc.setFontSize(14);
        doc.text(teamB.name, 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        
        // Team B - Yellow Cards
        const teamBYellowCards = teamB.cards.filter(card => card.isYellow);
        if (teamBYellowCards.length > 0) {
            doc.text(`Yellow Cards (${teamBYellowCards.length}):`, 10, yPos);
            yPos += 7;
            teamBYellowCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Yellow Cards: None", 10, yPos);
            yPos += 7;
        }
        
        // Team B - Red Cards
        const teamBRedCards = teamB.cards.filter(card => !card.isYellow && !card.isGoal);
        if (teamBRedCards.length > 0) {
            doc.text(`Red Cards (${teamBRedCards.length}):`, 10, yPos);
            yPos += 7;
            teamBRedCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Red Cards: None", 10, yPos);
            yPos += 7;
        }
        
        // Team B - Goals
        const teamBGoalCards = teamB.cards.filter(card => card.isGoal);
        if (teamBGoalCards.length > 0) {
            doc.text(`Goals (${teamBGoalCards.length}):`, 10, yPos);
            yPos += 7;
            teamBGoalCards.forEach(card => {
                doc.text(`- Player #${card.playerNumber} (${card.timeStamp})`, 15, yPos);
                yPos += 7;
                checkPageBreak();
            });
        } else {
            doc.text("Goals: None", 10, yPos);
            yPos += 7;
        }
        
        // Team B - Substitutions
        const teamBSubWindows = groupSubstitutionsByWindow([...teamB.substitutions, ...teamB.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))]);
        if (teamBSubWindows.length > 0) {
            doc.text(`Substitutions (${teamBSubWindows.length} windows):`, 10, yPos);
            yPos += 7;
            
            teamBSubWindows.forEach((window, index) => {
                const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
                doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
                yPos += 7;
                
                window.substitutions.forEach(sub => {
                    doc.text(`  #${sub.playerInNumber} In, #${sub.playerOutNumber} Out`, 20, yPos);
                    yPos += 7;
                    checkPageBreak();
                });
            });
        } else {
            doc.text("Substitutions: None", 10, yPos);
            yPos += 7;
        }
        
        // Add the date and time of the PDF creation at the bottom
        const now = new Date();
        const dateTimeString = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        doc.setFontSize(10);
        doc.text(`Generated on: ${dateTimeString}`, 10, 280);
        
        // Function to check if we need a new page
        function checkPageBreak() {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        }
        
        // Save the PDF with a meaningful name
        const fileName = `Match_Progress_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.pdf`;
        doc.save(fileName);
    }
    
    // Helper function to get a text description of the current match status
    function getMatchStatusText() {
        if (!matchState.isMatchStarted) {
            if (matchState.isHalfTime) {
                return "Half-time Break";//45min
            } else if (!matchState.isFirstHalf && matchState.elapsedTime === "90:00") {
                return "Match Ended";
            } else {
                return "Not Started";
            }
        } else if (matchState.isAddingInjuryTime) {
            return matchState.isFirstHalf ? "First Half Injury Time" : "Second Half Injury Time";
        } else if (matchState.isInjuryTimeActive) {
            return matchState.isFirstHalf ? "First Half Injury Time (Active)" : "Second Half Injury Time (Active)";
        } else {
            return matchState.isFirstHalf ? "First Half" : "Second Half";
        }
    }

    function getMatchStatusText() {
        if (!matchState.isMatchStarted) {
            if (matchState.isHalfTime) {
                return "Half-time Break";
            } else if (!matchState.isFirstHalf && matchState.elapsedTime === "90:00") {
                return "Match Ended";
            } else {
                return "Not Started";
            }
        } else if (matchState.isAddingInjuryTime) {
            return matchState.isFirstHalf ? "First Half Injury Time" : "Second Half Injury Time";
        } else if (matchState.isInjuryTimeActive) {
            return matchState.isFirstHalf ? "First Half Injury Time (Active)" : "Second Half Injury Time (Active)";
        } else {
            return matchState.isFirstHalf ? "First Half" : "Second Half";
        }
    }

    function setupSavePdfButton() {
        const savePdfBtn = document.getElementById('savePdfBtn');
        if (savePdfBtn) {
            savePdfBtn.addEventListener('click', saveCurrentMatchAsPdf);
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
        
        // Include both regular substitutions and half-time substitutions
        const teamAAllSubs = [...teamA.substitutions, ...teamA.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))];
        const teamBAllSubs = [...teamB.substitutions, ...teamB.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))];
        
        const teamASubWindows = groupSubstitutionsByWindow(teamAAllSubs);
        const teamBSubWindows = groupSubstitutionsByWindow(teamBAllSubs);
        
        const totalMatchTime = matchState.elapsedTime;
        const totalInjuryTime = getTotalInjuryTimeDisplay();
        
        const teamAPlayerSubCount = getPlayerSubCount(true);
        const teamBPlayerSubCount = getPlayerSubCount(false);

        let summaryHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">Match Duration</h3>
                <p>Match Time: ${totalMatchTime}</p>
                <p>Total Injury Time: ${totalInjuryTime}</p>
            </div>
            <div style="margin-bottom: 16px;">
                <h3 style="margin-bottom: 8px;">${teamA.name}</h3>
                <p>Goals: ${teamAGoals}</p>
                <p>Yellow Cards: ${teamAYellowCards}</p>
                <p>Red Cards: ${teamARedCards}</p>
                <p>Substitution Windows: ${teamA.subWindows}/3 (${teamAPlayerSubCount}/5 Players)</p>
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
                            <p style="margin-left: 16px;">- ${window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`} (${window.timeStamp}):</p>
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
                <p>Substitution Windows: ${teamB.subWindows}/3 (${teamBPlayerSubCount}/5 Players)</p>
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
                            <p style="margin-left: 16px;">- ${window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`} (${window.timeStamp}):</p>
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
        
        // Include both regular substitutions and half-time substitutions
        const teamAAllSubs = [...teamA.substitutions, ...teamA.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))];
        const teamBAllSubs = [...teamB.substitutions, ...teamB.halfTimeSubstitutions.map(sub => ({...sub, isHalfTime: true}))];
        
        const teamASubWindows = groupSubstitutionsByWindow(teamAAllSubs);
        const teamBSubWindows = groupSubstitutionsByWindow(teamBAllSubs);
        
        const teamAPlayerSubCount = getPlayerSubCount(true);
        const teamBPlayerSubCount = getPlayerSubCount(false);
        
        let yPos = 20;
        
        doc.setFontSize(14);
        doc.text("Match Duration", 10, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.text(`Match Time: ${matchState.elapsedTime}`, 10, yPos);
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
        doc.text(`Substitution Windows: ${teamA.subWindows}/3 (${teamAPlayerSubCount}/5 Players)`, 10, yPos);
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
                const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
                doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
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
        doc.text(`Substitution Windows: ${teamB.subWindows}/3 (${teamBPlayerSubCount}/5 Players)`, 10, yPos);
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
                const windowTitle = window.isHalfTime ? 'Half-time Substitution' : `Window ${index + 1}`;
                doc.text(`- ${windowTitle} (${window.timeStamp}):`, 15, yPos);
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

    // Global functions for event handling
    window.editCard = function(cardId, isTeamA) {
        const card = isTeamA 
            ? matchState.teamA.cards.find(c => c.id === cardId)
            : matchState.teamB.cards.find(c => c.id === cardId);
        if (card) showCardDialog(isTeamA, card.isYellow, card.isGoal, card);
    };

    window.editSubstitutionWindow = function(windowId, isTeamA, isHalfTime) {
        showSubstitutionDialog(isTeamA, isHalfTime, windowId);
    };

    init();
});
