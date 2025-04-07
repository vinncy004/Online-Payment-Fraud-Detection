<?php
// Database configuration
define('DB_SERVER', 'localhost');   // Your database server (usually localhost)
define('DB_USERNAME', 'root');      // Your database username
define('DB_PASSWORD', '');          // Your database password
define('DB_NAME', 'registration'); // Your database name

// Attempt to connect to MySQL database
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    // Log error instead of displaying to user in production
    // error_log("Database Connection failed: " . $conn->connect_error);
    die("ERROR: Could not connect to the database. " . $conn->connect_error);
}

// Set character set to utf8mb4 (recommended)
$conn->set_charset("utf8mb4");

?>