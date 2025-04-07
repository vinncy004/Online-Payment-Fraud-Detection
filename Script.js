// Sample user data (in a real app, this would come from an API)
const users = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        behavior: {
            logins: [
                { time: "2023-06-01T08:15:00", device: "Desktop", location: "New York", ip: "192.168.1.1" },
                { time: "2023-06-02T08:20:00", device: "Desktop", location: "New York", ip: "192.168.1.1" },
                { time: "2023-06-03T08:10:00", device: "Desktop", location: "New York", ip: "192.168.1.1" },
                { time: "2023-06-04T08:05:00", device: "Desktop", location: "New York", ip: "192.168.1.1" },
                { time: "2023-06-05T08:30:00", device: "Desktop", location: "New York", ip: "192.168.1.1" },
                { time: "2023-06-06T03:45:00", device: "Mobile", location: "London", ip: "203.0.113.5" },
                { time: "2023-06-07T08:15:00", device: "Desktop", location: "New York", ip: "192.168.1.1" }
            ],
            devices: [
                { type: "Desktop", usage: 85, lastUsed: "2023-06-07T08:15:00" },
                { type: "Mobile", usage: 15, lastUsed: "2023-06-06T03:45:00" }
            ],
            spending: [
                { date: "2023-06-01", amount: 120.50, category: "Electronics" },
                { date: "2023-06-03", amount: 45.75, category: "Groceries" },
                { date: "2023-06-05", amount: 80.20, category: "Clothing" },
                { date: "2023-06-06", amount: 1200.00, category: "Electronics" },
                { date: "2023-06-07", amount: 25.30, category: "Food" }
            ]
        }
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        behavior: {
            logins: [
                { time: "2023-06-01T09:30:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-02T09:45:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-03T10:00:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-04T09:15:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-05T09:30:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-06T09:45:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" },
                { time: "2023-06-07T09:30:00", device: "Mobile", location: "Chicago", ip: "198.51.100.2" }
            ],
            devices: [
                { type: "Mobile", usage: 100, lastUsed: "2023-06-07T09:30:00" }
            ],
            spending: [
                { date: "2023-06-01", amount: 65.40, category: "Groceries" },
                { date: "2023-06-03", amount: 32.10, category: "Food" },
                { date: "2023-06-05", amount: 28.75, category: "Entertainment" },
                { date: "2023-06-07", amount: 45.60, category: "Clothing" }
            ]
        }
    }
];

// DOM Elements
const userSelect = document.getElementById('userSelect');
const analyzeBtn = document.getElementById('analyzeBtn');
const loginChartCtx = document.getElementById('loginChart').getContext('2d');
const deviceChartCtx = document.getElementById('deviceChart').getContext('2d');
const spendingChartCtx = document.getElementById('spendingChart').getContext('2d');
const loginAnomalies = document.getElementById('loginAnomalies');
const deviceAnomalies = document.getElementById('deviceAnomalies');
const spendingAnomalies = document.getElementById('spendingAnomalies');
const riskLevel = document.getElementById('riskLevel');
const riskScore = document.getElementById('riskScore');
const recommendation = document.getElementById('recommendation');
const suspiciousActivities = document.getElementById('suspiciousActivities');

// Charts
let loginChart, deviceChart, spendingChart;

// Initialize the app
function init() {
    populateUserDropdown();
    
    analyzeBtn.addEventListener('click', () => {
        const selectedUserId = userSelect.value;
        if (selectedUserId) {
            const user = users.find(u => u.id === parseInt(selectedUserId));
            analyzeUserBehavior(user);
        }
    });
}

