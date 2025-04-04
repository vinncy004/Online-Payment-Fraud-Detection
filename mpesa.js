// Payment simulation function
function simulateMpesaPayment() {
    // Get form elements
    const phoneNumber = document.getElementById('phoneNumber').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    // Basic input validation
    if (!phoneNumber || !amount || amount <= 0) {
        alert('Please enter valid phone number and amount');
        return;
    }

    // Get or initialize account balance from localStorage
    let accountBalance = localStorage.getItem('accountBalance');
    if (!accountBalance) {
        accountBalance = 100000; // Initial balance of 10,0000
        localStorage.setItem('accountBalance', accountBalance);
    } else {
        accountBalance = parseFloat(accountBalance);
    }

    // Check if sufficient balance
    if (amount > accountBalance) {
        alert('Insufficient funds. Current balance: KES ' + accountBalance);
        return;
    }

    // Process payment
    const newBalance = accountBalance - amount;
    localStorage.setItem('accountBalance', newBalance);

    // Generate transaction details
    const transaction = {
        id: 'T' + Date.now()+'x',
        date: new Date().toLocaleString(),
        phone: phoneNumber,
        amount: amount,
        previousBalance: accountBalance,
        newBalance: newBalance,
        status: 'Completed'
    };

    // Update UI
    updateBalanceDisplay(newBalance);
    generateTransactionHTML(transaction);
}

// Update balance display
function updateBalanceDisplay(balance) {
    document.getElementById('currentBalance').textContent = 'KES ' + balance.toFixed(2);
}

// Generate and save transaction HTML
function generateTransactionHTML(transaction) {
    const transactionHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>M-Pesa Transaction Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .receipt { border: 1px solid #000; padding: 20px; max-width: 400px; }
        .success { color: green; }
    </style>
</head>
<body>
    <div class="receipt">
        <h2>M-Pesa Transaction Receipt</h2>
        <p><strong>Transaction ID:</strong> ${transaction.id}</p>
        <p><strong>Date:</strong> ${transaction.date}</p>
        <p><strong>Phone Number:</strong> ${transaction.phone}</p>
        <p><strong>Amount:</strong> KES ${transaction.amount.toFixed(2)}</p>
        <p><strong>Previous Balance:</strong> KES ${transaction.previousBalance.toFixed(2)}</p>
        <p><strong>New Balance:</strong> KES ${transaction.newBalance.toFixed(2)}</p>
        <p class="success"><strong>Status:</strong> ${transaction.status}</p>
    </div>
</body>
</html>
    `;

    // Create and download the HTML file
    const blob = new Blob([transactionHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mpesa_transaction_${transaction.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Initial HTML setup
const htmlForm = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body{
            margin-left: 20px;
            color: black;
        }
        #mpesaForm{
            border: 1px solid black;
            margin-left:30%;
            width: 40vw;
            text-align: center;

        }
        form{
            margin-left: 10px;

        }
    </style>
</head>
<body>
    <div id="mpesaForm">
        <h2>M-Pesa Payment Simulator</h2>
        <p>Current Balance: <span id="currentBalance">KES 10000.00</span></p>
        <form onsubmit="event.preventDefault(); simulateMpesaPayment();">
            <div>
                <label>Phone Number:</label><br><br>
                <input type="tel" id="phoneNumber" placeholder="07XXXXXXXX" required>
            </div>
            <br>
            <div>
                <label>Amount (KES):</label><br><br>
                <input type="number" id="amount" min="1" step="0.01" required>
            </div>
            <br><br>
            <button type="submit">Send Money</button>
            <br><br><br>
        </form>
    </div>
</body>
</html>
`;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = htmlForm;
    const savedBalance = localStorage.getItem('accountBalance');
    if (savedBalance) {
        updateBalanceDisplay(parseFloat(savedBalance));
    }
});