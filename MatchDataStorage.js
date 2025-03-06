/**
 * MatchDataStorage.js
 * 
 * This module handles all the data storage and manipulation for the football match tracker.
 * It provides functions to save, load, and reset match data, as well as operations
 * for cards, substitutions, and other match events.
 */

class MatchDataStorage {
    /**
     * Initialize the match data storage with default valuess
     */
    constructor() {
        this.matchState = {
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
        
        // Set up auto-save timer
        this.autoSaveTimer = setInterval(() => this.saveMatchData(), 10000);
    }

    /**
     * Load saved match data from localStorage
     * @returns {boolean} True if data was loaded successfully
     */
    loadSavedMatchData() {
        const savedData = localStorage.getItem('matchData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.matchState = {
                ...this.matchState,
                ...parsedData,
                startTime: parsedData.startTime ? new Date(parsedData.startTime) : null,
                currentInjuryStartTime: parsedData.currentInjuryStartTime ? new Date(parsedData.currentInjuryStartTime) : null
            };
            
            // Calculate substitution windows if not defined
            if (this.matchState.teamA.subWindows === undefined) {
                this.matchState.teamA.subWindows = this.calculateUsedSubWindows(this.matchState.teamA.substitutions);
            }
            
            if (this.matchState.teamB.subWindows === undefined) {
                this.matchState.teamB.subWindows = this.calculateUsedSubWindows(this.matchState.teamB.substitutions);
            }
            
            // Initialize active substitution windows if not defined
            if (!this.matchState.activeSubWindow) {
                this.matchState.activeSubWindow = { teamA: false, teamB: false };
            }
            
            return true;
        }
        return false;
    }

    /**
     * Save current match data to localStorage
     */
    saveMatchData() {
        localStorage.setItem('matchData', JSON.stringify({
            ...this.matchState,
            startTime: this.matchState.startTime ? this.matchState.startTime.toISOString() : null,
            currentInjuryStartTime: this.matchState.currentInjuryStartTime ? this.matchState.currentInjuryStartTime.toISOString() : null
        }));
    }

    /**
     * Clear all match data from localStorage
     */
    clearMatchData() {
        localStorage.removeItem('matchData');
    }