// Populate user dropdown
function populateUserDropdown() {
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.email})`;
        userSelect.appendChild(option);
    });
}

// Main analysis function
function analyzeUserBehavior(user) {
    // Reset previous results
    resetDashboard();
    
    // Analyze behavior patterns
    const loginAnalysis = analyzeLoginPatterns(user.behavior.logins);
    const deviceAnalysis = analyzeDeviceUsage(user.behavior.devices);
    const spendingAnalysis = analyzeSpendingHabits(user.behavior.spending);
    
    // Visualize data
    visualizeLoginPatterns(user.behavior.logins, loginAnalysis.anomalies);
    visualizeDeviceUsage(user.behavior.devices);
    visualizeSpendingHabits(user.behavior.spending, spendingAnalysis.anomalies);
    
    // Display anomalies
    displayLoginAnomalies(loginAnalysis);
    displayDeviceAnomalies(deviceAnalysis);
    displaySpendingAnomalies(spendingAnalysis);
    
    // Calculate fraud risk
    calculateFraudRisk(loginAnalysis, deviceAnalysis, spendingAnalysis);
}

// Reset dashboard
function resetDashboard() {
    loginAnomalies.innerHTML = '';
    deviceAnomalies.innerHTML = '';
    spendingAnomalies.innerHTML = '';
    suspiciousActivities.innerHTML = '';
    
    if (loginChart) loginChart.destroy();
    if (deviceChart) deviceChart.destroy();
    if (spendingChart) spendingChart.destroy();
}

// Analyze login patterns
function analyzeLoginPatterns(logins) {
    const result = {
        totalLogins: logins.length,
        usualLoginTimes: [],
        locationChanges: 0,
        deviceChanges: 0,
        anomalies: []
    };
    
    // Group logins by hour
    const loginHours = logins.map(login => new Date(login.time).getHours());
    const hourCounts = {};
    loginHours.forEach(hour => {
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find usual login times (most common hours)
    const maxCount = Math.max(...Object.values(hourCounts));
    result.usualLoginTimes = Object.keys(hourCounts)
        .filter(hour => hourCounts[hour] === maxCount)
        .map(hour => `${hour}:00 - ${parseInt(hour)+1}:00`);
    
    // Check for location/device changes
    const uniqueLocations = new Set(logins.map(login => login.location));
    const uniqueDevices = new Set(logins.map(login => login.device));
    const uniqueIPs = new Set(logins.map(login => login.ip));
    
    result.locationChanges = uniqueLocations.size - 1;
    result.deviceChanges = uniqueDevices.size - 1;
    
    // Detect anomalies
    logins.forEach((login, index) => {
        const loginHour = new Date(login.time).getHours();
        const isUsualTime = result.usualLoginTimes.some(time => {
            const startHour = parseInt(time.split(':')[0]);
            return loginHour === startHour;
        });
        
        if (!isUsualTime) {
            result.anomalies.push({
                type: 'unusual_time',
                message: `Unusual login time at ${new Date(login.time).toLocaleTimeString()}`,
                severity: loginHour >= 1 && loginHour <= 5 ? 'high' : 'medium',
                data: login
            });
        }
        
        if (index > 0) {
            const prevLogin = logins[index - 1];
            if (login.location !== prevLogin.location && 
                new Date(login.time) - new Date(prevLogin.time) < 24 * 60 * 60 * 1000) {
                result.anomalies.push({
                    type: 'location_change',
                    message: `Rapid location change from ${prevLogin.location} to ${login.location}`,
                    severity: 'high',
                    data: login
                });
            }
            
            if (login.ip !== prevLogin.ip && login.device === prevLogin.device) {
                result.anomalies.push({
                    type: 'ip_change',
                    message: `IP address changed for same device (${login.device})`,
                    severity: 'medium',
                    data: login
                });
            }
        }
    });
    
    return result;
}

// Analyze device usage
function analyzeDeviceUsage(devices) {
    const result = {
        totalDevices: devices.length,
        primaryDevice: devices.reduce((prev, current) => 
            (prev.usage > current.usage) ? prev : current
        ),
        anomalies: []
    };
    
    if (devices.length > 1) {
        const secondaryDevices = devices.filter(d => d !== result.primaryDevice);
        secondaryDevices.forEach(device => {
            if (device.usage > 20) {
                result.anomalies.push({
                    type: 'secondary_device_usage',
                    message: `High usage (${device.usage}%) on secondary device (${device.type})`,
                    severity: 'medium',
                    data: device
                });
            }
        });
    }
    
    return result;
}

// Analyze spending habits
function analyzeSpendingHabits(spending) {
    const result = {
        totalSpending: spending.reduce((sum, item) => sum + item.amount, 0),
        averageSpending: 0,
        spendingCategories: {},
        anomalies: []
    };
    
    if (spending.length > 0) {
        result.averageSpending = result.totalSpending / spending.length;
        
        // Calculate spending by category
        spending.forEach(item => {
            result.spendingCategories[item.category] = 
                (result.spendingCategories[item.category] || 0) + item.amount;
        });
        
        // Detect anomalies
        const amounts = spending.map(item => item.amount);
        const mean = result.averageSpending;
        const stdDev = Math.sqrt(
            amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
        );
        
        spending.forEach(item => {
            const zScore = (item.amount - mean) / stdDev;
            if (zScore > 2) { // More than 2 standard deviations from mean
                result.anomalies.push({
                    type: 'unusual_spending',
                    message: `Unusually high spending of $${item.amount.toFixed(2)} on ${item.category}`,
                    severity: zScore > 3 ? 'high' : 'medium',
                    data: item
                });
            }
        });
    }
    
    return result;
}

// Visualize login patterns
function visualizeLoginPatterns(logins, anomalies) {
    const loginTimes = logins.map(login => new Date(login.time));
    const loginHours = loginTimes.map(time => time.getHours() + time.getMinutes() / 60);
    
    // Mark anomalous logins
    const anomalyIndices = anomalies.map(anomaly => 
        logins.findIndex(login => 
            anomaly.data.time === login.time && 
            anomaly.data.device === login.device
        )
    );
    
    const anomalyPoints = anomalyIndices.map(i => ({
        x: loginHours[i],
        y: 1
    }));
    
    loginChart = new Chart(loginChartCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Login Times',
                    data: loginHours.map((hour, i) => ({x: hour, y: 0})),
                    pointBackgroundColor: loginHours.map((hour, i) => 
                        anomalyIndices.includes(i) ? 'rgba(231, 76, 60, 0.8)' : 'rgba(52, 152, 219, 0.8)'
                    ),
                    pointRadius: 8,
                    showLine: true
                }
            ]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    },
                    min: 0,
                    max: 24,
                    ticks: {
                        stepSize: 2
                    }
                },
                y: {
                    display: false
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const login = logins[context.dataIndex];
                            return [
                                `Time: ${new Date(login.time).toLocaleString()}`,
                                `Device: ${login.device}`,
                                `Location: ${login.location}`,
                                `IP: ${login.ip}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Visualize device usage
