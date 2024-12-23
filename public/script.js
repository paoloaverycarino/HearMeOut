let globalCharacters = [];
let currentCharacterIndex = 0;
let isLoading = true;

// Function to initialize the app
function initApp() {
    console.log('Initializing app');
    
    // Get DOM elements
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const imageElement = document.querySelector('.Hear-Me-Out');
    const characterNameElement = document.getElementById('characterName');
    const showNameElement = document.getElementById('showName');
    
    // Debug logs for DOM elements
    console.log('Yes button found:', !!yesButton);
    console.log('No button found:', !!noButton);
    console.log('Image element found:', !!imageElement);

    // Fetch characters from the server
    fetch('/api/images')
        .then(response => response.json())
        .then(data => {
            globalCharacters = data.characters;
            isLoading = false;
            console.log('Loaded characters:', globalCharacters.length);
            // Load the first character if available
            if (globalCharacters.length > 0) {
                updateCharacterDisplay(0);
            }
        })
        .catch(error => {
            console.error('Error loading characters:', error);
        });
}

function updateCharacterDisplay(index) {
    const imageElement = document.querySelector('.Hear-Me-Out');
    const characterNameElement = document.getElementById('characterName');
    const showNameElement = document.getElementById('showName');
    
    const character = globalCharacters[index];
    if (character && imageElement) {
        imageElement.src = character.image;
        if (characterNameElement) characterNameElement.textContent = character.name;
        if (showNameElement) showNameElement.textContent = character.show;
    }
}

function nextCharacter() {
    if (isLoading || globalCharacters.length === 0) return;
    
    currentCharacterIndex = (currentCharacterIndex + 1) % globalCharacters.length;
    updateCharacterDisplay(currentCharacterIndex);
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

document.addEventListener('DOMContentLoaded', () => {
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');

    let yesVotes = 0;
    let noVotes = 0;

    function updateProgressBars() {
        const total = yesVotes + noVotes;
        if (total === 0) return;

        const yesPercentage = (yesVotes / total) * 100;
        const noPercentage = (noVotes / total) * 100;

        // Hide the button text
        yesButton.querySelector('.button-text').style.display = 'none';
        noButton.querySelector('.button-text').style.display = 'none';

        // Update the progress bars and show percentages
        yesButton.querySelector('.progress').style.width = `${yesPercentage}%`;
        noButton.querySelector('.progress').style.width = `${noPercentage}%`;
        
        // Add percentage text
        yesButton.querySelector('.progress').textContent = `${Math.round(yesPercentage)}%`;
        noButton.querySelector('.progress').textContent = `${Math.round(noPercentage)}%`;
    }

    function handleVote(isYesVote) {
        if (isLoading || globalCharacters.length === 0) return;
        
        if (isYesVote) {
            yesVotes++;
        } else {
            noVotes++;
        }
        
        // Disable buttons immediately
        yesButton.disabled = true;
        noButton.disabled = true;
        
        // Show the progress bars
        updateProgressBars();
        
        // Move to next character immediately after vote
        setTimeout(() => {
            // Reset votes
            yesVotes = 0;
            noVotes = 0;
            
            // Reset buttons
            [yesButton, noButton].forEach(button => {
                button.disabled = false;
                button.querySelector('.button-text').style.display = 'block';
                button.querySelector('.progress').style.width = '0%';
                button.querySelector('.progress').textContent = '';
            });
            
            nextCharacter();
        }, 2000); // Reduced from 5000 to 2000 for better UX
    }
    

    yesButton.addEventListener('click', () => handleVote(true));
    noButton.addEventListener('click', () => handleVote(false));
});