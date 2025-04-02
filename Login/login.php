<?php
session_start();
include 'connect.php';

if (isset($_POST['Login'])) {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Check if the email exists
    $sql = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $sql->bind_param("s", $email);
    $sql->execute();
    $result = $sql->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        // Verify hashed password
        if (password_verify($password, $row['password'])) {
            $_SESSION['email'] = $row['email']; // Store email in session
            $_SESSION['fullName'] = $row['fullName']; // Store full name in session
            header("Location: opfdInterface.html"); // Redirect to homepage
            exit();
        } else {
            echo "Invalid email or password!";
        }
    } else {
        echo "Invalid email or password!";
    }
}
?>
