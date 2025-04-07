<?php
session_start(); // Start the session
require_once 'config.php'; // Include database connection

// If user is already logged in, redirect them to homepage
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
    header("location: opfdInterface.php");
    exit;
}

// Generate or retrieve CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];


$email = $password = "";
$email_err = $password_err = $login_err = ""; // Specific errors + general login error

// Processing form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['login'])) {

     // 1. Verify CSRF token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $login_err = "Invalid request. Please try logging in again.";
         // Optionally regenerate token on failure
         $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
         $csrf_token = $_SESSION['csrf_token'];
    } else {

        // 2. Server-Side Input Validation
        $email = trim($_POST["email"]);
        $password = $_POST["password"]; // Don't trim password

        // Validate email
        if (empty($email)) {
            $email_err = "Please enter your email.";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
             $email_err = "Invalid email format.";
        }

        // Validate password
        if (empty($password)) {
            $password_err = "Please enter your password.";
        }

        // 3. Check credentials if inputs are valid
        if (empty($email_err) && empty($password_err)) {
            // Prepare a select statement
            $sql = "SELECT id, full_name, email, password FROM users WHERE email = ?";

            if ($stmt = $conn->prepare($sql)) {
                // Bind variables to the prepared statement as parameters
                $stmt->bind_param("s", $param_email);

                // Set parameters
                $param_email = $email;

                // Attempt to execute the prepared statement
                if ($stmt->execute()) {
                    // Store result
                    $stmt->store_result();

                    // Check if email exists, if yes then verify password
                    if ($stmt->num_rows == 1) {
                        // Bind result variables
                        $stmt->bind_result($id, $full_name, $db_email, $hashed_password);
                        if ($stmt->fetch()) {
                            // Verify password
                            if (password_verify($password, $hashed_password)) {
                                // Password is correct, start a new session

                                // Regenerate session ID for security
                                session_regenerate_id(true);

                                // Store data in session variables
                                $_SESSION["loggedin"] = true;
                                $_SESSION["user_id"] = $id; // Store user ID
                                $_SESSION["email"] = $db_email;
                                $_SESSION["full_name"] = $full_name;

                                // Redirect user to home page
                                header("location: opfdInterface.php");
                                exit(); // Make sure script stops execution after redirect
                            } else {
                                // Password is not valid
                                $login_err = "Invalid email or password.";
                            }
                        }
                    } else {
                        // Email doesn't exist
                        $login_err = "Invalid email or password.";
                    }
                } else {
                    // Log the error
                    // error_log("Database Execute Error: " . $stmt->error);
                    $login_err = "Oops! Something went wrong. Please try again later.";
                }

                // Close statement
                $stmt->close();
            } else {
                 // Log the prepare error
                 // error_log("Database Prepare Error: " . $conn->error);
                 $login_err = "Oops! Something went wrong with database preparation.";
            }
        }
         // Regenerate CSRF token on login attempt (success or failure)
         $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
         $csrf_token = $_SESSION['csrf_token'];
    } // End CSRF Check
}

// Close connection
// $conn->close(); // Better to close at the very end if needed

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Login</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="form-container">
        <h2>Login</h2>

        <!-- Display General Login Error -->
        <?php if (!empty($login_err)): ?>
            <div class="message error-message-php"><?php echo $login_err; ?></div>
        <?php endif; ?>

        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" id="loginForm" novalidate>
             <!-- CSRF Token -->
            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">

            <!-- Email -->
            <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required value="<?php echo htmlspecialchars($email); ?>">
                <span class="error-message-js" id="email-error"></span>
                <?php if (!empty($email_err)): ?>
                     <span class="error-message-js" style="color: #dc3545;"><?php echo $email_err; ?></span>
                <?php endif; ?>
            </div>

            <!-- Password -->
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <span class="error-message-js" id="password-error"></span>
                 <?php if (!empty($password_err)): ?>
                     <span class="error-message-js" style="color: #dc3545;"><?php echo $password_err; ?></span>
                <?php endif; ?>
            </div>

            <button type="submit" name="login">Login</button>

            <div class="form-link">
                <p>Don't have an account? <a href="register.php">Register here</a></p>
            </div>
             <!-- Add forgot password link if needed -->
             <!-- <div class="form-link"><a href="forgot_password.php">Forgot Password?</a></div> -->
        </form>
    </div>

    <script src="validation.js" defer></script>
</body>
</html>
<?php $conn->close(); // Close connection at the end ?>