function visualizeDeviceUsage(devices) {
    deviceChart = new Chart(deviceChartCtx, {
        type: 'doughnut',
        data: {
            labels: devices.map(d => d.type),
            datasets: [{
                data: devices.map(d => d.usage),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(46, 204, 113, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const device = devices[context.dataIndex];
                            return [
                                `Usage: ${device.usage}%`,
                                `Last used: ${new Date(device.lastUsed).toLocaleString()}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Visualize spending habits
function visualizeSpendingHabits(spending, anomalies) {
    const dates = spending.map(item => new Date(item.date));
    const amounts = spending.map(item => item.amount);
    
    // Mark anomalous transactions
    const anomalyIndices = anomalies.map(anomaly => 
        spending.findIndex(item => 
            anomaly.data.date === item.date && 
            anomaly.data.amount === item.amount
        )
    );
    
    spendingChart = new Chart(spendingChartCtx, {
        type: 'bar',
        data: {
            labels: dates.map(date => date.toLocaleDateString()),
            datasets: [{
                label: 'Spending Amount',
                data: amounts,
                backgroundColor: amounts.map((amount, i) => 
                    anomalyIndices.includes(i) ? 'rgba(231, 76, 60, 0.8)' : 'rgba(46, 204, 113, 0.8)'
                ),
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const item = spending[context.dataIndex];
                            return [
                                `Amount: $${item.amount.toFixed(2)}`,
                                `Category: ${item.category}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Display login anomalies
function displayLoginAnomalies(analysis) {
    if (analysis.anomalies.length === 0) {
        loginAnomalies.innerHTML = '<div class="alert alert-info">No unusual login patterns detected</div>';
        return;
    }
    
    loginAnomalies.innerHTML = '<h3>Login Anomalies</h3>';
    analysis.anomalies.forEach(anomaly => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${anomaly.severity === 'high' ? 'danger' : 'warning'}`;
        alert.textContent = anomaly.message;
        loginAnomalies.appendChild(alert);
    });
}

// Display device anomalies
function displayDeviceAnomalies(analysis) {
    if (analysis.anomalies.length === 0) {
        deviceAnomalies.innerHTML = '<div class="alert alert-info">No device anomalies detected</div>';
        return;
    }
    
    deviceAnomalies.innerHTML = '<h3>Device Anomalies</h3>';
    analysis.anomalies.forEach(anomaly => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${anomaly.severity === 'high' ? 'danger' : 'warning'}`;
        alert.textContent = anomaly.message;
        deviceAnomalies.appendChild(alert);
    });
}

// Display spending anomalies
function displaySpendingAnomalies(analysis) {
    if (analysis.anomalies.length === 0) {
        spendingAnomalies.innerHTML = '<div class="alert alert-info">No spending anomalies detected</div>';
        return;
    }
    
    spendingAnomalies.innerHTML = '<h3>Spending Anomalies</h3>';
    analysis.anomalies.forEach(anomaly => {
        const alert = document.createElement('div');
        alert.className = `alert alert-${anomaly.severity === 'high' ? 'danger' : 'warning'}`;
        alert.textContent = anomaly.message;
        spendingAnomalies.appendChild(alert);
    });
}

// Calculate fraud risk
function calculateFraudRisk(loginAnalysis, deviceAnalysis, spendingAnalysis) {
    let riskScoreValue = 0;
    const maxScore = 100;
    
    // Login risk factors
    riskScoreValue += loginAnalysis.anomalies.length * 5;
    riskScoreValue += loginAnalysis.locationChanges * 10;
    riskScoreValue += loginAnalysis.deviceChanges * 7;
    
    // Device risk factors
    riskScoreValue += deviceAnalysis.anomalies.length * 8;
    
    // Spending risk factors
    riskScoreValue += spendingAnalysis.anomalies.length * 12;
    
    // Cap the score
    riskScoreValue = Math.min(riskScoreValue, maxScore);
    
    // Update UI
    const percentage = (riskScoreValue / maxScore) * 100;
    riskLevel.style.width = `${percentage}%`;
    riskScore.textContent = `${riskScoreValue.toFixed(0)}/${maxScore}`;
    
    // Set risk level color
    if (riskScoreValue >= 70) {
        riskLevel.style.backgroundColor = 'var(--danger-color)';
        recommendation.textContent = 'HIGH RISK: Recommend additional verification or block transactions';
        recommendation.className = 'recommendation alert-danger';
    } else if (riskScoreValue >= 40) {
        riskLevel.style.backgroundColor = 'var(--warning-color)';
        recommendation.textContent = 'MEDIUM RISK: Recommend additional monitoring';
        recommendation.className = 'recommendation alert-warning';
    } else {
        riskLevel.style.backgroundColor = 'var(--secondary-color)';
        recommendation.textContent = 'LOW RISK: Normal user behavior detected';
        recommendation.className = 'recommendation alert-info';
    }
    
    // Show suspicious activities
    const allAnomalies = [
        ...loginAnalysis.anomalies,
        ...deviceAnalysis.anomalies,
        ...spendingAnalysis.anomalies
    ].sort((a, b) => b.severity.localeCompare(a.severity));
    
    if (allAnomalies.length > 0) {
        suspiciousActivities.innerHTML = '<h3>Suspicious Activities</h3>';
        allAnomalies.slice(0, 5).forEach(anomaly => {
            const activity = document.createElement('div');
            activity.className = 'suspicious-activity';
            activity.innerHTML = `
                <strong>${anomaly.type.replace('_', ' ').toUpperCase()}</strong>
                <p>${anomaly.message}</p>
                <small>Severity: ${anomaly.severity}</small>
            `;
            suspiciousActivities.appendChild(activity);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);