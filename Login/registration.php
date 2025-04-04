<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <section>
        <div class="login-box">
            <form action="register.php" method="post">
                 <h2>Register</h2>

                <div class="input-box">
                    <span class="icon">
                        <ion-icon name="person"></ion-icon>
                    </span>
                    <input type="text" name="fullName" required >
                    <label>Full Name</label>

                </div>
                <div class="input-box">
                    
                    <input type="tel" name="phoneNumber" required>
                    <label>Phone  Number</label>
                </div>
                <div class="input-box">
                    <span class="icon">
                        <ion-icon name="mail"></ion-icon>
                    </span>
                    <input type="email" name="email" required>
                    <label>Email</label>
                </div>

                <div class="input-box">
                    <span class="icon">
                        <ion-icon name="lock-closed"></ion-icon>
                    </span>
                    <input type="password" name="password" required>
                    <label>Password</label>
                </div>

                <div class="input-box">
                    <span class="icon">
                        <ion-icon name="lock-closed"></ion-icon>
                    </span>
                    <input type="password" name="confirm_password" required>
                    <label>Confirm Password</label>
                </div>

                <div class="remember-forgot">
                    <div class="remember">
                        <input type="checkbox" id="terms">
                        <label for="terms">I agree to the terms & conditions</label>
                    </div>
                </div>

                <button type="submit" name="register">Register</button>

                <div class="register-link">
                    <p>Already have an account? <a href="index.php">Login</a></p>
                </div>
            </form>
        </div>
    </section>

    <script type="module" src="Assets/ionicons.esm.js"></script>
    <script nomodule src="Assets/ionicons.js"></script>
</body>
</html>
