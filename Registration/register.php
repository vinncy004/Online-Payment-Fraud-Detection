<?php
session_start(); // Start the session at the very beginning
require_once 'config.php'; // Include database connection

// Generate or retrieve CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

$errors = []; // Array to hold validation errors
$success_message = ''; // To store success message
$input_values = [ // To repopulate form on error
    'full_name' => '',
    'phone_number' => '', 
    'email' => ''
     // Added
    
];

// Processing form data when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['register'])) {

    // 1. Verify CSRF token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $errors['csrf'] = "Invalid request. Please try again.";
         // Optionally regenerate token on failure
         $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
         $csrf_token = $_SESSION['csrf_token'];
    } else {
        // 2. Sanitize and Validate Inputs (Server-Side)
        $full_name = trim($_POST['full_name']);
        $phone_number = trim($_POST['phone_number']);
        $email = trim($_POST['email']);
        $password = $_POST['password']; // Don't trim password initially
        $confirm_password = $_POST['confirm_password'];
        

        // Keep input values to repopulate form
        $input_values['full_name'] = htmlspecialchars($full_name);
        $input_values['phone_number'] = htmlspecialchars($phone_number);
        $input_values['email'] = htmlspecialchars($email);

        // Full Name Validation
        if (empty($full_name)) {
            $errors['full_name'] = "Full Name is required.";
        }
        // Phone Number Validation (Server-Side)
        if (empty($phone_number)) {
            $errors['phone_number'] = "Phone Number is required.";
        } else {
            // Basic validation: Allows digits, spaces, hyphens, parentheses, optional leading '+'
            // Adjust regex as needed for stricter/different formats
            // This regex checks for a reasonable length (7-20 chars) after allowing common symbols
            if (!preg_match('/^[\d\s()+-]{7,20}$/', $phone_number)) {
                 $errors['phone_number'] = "Please enter a valid phone number format.";
            }
             // Check if phone number already exists (if it should be unique)
             
             $sql_check_phone = "SELECT id FROM users WHERE phone_number = ?";
             if ($stmt_check_phone = $conn->prepare($sql_check_phone)) {
                 $stmt_check_phone->bind_param("s", $phone_number);
                 $stmt_check_phone->execute();
                 $stmt_check_phone->store_result();
                 if ($stmt_check_phone->num_rows > 0) {
                     $errors['phone_number'] = "This phone number is already registered.";
                 }
                 $stmt_check_phone->close();
             } else {
                  $errors['database'] = "Database error checking phone number.";
             }
             
        }


        // Email Validation
        if (empty($email)) {
            $errors['email'] = "Email is required.";
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = "Invalid email format.";
        } else {
            // Check if email already exists
            $sql_check = "SELECT id FROM users WHERE email = ?";
            if ($stmt_check = $conn->prepare($sql_check)) {
                $stmt_check->bind_param("s", $email);
                $stmt_check->execute();
                $stmt_check->store_result();
                if ($stmt_check->num_rows > 0) {
                    $errors['email'] = "This email is already registered.";
                }
                $stmt_check->close();
            } else {
                 $errors['database'] = "Database error checking email.";
            }
        }

        // Password Validation
        if (empty($password)) {
            $errors['password'] = "Password is required.";
        } elseif (strlen($password) < 6) { // Consistent with JS validation
            $errors['password'] = "Password must be at least 6 characters long.";
        }

        // Confirm Password Validation
        if (empty($confirm_password)) {
            $errors['confirm_password'] = "Please confirm your password.";
        } elseif ($password !== $confirm_password) {
            $errors['confirm_password'] = "Passwords do not match.";
        }
        


        // 3. If no validation errors, proceed to insert into database
        if (empty($errors)) {
            // Hash the password securely
            // PASSWORD_ARGON2ID is generally recommended if available, otherwise use PASSWORD_BCRYPT or PASSWORD_DEFAULT
            $hashed_password = password_hash($password, PASSWORD_DEFAULT); // Or PASSWORD_ARGON2ID / PASSWORD_BCRYPT

            // Prepare an insert statement
            $sql = "INSERT INTO users (full_name,phone_number, email, password) VALUES (?, ?, ?,?)";

            if ($stmt = $conn->prepare($sql)) {
                // Bind variables to the prepared statement as parameters
                // ssss = string, string, string,string
                $stmt->bind_param("ssss", $param_fullname,$param_phonenumber, $param_email, $param_password);

                // Set parameters
                $param_fullname = $full_name;
                $param_phonenumber = $phone_number;
                $param_email = $email;
                $param_password = $hashed_password; // Store the hashed password

                // Attempt to execute the prepared statement
                if ($stmt->execute()) {
                    $success_message = "Registration successful! You can now login.";
                    // Clear input values after successful registration
                    $input_values = ['full_name' => '','phone_number' => '', 'email' => ''];
                     // Regenerate CSRF token after successful operation
                    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
                    $csrf_token = $_SESSION['csrf_token'];

                } else {
                    // Log the actual database error, show a generic message
                    // error_log("Database Execute Error: " . $stmt->error);
                    $errors['database'] = "Oops! Something went wrong. Please try again later.";
                }

                // Close statement
                $stmt->close();
            } else {
                 // Log the prepare error
                 // error_log("Database Prepare Error: " . $conn->error);
                 $errors['database'] = "Oops! Something went wrong with the database preparation.";
            }
        }
        // Regenerate CSRF token if there were errors too (optional, but can help)
        if(!empty($errors)){
             $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
             $csrf_token = $_SESSION['csrf_token'];
        }

    } // End of POST request processing
}

