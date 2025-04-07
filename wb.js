document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const entityType = document.getElementById('entity-type');
    const addManualBtn = document.getElementById('add-manual');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const entityTable = document.getElementById('entity-table').getElementsByTagName('tbody')[0];
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const addEntityModal = document.getElementById('add-entity-modal');
    const entityDetailModal = document.getElementById('entity-detail-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const entityForm = document.getElementById('entity-form');
    const entityTypeInput = document.getElementById('entity-type-input');
    const statusAlert = document.getElementById('status-alert');

    // Entity type fields
    const userFields = document.getElementById('user-fields');
    const deviceFields = document.getElementById('device-fields');
    const paymentFields = document.getElementById('payment-fields');
    const ipFields = document.getElementById('ip-fields');

    // Sample data (in a real app, this would come from an API)
    let entities = [
        {
            id: 'U1001',
            type: 'user',
            details: {
                email: 'user1@example.com',
                phone: '254712345678',
                userId: 'U1001'
            },
            status: 'blacklisted',
            reason: 'Multiple chargebacks',
            dateAdded: '2023-06-10T14:30:00',
            lastActivity: '2023-06-15T09:45:00',
            addedBy: 'admin1'
        },
        {
            id: 'D2001',
            type: 'device',
            details: {
                deviceId: 'D2001',
                deviceType: 'iPhone 13',
                os: 'iOS 15',
                ipAddress: '192.168.1.100'
            },
            status: 'whitelisted',
            reason: 'Verified executive device',
            dateAdded: '2023-06-05T10:15:00',
            lastActivity: '2023-06-15T14:20:00',
            addedBy: 'admin2'
        },
        {
            id: 'P3001',
            type: 'payment',
            details: {
                paymentId: 'P3001',
                paymentType: 'credit_card',
                last4: '4242',
                issuer: 'Visa'
            },
            status: 'blacklisted',
            reason: 'Stolen card reported',
            dateAdded: '2023-06-12T16:45:00',
            lastActivity: '2023-06-12T16:45:00',
            addedBy: 'admin1'
        },
        {
            id: '203.0.113.45',
            type: 'ip',
            details: {
                ipAddress: '203.0.113.45',
                location: 'Unknown',
                isp: 'Unknown',
                country: 'Unknown'
            },
            status: 'blacklisted',
            reason: 'Known fraud origin',
            dateAdded: '2023-05-30T08:20:00',
            lastActivity: '2023-06-14T03:15:00',
            addedBy: 'admin3'
        }
    ];

    // Pagination variables
    let currentPage = 1;
    const itemsPerPage = 10;

    // Initialize the application
    function init() {
        // Set up event listeners
        addManualBtn.addEventListener('click', () => addEntityModal.style.display = 'block');
        entityType.addEventListener('change', filterEntities);
        searchInput.addEventListener('input', filterEntities);
        statusFilter.addEventListener('change', filterEntities);
        prevPageBtn.addEventListener('click', goToPrevPage);
        nextPageBtn.addEventListener('click', goToNextPage);
        
        // Modal events
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                addEntityModal.style.display = 'none';
                entityDetailModal.style.display = 'none';
            });
        });
        
        // Entity type change in form
        entityTypeInput.addEventListener('change', showRelevantFields);
        
        // Form submission
        entityForm.addEventListener('submit', handleFormSubmit);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addEntityModal) addEntityModal.style.display = 'none';
            if (e.target === entityDetailModal) entityDetailModal.style.display = 'none';
        });
        
        // Load initial data
        filterEntities();
    }

    // Filter entities based on selections
    function filterEntities() {
        const type = entityType.value;
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        
        let filtered = entities;
        
        // Filter by type
        if (type !== 'all') {
            filtered = filtered.filter(e => e.type === type);
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(e => 
                JSON.stringify(e).toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by status
        if (status !== 'all') {
            filtered = filtered.filter(e => e.status === status);
        }
        
        renderEntityTable(filtered);
    }

    // Render entity table
    function renderEntityTable(data) {
        entityTable.innerHTML = '';
        
        if (data.length === 0) {
            const row = entityTable.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = 'No entities found';
            cell.style.textAlign = 'center';
            return;
        }
        
        // Pagination
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
        
        // Update pagination info
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        
        // Create rows
        paginatedData.forEach(entity => {
            const row = entityTable.insertRow();
            
            // ID
            const idCell = row.insertCell();
            idCell.textContent = entity.id;
            
            // Type
            const typeCell = row.insertCell();
            typeCell.textContent = entity.type.charAt(0).toUpperCase() + entity.type.slice(1);
            
            // Details
            const detailsCell = row.insertCell();
            detailsCell.textContent = getEntitySummary(entity);
            
            // Status
            const statusCell = row.insertCell();
            const statusBadge = document.createElement('span');
            statusBadge.className = `status-badge status-${entity.status}`;
            statusBadge.textContent = entity.status.charAt(0).toUpperCase() + entity.status.slice(1);
            statusCell.appendChild(statusBadge);
            
            // Date Added
            const dateCell = row.insertCell();
            dateCell.textContent = new Date(entity.dateAdded).toLocaleString();
            
            // Last Activity
            const activityCell = row.insertCell();
            activityCell.textContent = new Date(entity.lastActivity).toLocaleString();
            
            // Actions
            const actionCell = row.insertCell();
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'action-btn btn-view';
            viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
            viewBtn.title = 'View Details';
            viewBtn.addEventListener('click', () => showEntityDetails(entity));
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn btn-edit';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit Entity';
            editBtn.addEventListener('click', () => editEntity(entity));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn btn-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete Entity';
            deleteBtn.addEventListener('click', () => deleteEntity(entity.id));
            
            actionCell.appendChild(viewBtn);
            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
        });
    }

    // Get summary text for entity
    function getEntitySummary(entity) {
        switch(entity.type) {
            case 'user':
                return `User: ${entity.details.email}`;
            case 'device':
                return `Device: ${entity.details.deviceType} (${entity.details.os})`;
            case 'payment':
                return `Payment: ${entity.details.paymentType} ****${entity.details.last4}`;
            case 'ip':
                return `IP: ${entity.details.ipAddress}`;
            default:
                return entity.id;
        }
    }

    // Show relevant fields based on entity type
    function showRelevantFields() {
        const type = entityTypeInput.value;
        
        // Hide all fields first
        userFields.style.display = 'none';
        deviceFields.style.display = 'none';
        paymentFields.style.display = 'none';
        ipFields.style.display = 'none';
        
        // Show relevant fields
        if (type === 'user') {
            userFields.style.display = 'block';
        } else if (type === 'device') {
            deviceFields.style.display = 'block';
        } else if (type === 'payment') {
            paymentFields.style.display = 'block';
        } else if (type === 'ip') {
            ipFields.style.display = 'block';
        }
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const type = entityTypeInput.value;
        const action = document.querySelector('input[name="entity-action"]:checked').value;
        const reason = document.getElementById('entity-reason').value;
        
        // Create new entity based on type
        const newEntity = {
            id: '',
            type: type,
            status: action + 'ed', // blacklisted or whitelisted
            reason: reason,
            dateAdded: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            addedBy: 'current_admin', // In real app, get from auth
            details: {}
        };
        
        // Set ID and details based on type
        if (type === 'user') {
            newEntity.id = document.getElementById('user-id').value || 'U' + Date.now().toString().slice(-4);
            newEntity.details = {
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                userId: newEntity.id
            };
        } else if (type === 'device') {
            newEntity.id = document.getElementById('device-id').value || 'D' + Date.now().toString().slice(-4);
            newEntity.details = {
                deviceId: newEntity.id,
                deviceType: document.getElementById('device-type').value,
                os: document.getElementById('device-os').value,
                ipAddress: 'Unknown'
            };
        } else if (type === 'payment') {
            newEntity.id = document.getElementById('payment-id').value || 'P' + Date.now().toString().slice(-4);
            newEntity.details = {
                paymentId: newEntity.id,
                paymentType: document.getElementById('payment-type').value,
                last4: document.getElementById('payment-last4').value,
                issuer: 'Unknown'
            };
        } else if (type === 'ip') {
            newEntity.id = document.getElementById('ip-address').value;
            newEntity.details = {
                ipAddress: newEntity.id,
                location: document.getElementById('ip-location').value,
                isp: document.getElementById('ip-isp').value,
                country: 'Unknown'
            };
        }
        
        // Add to entities array
        entities.unshift(newEntity);
        
        // Close modal and reset form
        addEntityModal.style.display = 'none';
        entityForm.reset();
        
        // Refresh table
        filterEntities();
        
        // Show success message
        showAlert(`${type} ${newEntity.id} has been ${newEntity.status} successfully!`);
    }

    // Show entity details
    function showEntityDetails(entity) {
        const detailContent = document.getElementById('entity-details');
        detailContent.innerHTML = '';
        
        document.getElementById('detail-title').innerHTML = 
            `<i class="fas fa-info-circle"></i> ${entity.type.toUpperCase()} Details: ${entity.id}`;
        
        // Create detail items
        const typeItem = createDetailItem('Type', entity.type);
        const statusItem = createDetailItem('Status', entity.status);
        const reasonItem = createDetailItem('Reason', entity.reason);
        const dateAddedItem = createDetailItem('Date Added', new Date(entity.dateAdded).toLocaleString());
        const lastActivityItem = createDetailItem('Last Activity', new Date(entity.lastActivity).toLocaleString());
        const addedByItem = createDetailItem('Added By', entity.addedBy);
        
        detailContent.appendChild(typeItem);
        detailContent.appendChild(statusItem);
        detailContent.appendChild(reasonItem);
        detailContent.appendChild(dateAddedItem);
        detailContent.appendChild(lastActivityItem);
        detailContent.appendChild(addedByItem);
        
        // Add type-specific details
        const detailsHeader = document.createElement('h3');
        detailsHeader.textContent = 'Details';
        detailContent.appendChild(detailsHeader);
        
        for (const [key, value] of Object.entries(entity.details)) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            detailContent.appendChild(createDetailItem(formattedKey, value));
        }
        
        entityDetailModal.style.display = 'block';
    }

    // Create a detail item
    function createDetailItem(label, value) {
        const item = document.createElement('div');
        item.className = 'detail-item';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        
        const valueEl = document.createElement('p');
        valueEl.textContent = value || 'N/A';
        
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        
        return item;
    }

    // Edit entity
    function editEntity(entity) {
        // In a real app, this would open an edit form
        showAlert(`Editing ${entity.type} ${entity.id} would open here`, false);
    }

    // Delete entity
    function deleteEntity(id) {
        if (confirm(`Are you sure you want to remove entity ${id}?`)) {
            entities = entities.filter(e => e.id !== id);
            filterEntities();
            showAlert(`Entity ${id} has been removed`);
        }
    }

    // Pagination functions
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            filterEntities();
        }
    }

    function goToNextPage() {
        const filtered = getFilteredEntities();
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            filterEntities();
        }
    }

    // Get currently filtered entities
    function getFilteredEntities() {
        const type = entityType.value;
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        
        let filtered = entities;
        
        if (type !== 'all') {
            filtered = filtered.filter(e => e.type === type);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(e => 
                JSON.stringify(e).toLowerCase().includes(searchTerm)
            );
        }
        
        if (status !== 'all') {
            filtered = filtered.filter(e => e.status === status);
        }
        
        return filtered;
    }

    // Show status alert
    function showAlert(message, isError = false) {
        statusAlert.textContent = message;
        statusAlert.className = 'status-alert' + (isError ? ' error' : '');
        statusAlert.classList.add('show');
        
        setTimeout(() => {
            statusAlert.classList.remove('show');
        }, 3000);
    }

    // Initialize the application
    init();
});