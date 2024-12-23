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
    
    currentCharacterIndex++;
    
    // Check if we've reached the end
    if (currentCharacterIndex >= globalCharacters.length) {
        // Hide the buttons
        const buttonContainer = document.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.style.display = 'none';
        }
        
        // Change the image to a thank you message or remove it
        const imageElement = document.querySelector('.Hear-Me-Out');
        if (imageElement) {
            imageElement.style.display = 'none';
        }
        
        // Create and show end message
        const endMessage = document.createElement('div');
        endMessage.style.textAlign = 'center';
        endMessage.style.marginTop = '20px';
        endMessage.style.fontFamily = 'Neue Montreal, sans-serif';
        endMessage.style.fontSize = '2rem';
        endMessage.textContent = "That's all for now! Check back later for more.";
        
        // Insert the message after the image
        const centerImageContainer = document.querySelector('.center-image-container');
        if (centerImageContainer) {
            centerImageContainer.appendChild(endMessage);
        }
        
        return;
    }
    
    // If not at the end, update display as normal
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
        
        console.log('Vote registered:', isYesVote ? 'yes' : 'no');
        
        // Disable buttons immediately
        yesButton.disabled = true;
        noButton.disabled = true;
        
        // Show the progress bars
        updateProgressBars();
        
        setTimeout(() => {
            console.log('Timer fired - starting reset process');
            
            // Reset votes
            yesVotes = 0;
            noVotes = 0;
            
            // Reset buttons more thoroughly
            [yesButton, noButton].forEach(button => {
                console.log('Resetting button:', button.id);
                
                // Reset progress bar
                const progressBar = button.querySelector('.progress');
                console.log('Found progress bar:', !!progressBar);
                if (progressBar) {
                    progressBar.style.width = '0%';
                    progressBar.textContent = '';
                }
                
                // Remove percentage display
                const percentageDisplay = button.querySelector('.percentage-display');
                if (percentageDisplay) {
                    percentageDisplay.remove();
                }
                
                // Show the button text again
                const buttonText = button.querySelector('.button-text');
                console.log('Found button text element:', !!buttonText);
                if (buttonText) {
                    buttonText.style.display = 'block';
                    buttonText.textContent = button === yesButton ? 'Absolutely' : 'Absolutely Not';
                }
                
                // Reset button state
                button.disabled = false;
                button.classList.remove('voted');
                button.style.backgroundColor = '';
            });

            // Move to next character after resetting the buttons
            nextCharacter();
        }, 3000);  // 5000 milliseconds = 5 seconds
    }
    

    yesButton.addEventListener('click', () => handleVote(true));
    noButton.addEventListener('click', () => handleVote(false));
});