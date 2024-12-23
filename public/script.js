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
    
    // Check if we're at the last character
    if (currentCharacterIndex === globalCharacters.length - 1) {
        // Hide the character display elements
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
    currentCharacterIndex++;
    updateCharacterDisplay(currentCharacterIndex);
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}