let globalImages = [];
let currentImageIndex = 0;
let isLoading = true;

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

    // Fetch images from the server
    fetch('/api/images')
        .then(response => response.json())
        .then(data => {
            globalImages = data.images;
            isLoading = false;
            console.log('Loaded images:', globalImages.length);
            // Load the first image if available
            if (globalImages.length > 0 && imageElement) {
                imageElement.src = globalImages[0];
                console.log('First image loaded');
            }
        })
        .catch(error => {
            console.error('Error loading images:', error);
        });

    // Add click event listeners
    if (yesButton && noButton) {
        yesButton.addEventListener('click', () => {
            console.log('Yes button clicked');
            nextImage();
        });
        
        noButton.addEventListener('click', () => {
            console.log('No button clicked');
            nextImage();
        });
        console.log('Event listeners attached');
    } else {
        console.error('Could not find buttons');
    }
}

function nextImage() {
    console.log('nextImage function called');
    
    if (isLoading) {
        console.log('Images are still loading...');
        return;
    }
    
    if (globalImages.length === 0) {
        console.log('No images found');
        return;
    }
    
    // Increment the index and update the image
    currentImageIndex = (currentImageIndex + 1) % globalImages.length;
    const imageElement = document.querySelector('.Hear-Me-Out');
    if (imageElement) {
        imageElement.src = globalImages[currentImageIndex];
        console.log('Changed to image index:', currentImageIndex);
    } else {
        console.error('Image element not found');
    }
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}