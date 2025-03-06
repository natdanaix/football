// Import the MatchDataStorage class
import MatchDataStorage from './MatchDataStorage.js';

document.addEventListener('DOMContentLoaded', function() {
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

    function init() {
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
