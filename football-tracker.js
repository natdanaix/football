// Function to reset all data
function resetAllData() {
    // Reset match state
    matchState = {
        isMatchStarted: false,
        isMatchEnded: false,
        startTime: null,
        endTime: null,
        elapsedTime: "00:00",
        teamA: {
            name: "ทีม A",
            color: "#1976D2",
            cards: [],
            substitutions: [],
            subWindows: 0,
            score: 0
        },
        teamB: {
            name: "ทีม B",
            color: "#D32F2F",
            cards: [],
            substitutions: [],
            subWindows: 0,
            score: 0
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

// Function to generate match summary PDF
function generateMatchSummaryPDF() {
    const doc = new jsPDF();

    // Add match title
    doc.setFontSize(18);
    doc.text("สรุปการแข่งขัน", 10, 10);

    // Add team names and scores
    doc.setFontSize(14);
    doc.text(`${matchState.teamA.name}: ${matchState.teamA.score}`, 10, 30);
    doc.text(`${matchState.teamB.name}: ${matchState.teamB.score}`, 10, 40);

    // Add match time
    doc.text(`เวลาแข่งขัน: ${matchState.finalMatchTime}`, 10, 50);

    // Add injury time
    if (matchState.totalInjurySeconds > 0) {
        doc.text(`เวลาทดเจ็บ: ${getTotalInjuryTimeDisplay()}`, 10, 60);
    }

    // Add cards and substitutions
    doc.text("ใบเตือนและการเปลี่ยนตัว:", 10, 70);
    let yOffset = 80;

    // Team A cards
    if (matchState.teamA.cards.length > 0) {
        doc.text(`${matchState.teamA.name} ใบเตือน:`, 10, yOffset);
        yOffset += 10;
        matchState.teamA.cards.forEach(card => {
            doc.text(`- #${card.playerNumber}: ${card.isYellow ? 'ใบเหลือง' : 'ใบแดง'} (${card.timeStamp})`, 15, yOffset);
            yOffset += 10;
        });
    }

    // Team B cards
    if (matchState.teamB.cards.length > 0) {
        doc.text(`${matchState.teamB.name} ใบเตือน:`, 10, yOffset);
        yOffset += 10;
        matchState.teamB.cards.forEach(card => {
            doc.text(`- #${card.playerNumber}: ${card.isYellow ? 'ใบเหลือง' : 'ใบแดง'} (${card.timeStamp})`, 15, yOffset);
            yOffset += 10;
        });
    }

    // Team A substitutions
    if (matchState.teamA.substitutions.length > 0) {
        doc.text(`${matchState.teamA.name} การเปลี่ยนตัว:`, 10, yOffset);
        yOffset += 10;
        const teamASubWindows = groupSubstitutionsByWindow(matchState.teamA.substitutions);
        teamASubWindows.forEach((window, index) => {
            doc.text(`- ช่วงที่ ${index + 1} (${window.timeStamp}):`, 15, yOffset);
            yOffset += 10;
            window.substitutions.forEach(sub => {
                doc.text(`  #${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก`, 20, yOffset);
                yOffset += 10;
            });
        });
    }

    // Team B substitutions
    if (matchState.teamB.substitutions.length > 0) {
        doc.text(`${matchState.teamB.name} การเปลี่ยนตัว:`, 10, yOffset);
        yOffset += 10;
        const teamBSubWindows = groupSubstitutionsByWindow(matchState.teamB.substitutions);
        teamBSubWindows.forEach((window, index) => {
            doc.text(`- ช่วงที่ ${index + 1} (${window.timeStamp}):`, 15, yOffset);
            yOffset += 10;
            window.substitutions.forEach(sub => {
                doc.text(`  #${sub.playerInNumber} เข้า, #${sub.playerOutNumber} ออก`, 20, yOffset);
                yOffset += 10;
            });
        });
    }

    // Save the PDF
    doc.save("match_summary.pdf");
}

// Function to edit a card
function editCard(cardId, isTeamA) {
    const team = isTeamA ? matchState.teamA : matchState.teamB;
    const cardToEdit = team.cards.find(card => card.id === cardId);
    if (cardToEdit) {
        showCardDialog(isTeamA, cardToEdit.isYellow, cardToEdit);
    }
}

// Function to edit a substitution window
function editSubstitutionWindow(windowId, isTeamA) {
    showSubstitutionDialog(isTeamA, windowId);
}

// Update the endMatch function to save scores
function endMatch() {
    if (!matchState.isMatchStarted) {
        alert('โปรดเริ่มการแข่งขันก่อน');
        return;
    }

    // Stop all timers
    clearInterval(matchTimer);
    clearInterval(injuryTimer);

    // Set match as ended
    matchState.isMatchEnded = true;
    matchState.endTime = new Date();

    // Calculate total match time
    const totalMatchSeconds = Math.floor((matchState.endTime - matchState.startTime) / 1000);
    const totalMatchMinutes = Math.floor(totalMatchSeconds / 60);
    const totalMatchSecondsRemainder = totalMatchSeconds % 60;

    // Final match time display
    matchState.finalMatchTime = `${String(totalMatchMinutes).padStart(2, '0')}:${String(totalMatchSecondsRemainder).padStart(2, '0')}`;

    // Update UI
    updateUI();

    // Show match end modal
    showMatchEndModal();

    // Save data
    saveMatchData();
}

// Update the showMatchEndModal function to handle scores
function showMatchEndModal() {
    // Set initial score values
    teamAScoreInput.value = matchState.teamA.score || 0;
    teamBScoreInput.value = matchState.teamB.score || 0;

    // Display team names
    document.getElementById('teamAScoreLabel').textContent = `${matchState.teamA.name} คะแนน:`;
    document.getElementById('teamBScoreLabel').textContent = `${matchState.teamB.name} คะแนน:`;

    // Show modal
    matchEndModal.style.display = 'flex';
}
