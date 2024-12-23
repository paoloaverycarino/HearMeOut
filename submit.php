<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $character_name = $_POST['character_name'];
    $source = $_POST['source'];

    // Handle the image upload
    $image = $_FILES['image'];
    $image_name = $image['name'];
    $image_tmp_name = $image['tmp_name'];
    $image_size = $image['size'];
    $image_error = $image['error'];

    // Set the image destination
    $upload_directory = 'uploads/';
    $image_ext = strtolower(pathinfo($image_name, PATHINFO_EXTENSION));
    $image_new_name = uniqid('', true) . '.' . $image_ext;
    $image_destination = $upload_directory . $image_new_name;

    // Validate image
    if ($image_error === 0) {
        if ($image_size < 5000000) { // 5MB limit
            if (in_array($image_ext, ['jpg', 'jpeg', 'png', 'gif'])) {
                // Move the image to the uploads folder
                if (move_uploaded_file($image_tmp_name, $image_destination)) {
                    // Connect to the SQLite database
                    $db = new SQLite3('characters.db');

                    // Create the table if it doesn't exist
                    $db->exec("CREATE TABLE IF NOT EXISTS submissions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        character_name TEXT NOT NULL,
                        source TEXT,
                        image_path TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )");

                    // Insert the data into the database
                    $stmt = $db->prepare("INSERT INTO submissions (character_name, source, image_path) VALUES (:character_name, :source, :image_path)");
                    $stmt->bindValue(':character_name', $character_name, SQLITE3_TEXT);
                    $stmt->bindValue(':source', $source, SQLITE3_TEXT);
                    $stmt->bindValue(':image_path', $image_destination, SQLITE3_TEXT);

                    if ($stmt->execute()) {
                        // Redirect to home page instead of showing a message
                        header("Location: index.html");
                        exit();
                    } else {
                        echo "Error: Failed to execute the query.";
                    }

                    $db->close();
                } else {
                    echo "Failed to upload image.";
                }
            } else {
                echo "Invalid file type. Only jpg, jpeg, png, and gif are allowed.";
            }
        } else {
            echo "File is too large. Maximum size is 5MB.";
        }
    } else {
        echo "Error uploading image.";
    }
}
?>
