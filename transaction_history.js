// transaction_history.js

// Function to save transaction to history
function saveTransactionToHistory(transaction) {
    let history = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    history.push(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(history));
}

// Modified simulateMpesaPayment to include history saving
function simulateMpesaPayment() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (!phoneNumber || !amount || amount <= 0) {
        alert('Please enter valid phone number and amount');
        return;
    }

    let accountBalance = localStorage.getItem('accountBalance');
    if (!accountBalance) {
        accountBalance = 10000;
        localStorage.setItem('accountBalance',100000);
    } else {
        accountBalance = parseFloat(accountBalance);
    }

    if (amount > accountBalance) {
        alert('Insufficient funds. Current balance: KES ' + accountBalance);
        return;
    }

    const newBalance = accountBalance - amount;
    localStorage.setItem('accountBalance', newBalance);

    const transaction = {
        id: 'TX' + Date.now(),
        date: new Date().toLocaleString(),
        phone: phoneNumber,
        amount: amount,
        previousBalance: accountBalance,
        newBalance: newBalance,
        status: 'Completed'
    };

    saveTransactionToHistory(transaction); // Save to history
    updateBalanceDisplay(newBalance);
    generateTransactionHTML(transaction);
}

// Function to display transaction history
function displayTransactionHistory() {
    const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    const historyContainer = document.getElementById('transactionHistory');
    
    if (history.length === 0) {
        historyContainer.innerHTML = '<p>No transactions yet</p>';
        return;
    }

    let historyHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Phone</th>
                    <th>Amount (KES)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    history.forEach(tx => {
        historyHTML += `
            <tr>
                <td>${tx.id}</td>
                <td>${tx.date}</td>
                <td>${tx.phone}</td>
                <td>${tx.amount.toFixed(2)}</td>
                <td>${tx.status}</td>
            </tr>
        `;
    });

    historyHTML += '</tbody></table>';
    historyContainer.innerHTML = historyHTML;
}

// Update balance display
function updateBalanceDisplay(balance) {
    document.getElementById('currentBalance').textContent = 'KES ' + balance.toFixed(2);
}

// HTML structure for history page
const historyPageHTML = `
<div id="historyPage">
    <h2>M-Pesa Transaction History</h2>
    <p>Current Balance: <span id="currentBalance">KES 10000.00</span></p>
    <div id="paymentForm">
        <h3>New Transaction</h3>
        <form onsubmit="event.preventDefault(); simulateMpesaPayment();">
            <div>
                <label>Phone Number:</label><br>
                <input type="tel" id="phoneNumber" placeholder="07XXXXXXXX" required>
            </div>
            <div>
                <label>Amount (KES):</label><br>
                <input type="number" id="amount" min="1" step="0.01" required>
            </div>
            <button type="submit">Send Money</button>
        </form>
    </div>
    <p id="excesspayment"> </p>
    <div id="transactionHistory">
        <!-- Transaction history will be loaded here -->
    </div>
</div>

<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    #paymentForm { margin: 20px 0; padding: 15px; background: #f9f9f9; }
    input { margin: 5px 0; padding: 5px; }
    button { padding: 8px 15px; background: #4CAF50; color: white; border: none; }
</style>
`;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = historyPageHTML;
    
    const savedBalance = localStorage.getItem('accountBalance');
    if (savedBalance) {
        updateBalanceDisplay(parseFloat(savedBalance));
    }
    
    displayTransactionHistory();
});

// Include the generateTransactionHTML function from previous code
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

    const blob = new Blob([transactionHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mpesa_transaction_${transaction.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Refresh history after new transaction
    displayTransactionHistory();
}