const sqlite3 = require('sqlite3').verbose();

// Open the SQLite database
let db = new sqlite3.Database("characters.db", (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to the SQLite database');
  }
});

// Function to calculate upvote and downvote percentages for a character
function getVotePercentages(characterName) {
    // Query to fetch upvotes and downvotes for the given character name
    db.get('SELECT up_votes, down_votes FROM characters WHERE name = ?', [characterName], (err, row) => {
      if (err) {
        console.error('Error fetching data:', err);
        return;
      }
  
      if (row) {
        const { up_votes, down_votes } = row;
        const totalVotes = up_votes + down_votes;
  
        // Edge case: If both upvotes and downvotes are 0, handle accordingly
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
  
  // Example usage: Get vote percentages for "Doctor Strange"
  getVotePercentages("Doctor Strange's Cape");
  
  // Close the database connection after all operations are done
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Closed the database connection');
    }
  });