const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer();

// Middleware setup - these must come before routes
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
let db = new sqlite3.Database("characters.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the character database.");
        
        // Create comments table
        db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                character_name TEXT NOT NULL,
                comment_text TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating comments table:', err);
            } else {
                console.log('Comments table is ready');
            }
        });
    }
});

// Comments endpoints
app.post('/api/comments', (req, res) => {
    const { characterName, comment } = req.body;
    console.log('Received comment request:', { characterName, comment });
    
    if (!characterName || !comment) {
        console.error('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO comments (character_name, comment_text) VALUES (?, ?)`;
    
    db.run(query, [characterName, comment], function(err) {
        if (err) {
            console.error('Error inserting comment:', err);
            return res.status(500).json({ error: 'Failed to save comment' });
        }
        
        console.log('Comment saved successfully with ID:', this.lastID);
        
        // Return the newly created comment
        res.json({ 
            success: true,
            id: this.lastID,
            character_name: characterName,
            comment_text: comment,
            timestamp: new Date().toISOString()
        });
    });
});

app.get('/api/comments/:characterName', (req, res) => {
    const characterName = req.params.characterName;
    console.log('Fetching comments for:', characterName);
    
    const query = `SELECT * FROM comments WHERE character_name = ? ORDER BY timestamp DESC`;
    
    db.all(query, [characterName], (err, rows) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Failed to fetch comments' });
        }
        
        console.log(`Found ${rows.length} comments for ${characterName}`);
        res.json(rows);
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});