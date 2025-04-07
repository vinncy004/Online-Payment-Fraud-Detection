document.addEventListener('DOMContentLoaded', function() {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // --- REGISTRATION FORM VALIDATION ---
    if (registerForm) {
        const fullNameInput = document.getElementById('full_name');
        const phoneInput = document.getElementById('phone_number');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm_password');

        const nameError = document.getElementById('name-error');
        const phoneError = document.getElementById('phone-error');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        const confirmPasswordError = document.getElementById('confirm-password-error');


        const allRegisterErrorSpans = [nameError,phoneError, emailError,  passwordError, confirmPasswordError];
        const allRegisterInputs = [fullNameInput,phoneInput, emailInput,  passwordInput, confirmPasswordInput];

        registerForm.addEventListener('submit', function(event) {
            let isValid = true;
            clearErrors(allRegisterErrorSpans, allRegisterInputs); 

            // Full Name validation
            if (fullNameInput.value.trim() === '') {
                showError(fullNameInput, nameError, 'Full Name is required.');
                isValid = false;
            
            }
            // Phone Number validation
            const phoneValue = phoneInput.value.trim();
            // Basic regex: Allows digits, spaces, hyphens, parentheses, optional '+'
            // Checks for reasonable length (7-20 characters)
            const phoneRegex = /^[\d\s()+-]{7,20}$/;
            if (phoneValue === '') {
                showError(phoneInput, phoneError, 'Phone Number is required.');
                isValid = false;
            } else if (!phoneRegex.test(phoneValue)) {
                 showError(phoneInput, phoneError, 'Please enter a valid phone number format.');
                 isValid = false;
            }
            // Email validation
            const emailValue = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailValue === '') {
                showError(emailInput, emailError, 'Email is required.');
                isValid = false;
            } else if (!emailRegex.test(emailValue)) {
                showError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password validation
            const passwordValue = passwordInput.value;
            if (passwordValue === '') {
                showError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            } else if (passwordValue.length < 6) { // Example: Minimum length
                 showError(passwordInput, passwordError, 'Password must be at least 6 characters long.');
                 isValid = false;
            }
            
            // Confirm Password validation
            const confirmPasswordValue = confirmPasswordInput.value;
            if (confirmPasswordValue === '') {
                showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password.');
                isValid = false;
            } else if (passwordValue !== confirmPasswordValue) {
                showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
                isValid = false;
            }

            if (!isValid) {
                event.preventDefault(); // Stop form submission if validation fails
            }
        });

        // Clear errors on input
        allRegisterInputs.forEach((input, index) => {
            const errorElement = allRegisterErrorSpans[index];
            input.addEventListener('input', () => clearSingleError(input, errorElement));
        });
    }

    // --- LOGIN FORM VALIDATION ---
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');

        loginForm.addEventListener('submit', function(event) {
            let isValid = true;
            clearErrors([emailError, passwordError], [emailInput, passwordInput]);

             // Email validation
            const emailValue = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailValue === '') {
                showError(emailInput, emailError, 'Email is required.');
                isValid = false;
            } else if (!emailRegex.test(emailValue)) {
                showError(emailInput, emailError, 'Please enter a valid email address.');
                isValid = false;
            }

            // Password validation
            const passwordValue = passwordInput.value;
            if (passwordValue === '') {
                showError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            }

            if (!isValid) {
                event.preventDefault(); // Stop form submission if validation fails
            }
        });

         // Clear errors on input
        [emailInput, passwordInput].forEach((input, index) => {
            const errorElement = [emailError, passwordError][index];
            input.addEventListener('input', () => clearSingleError(input, errorElement));
        });
    }


    // --- Helper Functions ---
    function showError(inputElement, errorElement, message) {
        inputElement.classList.add('invalid');
        errorElement.textContent = message;
    }

    function clearErrors(errorElements, inputElements) {
        errorElements.forEach(el => { if (el) el.textContent = ''; }); // Add check if element exists
        inputElements.forEach(el => { if (el) el.classList.remove('invalid'); }); // Add check if element exists
    }

    function clearSingleError(inputElement, errorElement) {
        if (inputElement && errorElement && inputElement.classList.contains('invalid')) { // Add checks
            inputElement.classList.remove('invalid');
            errorElement.textContent = '';
        }
    }

});