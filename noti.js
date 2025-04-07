document.addEventListener('DOMContentLoaded', function() {
    
    const alertType = document.getElementById('alert-type');
    const alertSubject = document.getElementById('alert-subject');
    const alertMessage = document.getElementById('alert-message');
    const sendEmail = document.getElementById('send-email');
    const sendSms = document.getElementById('send-sms');
    const emailRecipient = document.getElementById('email-recipient');
    const smsRecipient = document.getElementById('sms-recipient');
    const sendBtn = document.getElementById('send-alert');
    const testBtn = document.getElementById('test-alert');
    const historyFilter = document.getElementById('history-filter');
    const clearHistoryBtn = document.getElementById('clear-history');
    const notificationList = document.getElementById('notification-list');
    const statusAlert = document.getElementById('status-alert');

    let notifications = JSON.parse(localStorage.getItem('fraudNotifications')) || [];
    function init() {
        
        alertType.addEventListener('change', updateAlertTemplate);
        
        
        sendBtn.addEventListener('click', sendAlert);
        testBtn.addEventListener('click', sendTestAlert);
        clearHistoryBtn.addEventListener('click', clearHistory);
        historyFilter.addEventListener('change', filterNotifications);
        
        
        renderNotifications();
        
        
        updateAlertTemplate();
    }

    
    function updateAlertTemplate() {
        switch(alertType.value) {
            case 'high-risk':
                alertSubject.value = 'URGENT: High Risk Transaction Detected';
                alertMessage.value = 'A high risk transaction has been detected:\n\nTransaction ID: \nAmount: \nAccount: \n\nAction Required: Please review immediately.';
                break;
            case 'suspicious-login':
                alertSubject.value = 'Suspicious Login Attempt';
                alertMessage.value = 'A suspicious login attempt was detected:\n\nAccount: \nLocation: \nDevice: \nTime: \n\nIf this was not you, please secure your account immediately.';
                break;
            case 'account-takeover':
                alertSubject.value = 'Possible Account Takeover Attempt';
                alertMessage.value = 'We detected unusual activity that may indicate an account takeover attempt:\n\nAccount: \nSuspicious Activities: \n\nPlease verify your account security settings.';
                break;
            case 'custom':
                alertSubject.value = '';
                alertMessage.value = '';
                break;
        }
    }

    
    function sendAlert() {
        const isTest = false;
        processAlert(isTest);
    }

    
    function sendTestAlert() {
        const isTest = true;
        processAlert(isTest);
    }

   
    function processAlert(isTest) {
        const subject = alertSubject.value.trim();
        const message = alertMessage.value.trim();
        const email = emailRecipient.value.trim();
        const sms = smsRecipient.value.trim();
        
        if (!subject || !message) {
            showAlert('Please enter both subject and message', true);
            return;
        }
        
        if (!sendEmail.checked && !sendSms.checked) {
            showAlert('Please select at least one notification channel', true);
            return;
        }
        
        const prefix = isTest ? '[TEST] ' : '';
        const notificationType = isTest ? 'test' : alertType.value;
        
        
        const notification = {
            id: Date.now(),
            type: notificationType,
            subject: prefix + subject,
            message: message,
            channels: [],
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        
        const promises = [];
        
        if (sendEmail.checked && email) {
            promises.push(sendEmailNotification(email, prefix + subject, message));
            notification.channels.push('email');
        }
        
        if (sendSms.checked && sms) {
            const smsText = (prefix + subject + ': ' + message).substring(0, 160);
            promises.push(sendSmsNotification(sms, smsText));
            notification.channels.push('sms');
        }
        
        if (promises.length === 0) {
            showAlert('No valid recipients specified', true);
            return;
        }
        
        Promise.all(promises)
            .then(() => {
             
                notifications.unshift(notification);
                saveNotifications();
                renderNotifications();
                
              
                const successMsg = isTest 
                    ? 'Test notifications sent successfully!'
                    : 'Alert notifications sent successfully!';
                showAlert(successMsg);
            })
            .catch(error => {
                console.error('Failed to send notifications:', error);
                notification.status = 'failed';
                notifications.unshift(notification);
                saveNotifications();
                renderNotifications();
                showAlert('Failed to send notifications: ' + error.message, true);
            });
    }

    function sendEmailNotification(email, subject, message) {
        return new Promise((resolve) => {

            console.log(`Sending email to: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Message: ${message}`);
            
            setTimeout(() => {

                const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                console.log('Email link:', mailtoLink);
                
 
                resolve({ success: true, channel: 'email' });
            }, 1000);
        });
    }

   
    function sendSmsNotification(phone, message) {
        return new Promise((resolve) => {
  
            console.log(`Sending SMS to: ${phone}`);
            console.log(`Message: ${message}`);
       
            setTimeout(() => {
                
                const smsLink = `sms:${phone}?body=${encodeURIComponent(message)}`;
                console.log('SMS link:', smsLink);
                

                resolve({ success: true, channel: 'sms' });
            }, 1000);
        });
    }

  
    function renderNotifications() {
        notificationList.innerHTML = '';
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No notifications found</div>';
            return;
        }
        
        notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            
            let icons = '';
            if (notification.channels.includes('email')) {
                icons += '<i class="fas fa-envelope email notification-icon"></i>';
            }
            if (notification.channels.includes('sms')) {
                icons += '<i class="fas fa-sms sms notification-icon"></i>';
            }
            
            const date = new Date(notification.timestamp);
            const formattedDate = date.toLocaleString();
            
            notificationItem.innerHTML = `
                <div class="notification-icons">${icons}</div>
                <div class="notification-content">
                    <div class="notification-title">
                        <span>${notification.subject}</span>
                        <span class="notification-date">${formattedDate}</span>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span>Type: ${notification.type}</span>
                        <span>Status: ${notification.status}</span>
                    </div>
                </div>
            `;
            
            notificationList.appendChild(notificationItem);
        });
    }

    
    function filterNotifications() {
        const filter = historyFilter.value;
        let filtered = notifications;
        
        if (filter === 'email') {
            filtered = notifications.filter(n => n.channels.includes('email'));
        } else if (filter === 'sms') {
            filtered = notifications.filter(n => n.channels.includes('sms'));
        } else if (filter === 'today') {
            const today = new Date().toDateString();
            filtered = notifications.filter(n => 
                new Date(n.timestamp).toDateString() === today
            );
        }
        
        renderFilteredNotifications(filtered);
    }

   
    function renderFilteredNotifications(filteredNotifications) {
        notificationList.innerHTML = '';
        
        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">No matching notifications found</div>';
            return;
        }
        
        filteredNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = 'notification-item';
            
            let icons = '';
            if (notification.channels.includes('email')) {
                icons += '<i class="fas fa-envelope email notification-icon"></i>';
            }
            if (notification.channels.includes('sms')) {
                icons += '<i class="fas fa-sms sms notification-icon"></i>';
            }
            
            const date = new Date(notification.timestamp);
            const formattedDate = date.toLocaleString();
            
            notificationItem.innerHTML = `
                <div class="notification-icons">${icons}</div>
                <div class="notification-content">
                    <div class="notification-title">
                        <span>${notification.subject}</span>
                        <span class="notification-date">${formattedDate}</span>
                    </div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-meta">
                        <span>Type: ${notification.type}</span>
                        <span>Status: ${notification.status}</span>
                    </div>
                </div>
            `;
            
            notificationList.appendChild(notificationItem);
        });
    }

   
    function clearHistory() {
        if (confirm('Are you sure you want to clear all notification history?')) {
            notifications = [];
            saveNotifications();
            renderNotifications();
            showAlert('Notification history cleared');
        }
    }

    
    function saveNotifications() {
        localStorage.setItem('fraudNotifications', JSON.stringify(notifications));
    }

 
    function showAlert(message, isError = false) {
        statusAlert.textContent = message;
        statusAlert.className = 'status-alert' + (isError ? ' error' : '');
        statusAlert.classList.add('show');
        
        setTimeout(() => {
            statusAlert.classList.remove('show');
        }, 3000);
    }


    init();
});