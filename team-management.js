function initColorPickers() {
    teamAColorPicker.innerHTML = '';
    teamBColorPicker.innerHTML = '';

    availableColors.forEach(color => {
        const optionA = document.createElement('div');
        optionA.className = 'color-option';
        optionA.style.backgroundColor = color;
        if (color === matchState.teamA.color) {
            optionA.classList.add('selected');
        }
        optionA.addEventListener('click', () => {
            document.querySelectorAll('#teamAColorPicker .color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionA.classList.add('selected');
        });
        teamAColorPicker.appendChild(optionA);

        const optionB = document.createElement('div');
        optionB.className = 'color-option';
        optionB.style.backgroundColor = color;
        if (color === matchState.teamB.color) {
            optionB.classList.add('selected');
        }
        optionB.addEventListener('click', () => {
            document.querySelectorAll('#teamBColorPicker .color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            optionB.classList.add('selected');
        });
        teamBColorPicker.appendChild(optionB);
    });
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
