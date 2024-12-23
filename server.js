const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle form submission
app.post('/api/submit', upload.single('image'), (req, res) => {
    const { character_name, source } = req.body;
    
    if (!req.file) {
        res.status(400).json({ error: 'No image uploaded' });
        return;
    }

    // EASTER EGG ITS 3:00 AM
    const imageBuffer = req.file.buffer;
    const insertQuery = `INSERT INTO submissions (character_name, source, image_path)
                        VALUES (?, ?, ?)`;

    db.run(insertQuery, [character_name, source, imageBuffer], function(err) {
        if (err) {
            console.error('Error inserting submission:', err);
            res.status(500).json({ error: 'Failed to save submission' });
            return;
        }
        res.redirect('/');
    });
});

// Function to fetch all characters from the database
function fetchAllCharacters(callback) {
    const characters = [];
    const query = 'SELECT name, show, picture FROM characters';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching characters:', err);
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
                    characters.push({
                        name: row.name,
                        show: row.show,
                        image: base64Image
                    });
                } catch (error) {
                    console.error(`Error converting image for ${row.name}:`, error);
                }
            }
        });
        
        callback(null, characters);
    });
}

// API endpoint to get all characters
app.get('/api/images', (req, res) => {
    fetchAllCharacters((err, characters) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ characters });
    });
});

// Modify the getVotePercentages function to return a Promise
function getVotePercentages(characterName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT up_votes, down_votes FROM characters WHERE name = ?', [characterName], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            if (row) {
                const { up_votes, down_votes } = row;
                const totalVotes = up_votes + down_votes;
                
                if (totalVotes === 0) {
                    resolve({
                        upvotePercentage: 0,
                        downvotePercentage: 0
                    });
                } else {
                    resolve({
                        upvotePercentage: (up_votes / totalVotes) * 100,
                        downvotePercentage: (down_votes / totalVotes) * 100
                    });
                }
            } else {
                reject(new Error(`Character "${characterName}" not found`));
            }
        });
    });
}

// Add new endpoint to get percentages
app.get('/api/percentages/:characterName', (req, res) => {
    const characterName = req.params.characterName;
    
    getVotePercentages(characterName)
        .then(percentages => {
            res.json(percentages);
        })
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
});

// Update the vote handling endpoint
app.post('/api/vote', express.json(), (req, res) => {
    const { characterName, voteType } = req.body;
    const column = voteType === 'up' ? 'up_votes' : 'down_votes';
    
    const query = `UPDATE characters SET ${column} = ${column} + 1 WHERE name = ?`;
    db.run(query, [characterName], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
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

// Add these endpoints for handling comments
app.post('/api/comments', (req, res) => {
    const { characterName, comment } = req.body;
    console.log('Saving comment for:', characterName);
    
    const query = `INSERT INTO comments (character_name, comment_text) VALUES (?, ?)`;
    db.run(query, [characterName, comment], function(err) {
        if (err) {
            console.error('Error saving comment:', err);
            res.status(500).json({ error: 'Failed to save comment' });
            return;
        }
        res.json({ 
            success: true, 
            id: this.lastID 
        });
    });
});

// Endpoint to get comments for a specific character
app.get('/api/comments/:characterName', (req, res) => {
    const characterName = req.params.characterName;
    console.log('Fetching comments for:', characterName);
    
    const query = `SELECT * FROM comments WHERE character_name = ? ORDER BY timestamp ASC`;
    db.all(query, [characterName], (err, rows) => {
        if (err) {
            console.error('Error fetching comments:', err);
            res.status(500).json({ error: 'Failed to fetch comments' });
            return;
        }
        res.json(rows);
    });
});