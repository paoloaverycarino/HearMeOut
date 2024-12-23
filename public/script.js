let globalCharacters = [];
let currentCharacterIndex = 0;
let isLoading = true;
let yesVotes = 0;
let noVotes = 0;

// Function to initialize the app
function initApp() {
    console.log('Initializing app');
    
    // Get DOM elements
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const imageElement = document.querySelector('.Hear-Me-Out');
    
    // Debug logs for DOM elements
    console.log('Yes button found:', !!yesButton);
    console.log('No button found:', !!noButton);
    console.log('Image element found:', !!imageElement);

    // Add click event listeners to buttons
    yesButton.addEventListener('click', () => handleVote(true));
    noButton.addEventListener('click', () => handleVote(false));

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

function handleVote(isYesVote) {
    console.log('Vote handler called:', isYesVote ? 'yes' : 'no');
    
    if (isLoading || globalCharacters.length === 0) {
        console.log('Blocked due to loading or no characters');
        return;
    }
    
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    
    if (isYesVote) {
        yesVotes++;
    } else {
        noVotes++;
    }
    
    console.log('Vote registered:', isYesVote ? 'yes' : 'no');
    console.log('Current character index:', currentCharacterIndex);
    console.log('Total characters:', globalCharacters.length);
    
    // Disable buttons immediately
    yesButton.disabled = true;
    noButton.disabled = true;
    
    setTimeout(() => {
        console.log('Timer fired - starting reset process');
        
        // Reset votes
        yesVotes = 0;
        noVotes = 0;
        
        // Reset buttons
        yesButton.disabled = false;
        noButton.disabled = false;

        // Move to next character
        console.log('Calling nextCharacter()');
        nextCharacter();
    }, 5000);
}

function nextCharacter() {
    console.log('nextCharacter called');
    console.log('Current index:', currentCharacterIndex);
    console.log('Total characters:', globalCharacters.length);
    
    if (isLoading || globalCharacters.length === 0) {
        console.log('Blocked due to loading or no characters');
        return;
    }
    
    // Check if we're at the last character
    if (currentCharacterIndex === globalCharacters.length - 1) {
        console.log('Reached last character');
        const centerImageContainer = document.querySelector('.center-image-container');
        const imageElement = document.querySelector('.Hear-Me-Out');
        const characterNameElement = document.getElementById('characterName');
        const showNameElement = document.getElementById('showName');
        const buttonContainer = document.querySelector('.button-container');
        
        // Hide the elements
        imageElement.style.display = 'none';
        characterNameElement.style.display = 'none';
        showNameElement.style.display = 'none';
        buttonContainer.style.display = 'none';
        
        // Create and display the finished message
        const finishedMessage = document.createElement('h2');
        finishedMessage.textContent = 'Thanks for voting on all characters!';
        finishedMessage.style.textAlign = 'center';
        finishedMessage.style.color = '#333';
        finishedMessage.style.margin = '20px 0';
        finishedMessage.style.fontSize = '24px';
        
        // Insert the message in the center-image-container
        centerImageContainer.insertBefore(finishedMessage, imageElement);
        
        return;
    }
    
    // If not at the last character, proceed as normal
    console.log('Moving to next character');
    currentCharacterIndex++;
    updateCharacterDisplay(currentCharacterIndex);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);