const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

let db = new sqlite3.Database("characters.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
    console.log("Connected to the character database.");
    }
});

function insertCharacterWithImage(name, show, up_votes, down_votes, imagePath) {
    // Read the image file as binary
    fs.readFile(imagePath, (err, imageData) => {
      if (err) {
        console.error('Error reading image file:', err);
        return;
      }
  
      // Prepare the SQL statement for inserting data
      const insertQuery = `INSERT INTO characters (name, show, up_votes, down_votes, picture)
                           VALUES (?, ?, ?, ?, ?)`;
  
      // Insert the data (including the image as BLOB)
      db.run(insertQuery, [name, show, up_votes, down_votes, imageData], function(err) {
        if (err) {
          console.error('Error inserting data:', err);
        } else {
          console.log('Inserted row with ID:', this.lastID);
        }
      });
    });
}

function getVotePercentages(characterName) {
    db.get('SELECT up_votes, down_votes FROM characters WHERE name = ?', [characterName], (err, row) => {
      if (err) {
        console.error('Error fetching data:', err);
        return;
      }
  
      if (row) {
        const { up_votes, down_votes } = row;
        const totalVotes = up_votes + down_votes;
  
        if (totalVotes === 0) {
          console.log('No votes for this character');
          console.log('Upvote Percentage: 0%');
          console.log('Downvote Percentage: 0%');
        } else {
          // Calculate the percentages
          const upvotePercentage = (up_votes / totalVotes) * 100;
          const downvotePercentage = (down_votes / totalVotes) * 100;
  
          console.log(`Upvote Percentage for ${characterName}: ${upvotePercentage.toFixed(2)}%`);
          console.log(`Downvote Percentage for ${characterName}: ${downvotePercentage.toFixed(2)}%`);
        }
      } else {
        console.log(`Character "${characterName}" not found in the database.`);
      }
    });
  }

  // Insert the character with the image
  //insertCharacterWithImage("Android Robot", 'Android', 0, 0, 'images/android.png');

  // Example usage: Get vote percentages for "Doctor Strange"
  //getVotePercentages("Doctor Strange's Cape");

  //#####################################################################3

  // Function to fetch all images from the database
function fetchAllImages(callback) {
    const imageArray = [];
    
    // Modified query to get both name and picture
    const query = 'SELECT name, picture FROM characters';
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching images:', err);
        return callback(err, null);
      }
      
      console.log('Number of rows found:', rows.length);
      
      rows.forEach((row) => {
        if (row.picture) {
          try {
            // Check if the image data starts with PNG or JPEG magic numbers
            const imageBuffer = Buffer.from(row.picture);
            let mimeType = 'jpeg'; // default
            
            // Check for PNG signature
            if (imageBuffer[0] === 0x89 && 
                imageBuffer[1] === 0x50 && 
                imageBuffer[2] === 0x4E && 
                imageBuffer[3] === 0x47) {
                mimeType = 'png';
            }
            
            const base64Image = `data:image/${mimeType};base64,${imageBuffer.toString('base64')}`;
            imageArray.push(base64Image);
            console.log(`Successfully converted ${mimeType} image for ${row.name}`);
          } catch (error) {
            console.error(`Error converting image for ${row.name}:`, error);
          }
        } else {
          console.log(`No image data for ${row.name}`);
        }
      });
  
      console.log('Number of valid images:', imageArray.length);
      callback(null, imageArray);
    });
}

// Store images globally so they can be accessed by nextImage
let globalImages = [];

// Fetch images and store them globally
fetchAllImages((err, images) => {
     if (err) {
         console.error('Error fetching images:', err);
         return;
     }
     globalImages = images;
     console.log('Global images array length:', globalImages.length); // Debug log
});

let currentImageIndex = 0;

function nextImage() {
    if (globalImages.length === 0) {
        console.log('No images loaded yet');
        return;
    }
    currentImageIndex = (currentImageIndex + 1) % globalImages.length;
    const imageElement = document.querySelector('.Hear-Me-Out');
    imageElement.src = globalImages[currentImageIndex];
    console.log('Changed to image index:', currentImageIndex);
}