// Close connection (usually done at the end of script execution automatically, but can be explicit)
// $conn->close(); // Better to close only if completely done with DB operations on the page

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Registration</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="form-container">
        <h2>Create Account</h2>

        <!-- Display Success Message -->
        <?php if (!empty($success_message)): ?>
            <div class="message success-message-php"><?php echo $success_message; ?></div>
        <?php endif; ?>

         <!-- Display General Errors (CSRF, Database) -->
        <?php if (isset($errors['csrf'])): ?>
            <div class="message error-message-php"><?php echo $errors['csrf']; ?></div>
        <?php endif; ?>
         <?php if (isset($errors['database'])): ?>
            <div class="message error-message-php"><?php echo $errors['database']; ?></div>
        <?php endif; ?>


        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post" id="registerForm" novalidate>
            <!-- CSRF Token -->
            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">

            <!-- Full Name -->
            <div class="input-group">
                <label for="full_name">Full Name</label>
                <input type="text" id="full_name" name="full_name" required value="<?php echo $input_values['full_name']; ?>">
                <span class="error-message-js" id="name-error"></span>
                <?php if (isset($errors['full_name'])): ?>
                    <span class="error-message-js" style="color: #dc3545;"><?php echo $errors['full_name']; ?></span>
                <?php endif; ?>
            </div>
<!-- Phone Number -->
            <div class="input-group">
                <label for="phone_number">Phone Number</label>
                <input type="tel" id="phone_number" name="phone_number" required   value="<?php echo $input_values['phone_number']; ?>">
                <span class="error-message-js" id="phone-error"></span>
                 <?php if (isset($errors['phone_number'])): ?>
                    <span class="error-message-js" style="color: #dc3545;"><?php echo $errors['phone_number']; ?></span>
                <?php endif; ?>
            </div>
            <!-- Email -->
            <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required value="<?php echo $input_values['email']; ?>">
                <span class="error-message-js" id="email-error"></span>
                 <?php if (isset($errors['email'])): ?>
                    <span class="error-message-js" style="color: #dc3545;"><?php echo $errors['email']; ?></span>
                <?php endif; ?>
            </div>

            <!-- Password -->
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <span class="error-message-js" id="password-error"></span>
                 <?php if (isset($errors['password'])): ?>
                    <span class="error-message-js" style="color: #dc3545;"><?php echo $errors['password']; ?></span>
                <?php endif; ?>
            </div>

            <!-- Confirm Password -->
            <div class="input-group">
                <label for="confirm_password">Confirm Password</label>
                <input type="password" id="confirm_password" name="confirm_password" required>
                <span class="error-message-js" id="confirm-password-error"></span>
                 <?php if (isset($errors['confirm_password'])): ?>
                    <span class="error-message-js" style="color: #dc3545;"><?php echo $errors['confirm_password']; ?></span>
                <?php endif; ?>
            </div>

            <button type="submit" name="register">Register</button>

            <div class="form-link">
                <p>Already have an account? <a href="login.php">Login here</a></p>
            </div>
        </form>
    </div>

    <script src="validation.js" defer></script>
</body>
</html>
<?php $conn->close(); // Close connection at the end ?>