    /**
     * Reset match state to default values
     */
    resetMatchState() {
        this.matchState = {
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
        this.clearMatchData();
        return this.matchState;
    }

    /**
     * Calculate the number of substitution windows used
     * @param {Array} substitutions - Array of substitution events
     * @returns {number} Number of substitution windows used
     */
    calculateUsedSubWindows(substitutions) {
        if (!substitutions || substitutions.length === 0) return 0;
        const windows = new Set();
        substitutions.forEach(sub => {
            if (sub.windowId) windows.add(sub.windowId);
            else windows.add(sub.id);
        });
        return windows.size;
    }

    /**
     * Group substitutions by their window IDs
     * @param {Array} subs - Array of substitution events
     * @returns {Array} Array of substitution windows
     */
    groupSubstitutionsByWindow(subs) {
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

    /**
     * Start the match by setting the start time
     */
    startMatch() {
        this.matchState.isMatchStarted = true;
        this.matchState.startTime = new Date();
        this.saveMatchData();
        return this.matchState;
    }

    /**
     * Update match time based on elapsed time since start
     */
    updateMatchTime() {
        if (!this.matchState.startTime) return this.matchState.elapsedTime;
        
        const now = new Date();
        const difference = now - this.matchState.startTime;
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        this.matchState.elapsedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        return this.matchState.elapsedTime;
    }

    /**
     * Toggle injury time on/off
     * @returns {Object} Updated injury time state
     */
    toggleInjuryTime() {
        if (!this.matchState.isMatchStarted) {
            return { success: false, message: 'โปรดเริ่มการแข่งขันก่อน' };
        }
        
        this.matchState.isInjuryTimeActive = !this.matchState.isInjuryTimeActive;
        
        if (this.matchState.isInjuryTimeActive) {
            // Start injury time
            this.matchState.currentInjuryStartTime = new Date();
        } else {
            // Stop injury time and record the period
            if (this.matchState.currentInjuryStartTime) {
                const now = new Date();
                const injuryDuration = now - this.matchState.currentInjuryStartTime;
                const injurySeconds = Math.floor(injuryDuration / 1000);
                this.matchState.totalInjurySeconds += injurySeconds;
                
                const mins = String(Math.floor(injurySeconds / 60)).padStart(2, '0');
                const secs = String(injurySeconds % 60).padStart(2, '0');
                this.matchState.injuryTimePeriods.push(`+${mins}:${secs}`);
                
                this.matchState.currentInjuryStartTime = null;
                this.matchState.currentInjuryTimeDisplay = '+00:00';
                
                this.saveMatchData();
                return { 
                    success: true, 
                    stopped: true, 
                    injurySeconds,
                    totalInjuryTime: this.getTotalInjuryTimeDisplay()
                };
            }
        }
        
        this.saveMatchData();
        return { success: true, isActive: this.matchState.isInjuryTimeActive };
    }

    /**
     * Update injury time display
     * @returns {string} Current injury time display
     */
    updateInjuryTime() {
        if (!this.matchState.currentInjuryStartTime) return this.matchState.currentInjuryTimeDisplay;
        
        const now = new Date();
        const difference = now - this.matchState.currentInjuryStartTime;
        const minutes = Math.floor(difference / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);
        this.matchState.currentInjuryTimeDisplay = `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        return this.matchState.currentInjuryTimeDisplay;
    }

    /**
     * Get formatted total injury time
     * @returns {string} Formatted total injury time display
     */
    getTotalInjuryTimeDisplay() {
        const minutes = Math.floor(this.matchState.totalInjurySeconds / 60);
        const seconds = this.matchState.totalInjurySeconds % 60;
        return `+${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Update team settings
     * @param {string} teamAName - Team A name
     * @param {string} teamAColor - Team A color
     * @param {string} teamBName - Team B name
     * @param {string} teamBColor - Team B color
     */
    updateTeamSettings(teamAName, teamAColor, teamBName, teamBColor) {
        this.matchState.teamA.name = teamAName || 'ทีม A';
        this.matchState.teamA.color = teamAColor || this.matchState.teamA.color;
        this.matchState.teamB.name = teamBName || 'ทีม B';
        this.matchState.teamB.color = teamBColor || this.matchState.teamB.color;
        this.saveMatchData();
        
        return this.matchState;
    }

    /**
     * Add or update a card event
     * @param {boolean} isTeamA - Whether the card is for Team A
     * @param {boolean} isYellow - Whether it's a yellow card (true) or red card (false)
     * @param {string} playerNumber - Player number
     * @param {string} cardId - Card ID (optional, for editing)
     * @returns {Object} The created or updated card
     */
    saveCard(isTeamA, isYellow, playerNumber, cardId = null) {
        const team = isTeamA ? 'teamA' : 'teamB';
        const currentTimeStamp = this.matchState.isInjuryTimeActive ? 
            `${this.matchState.elapsedTime} ${this.matchState.currentInjuryTimeDisplay}` : 
            this.matchState.elapsedTime;
            
        let cardToReturn;
            
        if (cardId) {
            // Edit existing card
            const cardToEdit = this.matchState[team].cards.find(card => card.id === cardId);
            if (cardToEdit) {
                cardToEdit.playerNumber = playerNumber;
                cardToEdit.isYellow = isYellow;
                cardToReturn = cardToEdit;
            }
        } else {
            // Add new card
            const newCard = {
                id: Date.now().toString(),
                isYellow,
                timeStamp: currentTimeStamp,
                playerNumber
            };
            this.matchState[team].cards.push(newCard);
            cardToReturn = newCard;
        }
        
        this.saveMatchData();
        return cardToReturn;
    }

    /**
     * Delete a card event
     * @param {boolean} isTeamA - Whether the card is from Team A
     * @param {string} cardId - Card ID to delete
     * @returns {boolean} Success status
     */
    deleteCard(isTeamA, cardId) {
        const team = isTeamA ? 'teamA' : 'teamB';
        const initialLength = this.matchState[team].cards.length;
        this.matchState[team].cards = this.matchState[team].cards.filter(card => card.id !== cardId);
        
        const success = initialLength !== this.matchState[team].cards.length;
        if (success) {
            this.saveMatchData();
        }
        
        return success;
    }

    /**
     * Add or update a substitution window
     * @param {boolean} isTeamA - Whether the substitution is for Team A
     * @param {Array} players - Array of player substitutions [{playerIn, playerOut}, ...]
     * @param {string} windowId - Window ID (optional, for editing)
     * @returns {Object} The created or updated substitution window
     */
    saveSubstitutionWindow(isTeamA, players, windowId = null) {
        const team = isTeamA ? 'teamA' : 'teamB';
        const currentTimeStamp = this.matchState.isInjuryTimeActive ? 
            `${this.matchState.elapsedTime} ${this.matchState.currentInjuryTimeDisplay}` : 
            this.matchState.elapsedTime;
            
        const newWindowId = windowId || Date.now().toString();
        const substitutions = [];
        
        // Create substitution objects
        players.forEach((player, index) => {
            if (player.playerIn && player.playerOut) {
                substitutions.push({
                    id: Date.now().toString() + `-${index + 1}`,
                    playerInNumber: player.playerIn,
                    playerOutNumber: player.playerOut,
                    timeStamp: currentTimeStamp,
                    windowId: newWindowId
                });
            }
        });
        
        if (windowId) {
            // Editing existing window
            const newSubsList = this.matchState[team].substitutions.filter(
                sub => sub.windowId !== windowId && sub.id !== windowId
            );
            this.matchState[team].substitutions = [...newSubsList, ...substitutions];
        } else {
            // Creating new window
            this.matchState[team].subWindows++;
            this.matchState[team].substitutions = [...this.matchState[team].substitutions, ...substitutions];
            this.matchState.activeSubWindow[team] = false;
        }
        
        this.saveMatchData();
        return { windowId: newWindowId, substitutions };
    }

    /**
     * Delete a substitution window
     * @param {boolean} isTeamA - Whether the substitution is from Team A
     * @param {string} windowId - Window ID to delete
     * @returns {boolean} Success status
     */
    deleteSubstitutionWindow(isTeamA, windowId) {
        const team = isTeamA ? 'teamA' : 'teamB';
        
        const subsInWindow = this.matchState[team].substitutions.filter(
            sub => sub.windowId === windowId || sub.id === windowId
        );
        
        const initialLength = this.matchState[team].substitutions.length;
        this.matchState[team].substitutions = this.matchState[team].substitutions.filter(
            sub => sub.windowId !== windowId && sub.id !== windowId
        );
        
        const success = initialLength !== this.matchState[team].substitutions.length;
        if (success && subsInWindow.length > 0) {
            this.matchState[team].subWindows = Math.max(0, this.matchState[team].subWindows - 1);
            this.saveMatchData();
        }
        
        return success;
    }

    /**
     * Check if a team has reached maximum substitution windows
     * @param {boolean} isTeamA - Whether to check Team A
     * @returns {boolean} True if maximum reached
     */
    hasReachedMaxSubWindows(isTeamA) {
        const team = isTeamA ? 'teamA' : 'teamB';
        return this.matchState[team].subWindows >= 3 && !this.matchState.activeSubWindow[team];
    }

    /**
     * Set active substitution window status
     * @param {boolean} isTeamA - Whether to set for Team A
     * @param {boolean} isActive - Whether window is active
     */
    setActiveSubWindow(isTeamA, isActive) {
        const team = isTeamA ? 'teamA' : 'teamB';
        this.matchState.activeSubWindow[team] = isActive;
        this.saveMatchData();
    }

    /**
     * Generate export data for PDF report
     * @returns {Object} Export data for PDF generation
     */
    getExportData() {
        return {
            date: new Date().toLocaleDateString('th-TH'),
            matchTime: this.matchState.elapsedTime,
            totalInjuryTime: this.getTotalInjuryTimeDisplay(),
            teamA: {
                name: this.matchState.teamA.name,
                color: this.matchState.teamA.color,
                cards: this.matchState.teamA.cards,
                substitutions: this.groupSubstitutionsByWindow(this.matchState.teamA.substitutions)
            },
            teamB: {
                name: this.matchState.teamB.name,
                color: this.matchState.teamB.color,
                cards: this.matchState.teamB.cards,
                substitutions: this.groupSubstitutionsByWindow(this.matchState.teamB.substitutions)
            },
            injuryTimePeriods: this.matchState.injuryTimePeriods
        };
    }

    /**
     * End the match and mark as not started
     */
    endMatch() {
        this.matchState.isMatchStarted = false;
        this.saveMatchData();
        return this.matchState;
    }
}

// Export for ES modules
export default MatchDataStorage;
