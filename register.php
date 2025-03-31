<?php
include 'connect.php';

if (isset($_POST['register'])) {
    $fullName = trim($_POST['fullName']);
    $phoneNumber = trim($_POST['phoneNumber']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    
    if ($password !== $confirm_password) {
        die("Passwords do not match!");
    }

    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    
    $checkEmail = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $result = $checkEmail->get_result();

    if ($result->num_rows > 0) {
        die("Email Address already exists!");
    } else {
        
        $insertQuery = $conn->prepare("INSERT INTO users (fullName, phoneNumber, email, password) VALUES (?, ?, ?, ?)");
        $insertQuery->bind_param("ssss", $fullName, $phoneNumber, $email, $hashedPassword);

        if ($insertQuery->execute()) {
            header("Location: index.php");
            exit();
        } else {
            die("Error: " . $conn->error);
        }
    }
}
?>
