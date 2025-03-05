// ประกาศตัวแปร global ที่ใช้ร่วมกัน
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
        teamB: false,
    },
    isSecondHalf: false, // เพิ่มตัวแปรเพื่อตรวจสอบครึ่งแรกหรือครึ่งหลัง
};

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

// Initialize the app
init();
