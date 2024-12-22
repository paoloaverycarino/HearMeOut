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

      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Closed the database connection');
        }
      });

    });
  }

  insertCharacterWithImage('Android Robot', 'Android', 0, 0, 'Android_Robot.png');  