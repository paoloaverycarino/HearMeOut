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
  insertCharacterWithImage("Ice Bear", 'We Bare Bears', 0, 0, 'images/icebear.png');  