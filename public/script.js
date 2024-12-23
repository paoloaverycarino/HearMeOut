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

    let yesVotes = 0;
    let noVotes = 0;

    function updateProgressBars() {
        const total = yesVotes + noVotes;
        if (total === 0) return;

        const yesPercentage = (yesVotes / total) * 100;
        const noPercentage = (noVotes / total) * 100;

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
                
                // Reset button text
                const buttonText = button.querySelector('.button-text');
                console.log('Found button text element:', !!buttonText);
                if (buttonText) {
                    buttonText.textContent = button === yesButton ? 'Absolutely' : 'Absolutely Not';
                }
                
                // Reset button state
                button.disabled = false;
                button.classList.remove('voted');
                button.style.backgroundColor = '';
            });

            // Move to next character after resetting the buttons
            nextCharacter();
        }, 5000);  // 5000 milliseconds = 5 seconds
    }
    

    yesButton.addEventListener('click', () => handleVote(true));
    noButton.addEventListener('click', () => handleVote(false));
});