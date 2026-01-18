// Store all exceptions in memory
let exceptions = [];
let exceptionIdCounter = 0;

// DOM elements
const form = document.querySelector('#exceptionForm');
const tableBody = document.querySelector('#tableBody');
const filterIssueType = document.querySelector('#filterIssueType');
const filterStatus = document.querySelector('#filterStatus');
const openCountElement = document.querySelector('#openCount');
const resolvedCountElement = document.querySelector('#resolvedCount');

// Form submission handler
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const deliveryId = document.querySelector('#deliveryId').value.trim();
    const customerName = document.querySelector('#customerName').value.trim();
    const issueType = document.querySelector('#issueType').value;
    const priority = document.querySelector('input[name="priority"]:checked')?.value;
    const notes = document.querySelector('#notes').value.trim();
    
    // Validate required fields
    if (!deliveryId || !customerName || !issueType || !priority) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Create exception object
    const exception = {
        id: exceptionIdCounter++,
        deliveryId: deliveryId,
        customerName: customerName,
        issueType: issueType,
        priority: priority,
        status: 'Open',
        notes: notes
    };
    
    // Add to exceptions array
    exceptions.push(exception);
    
    // Add to table
    addRowToTable(exception);
    
    // Update stats
    updateStats();
    
    // Reset form
    form.reset();
});

// Add row to table
function addRowToTable(exception) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', exception.id);
    row.setAttribute('data-issue-type', exception.issueType);
    row.setAttribute('data-status', exception.status);
    
    // Add high-priority class if priority is High
    if (exception.priority === 'High') {
        row.classList.add('high-priority');
    }
    
    // Add resolved class if status is Resolved
    if (exception.status === 'Resolved') {
        row.classList.add('resolved-row');
    }
    
    row.innerHTML = `
        <td>${escapeHtml(exception.deliveryId)}</td>
        <td>${escapeHtml(exception.customerName)}</td>
        <td>${escapeHtml(exception.issueType)}</td>
        <td><span class="priority-badge priority-${exception.priority.toLowerCase()}">${exception.priority}</span></td>
        <td><span class="status-badge status-${exception.status.toLowerCase()}">${exception.status}</span></td>
        <td>${escapeHtml(exception.notes || '-')}</td>
        <td class="actions-cell">
            <button class="btn btn-resolve" data-id="${exception.id}" ${exception.status === 'Resolved' ? 'disabled' : ''}>Resolve</button>
            <button class="btn btn-delete" data-id="${exception.id}">Delete</button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event delegation for table actions
tableBody.addEventListener('click', function(e) {
    const target = e.target;
    const exceptionId = parseInt(target.getAttribute('data-id'));
    
    if (target.classList.contains('btn-resolve')) {
        resolveException(exceptionId);
    } else if (target.classList.contains('btn-delete')) {
        deleteException(exceptionId);
    }
});

// Resolve exception
function resolveException(id) {
    const exception = exceptions.find(exp => exp.id === id);
    if (!exception || exception.status === 'Resolved') {
        return;
    }
    
    // Update status
    exception.status = 'Resolved';
    
    // Find and update row
    const row = tableBody.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.setAttribute('data-status', 'Resolved');
        row.classList.add('resolved-row');
        
        // Update status badge
        const statusCell = row.querySelector('td:nth-child(5)');
        statusCell.innerHTML = '<span class="status-badge status-resolved">Resolved</span>';
        
        // Disable resolve button
        const resolveBtn = row.querySelector('.btn-resolve');
        resolveBtn.disabled = true;
    }
    
    // Update stats
    updateStats();
    
    // Reapply filters
    applyFilters();
}

// Delete exception
function deleteException(id) {
    // Confirmation prompt
    if (!confirm('Are you sure you want to delete this exception?')) {
        return;
    }
    
    // Remove from array
    exceptions = exceptions.filter(exp => exp.id !== id);
    
    // Remove from table
    const row = tableBody.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.remove();
    }
    
    // Update stats
    updateStats();
}

// Filter handlers
filterIssueType.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);

// Apply filters
function applyFilters() {
    const selectedIssueType = filterIssueType.value;
    const selectedStatus = filterStatus.value;
    
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const issueType = row.getAttribute('data-issue-type');
        const status = row.getAttribute('data-status');
        
        let show = true;
        
        if (selectedIssueType && issueType !== selectedIssueType) {
            show = false;
        }
        
        if (selectedStatus && status !== selectedStatus) {
            show = false;
        }
        
        if (show) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update statistics
function updateStats() {
    const openCount = exceptions.filter(exp => exp.status === 'Open').length;
    const resolvedCount = exceptions.filter(exp => exp.status === 'Resolved').length;
    
    openCountElement.textContent = openCount;
    resolvedCountElement.textContent = resolvedCount;
}

// Initialize
updateStats();

