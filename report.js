// report.js

// Thresholds for analysis
const EXCESS_AMOUNT_THRESHOLD = 5000; // Flag transactions above 5,000 KES as excessive
const LATE_HOUR_THRESHOLD = 22; // 22:00 (10 PM) as unusual hour cutoff

// Function to analyze transactions and generate report
function generateReport() {
    const history = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    let excessiveTransactions = [];
    let lateTransactions = [];

    history.forEach(tx => {
        // Check for excessive amounts
        if (tx.amount > EXCESS_AMOUNT_THRESHOLD) {
            excessiveTransactions.push(tx);
        }

        // Check for unusual hours
        const txDate = new Date(tx.date);
        const hour = txDate.getHours();
        if (hour >= LATE_HOUR_THRESHOLD || hour < 6) { // Between 22:00 and 06:00
            lateTransactions.push(tx);
        }
    });

    const report = {
        generatedDate: new Date().toLocaleString(),
        excessiveCount: excessiveTransactions.length,
        lateCount: lateTransactions.length,
        excessiveTransactions: excessiveTransactions,
        lateTransactions: lateTransactions,
        alerts: []
    };

    // Generate alerts
    if (excessiveTransactions.length > 0) {
        report.alerts.push(`WARNING: ${excessiveTransactions.length} transactions exceed KES ${EXCESS_AMOUNT_THRESHOLD}`);
    }
    if (lateTransactions.length > 0) {
        report.alerts.push(`WARNING: ${lateTransactions.length} transactions occurred after ${LATE_HOUR_THRESHOLD}:00`);
    }

    // Save report to localStorage
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));

    return report;
}

// Function to display report
function displayReport(report) {
    const reportContainer = document.getElementById('reportContainer');
    let reportHTML = `
        <h2>Transaction Report</h2>
        <p><strong>Generated:</strong> ${report.generatedDate}</p>
        <h3>Excessive Transactions (> KES ${EXCESS_AMOUNT_THRESHOLD})</h3>
        <p>Total: ${report.excessiveCount}</p>
    `;

    if (report.excessiveCount > 0) {
        reportHTML += `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Phone</th>
                        <th>Amount (KES)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        report.excessiveTransactions.forEach(tx => {
            reportHTML += `
                <tr>
                    <td>${tx.id}</td>
                    <td>${tx.date}</td>
                    <td>${tx.phone}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        reportHTML += '</tbody></table>';
    } else {
        reportHTML += '<p>No excessive transactions found.</p>';
    }

    reportHTML += `
        <h3>Late Transactions (After ${LATE_HOUR_THRESHOLD}:00)</h3>
        <p>Total: ${report.lateCount}</p>
    `;

    if (report.lateCount > 0) {
        reportHTML += `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Phone</th>
                        <th>Amount (KES)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        report.lateTransactions.forEach(tx => {
            reportHTML += `
                <tr>
                    <td>${tx.id}</td>
                    <td>${tx.date}</td>
                    <td>${tx.phone}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        reportHTML += '</tbody></table>';
    } else {
        reportHTML += '<p>No late transactions found.</p>';
    }

    if (report.alerts.length > 0) {
        reportHTML += '<h3>Alerts</h3><ul>';
        report.alerts.forEach(alert => {
            reportHTML += `<li class="alert">${alert}</li>`;
        });
        reportHTML += '</ul>';
    }

    reportContainer.innerHTML = reportHTML;
}

// Function to display all saved reports
function displayAllReports() {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    const historyContainer = document.getElementById('reportHistory');
    
    if (reports.length === 0) {
        historyContainer.innerHTML = '<p>No reports generated yet.</p>';
        return;
    }

    let historyHTML = '<h3>Report History</h3>';
    reports.forEach((report, index) => {
        historyHTML += `
            <div class="report-summary">
                <p><strong>Report ${index + 1}:</strong> ${report.generatedDate}</p>
                <p>Excessive: ${report.excessiveCount} | Late: ${report.lateCount}</p>
            </div>
        `;
    });
    historyContainer.innerHTML = historyHTML;
}

// HTML structure for report page
const reportPageHTML = `
<div id="reportPage">
    <h1>M-Pesa Transaction Reports</h1>
    <button onclick="generateAndDisplayReport()">Generate New Report</button>
    <div id="reportContainer">
        <!-- Latest report will be displayed here -->
    </div>
    <div id="reportHistory">
        <!-- Report history will be loaded here -->
    </div>
</div>

<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    button { padding: 10px 20px; background: #4CAF50; color: white; border: none; margin: 10px 0; }
    .alert { color: red; }
    .report-summary { border: 1px solid #ddd; padding: 10px; margin: 5px 0; background: #f9f9f9; }
</style>
`;

// Helper function to generate and display report
function generateAndDisplayReport() {
    const report = generateReport();
    displayReport(report);
    displayAllReports();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = reportPageHTML;
    displayAllReports(); // Show existing reports on load
});