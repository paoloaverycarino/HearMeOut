const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database connection
let db = new sqlite3.Database("characters.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to the character database.");
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to fetch all images from the database
function fetchAllImages(callback) {
    const imageArray = [];
    const query = 'SELECT name, picture FROM characters';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching images:', err);
            return callback(err, null);
        }
        
        rows.forEach((row) => {
            if (row.picture) {
                try {
                    const imageBuffer = Buffer.from(row.picture);
                    let mimeType = 'jpeg';
                    
                    if (imageBuffer[0] === 0x89 && 
                        imageBuffer[1] === 0x50 && 
                        imageBuffer[2] === 0x4E && 
                        imageBuffer[3] === 0x47) {
                        mimeType = 'png';
                    }
                    
                    const base64Image = `data:image/${mimeType};base64,${imageBuffer.toString('base64')}`;
                    imageArray.push(base64Image);
                } catch (error) {
                    console.error(`Error converting image for ${row.name}:`, error);
                }
            }
        });
        
        callback(null, imageArray);
    });
}

// API endpoint to get images
app.get('/api/images', (req, res) => {
    fetchAllImages((err, images) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ images });
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
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

insertCharacterWithImage('Andy', 'Tran', 0, 0, 'public/images/chillguy.jpg');
    
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