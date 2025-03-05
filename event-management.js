function showCardDialog(isTeamA, isYellow, cardToEdit = null) {
    if (!matchState.isMatchStarted && !cardToEdit) {
        alert('โปรดเริ่มการแข่งขันก่อน');
        return;
    }

    currentCardContext = {
        isTeamA,
        isYellow,
        cardToEdit
    };

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
        if (deleteBtn) {
            deleteBtn.remove();
        }
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

        if (isTeamA) {
            matchState.teamA.cards.push(newCard);
        } else {
            matchState.teamB.cards.push(newCard);
        }
    }

    renderTeamCards();
    saveMatchData();
    cardModal.style.display = 'none';
}
