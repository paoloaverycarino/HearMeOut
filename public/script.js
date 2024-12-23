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

    // Add click event listeners
    if (yesButton && noButton) {
        yesButton.addEventListener('click', () => {
            console.log('Yes button clicked');
            nextCharacter();
        });
        
        noButton.addEventListener('click', () => {
            console.log('No button clicked');
            nextCharacter();
        });
        console.log('Event listeners attached');
    } else {
        console.error('Could not find buttons');
    }
}

function updateCharacterDisplay(index) {
    const imageElement = document.querySelector('.Hear-Me-Out');
    const characterNameElement = document.getElementById('characterName');
    const showNameElement = document.getElementById('showName');
    
    const character = globalCharacters[index];
    if (character) {
        imageElement.src = character.image;
        characterNameElement.textContent = character.name;
        showNameElement.textContent = character.show;
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