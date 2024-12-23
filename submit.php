<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $character_name = $_POST['character-name'];
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
                    // Connect to the database
                    $mysqli = new mysqli('localhost', 'username', 'password', 'database_name');
                    if ($mysqli->connect_error) {
                        die("Connection failed: " . $mysqli->connect_error);
                    }

                    // Insert the data into the database
                    $stmt = $mysqli->prepare("INSERT INTO characters (character_name, source, image_path) VALUES (?, ?, ?)");
                    $stmt->bind_param("sss", $character_name, $source, $image_destination);

                    if ($stmt->execute()) {
                        echo "Character submitted successfully!";
                    } else {
                        echo "Error: " . $stmt->error;
                    }

                    $stmt->close();
                    $mysqli->close();
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
