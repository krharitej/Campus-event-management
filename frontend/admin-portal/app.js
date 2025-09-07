class AdminPortal {
    constructor() {
        this.apiBase = 'http://localhost:3000';
        this.token = localStorage.getItem('admin_token');
        this.currentUser = null;
        this.currentCollege = null;
        this.colleges = {
            'MIT': { id: '11111111-1111-1111-1111-111111111111', name: 'Massachusetts Institute of Technology' },
            'STANFORD': { id: '22222222-2222-2222-2222-222222222222', name: 'Stanford University' },
            'IITD': { id: '33333333-3333-3333-3333-333333333333', name: 'Indian Institute of Technology Delhi' }
        };
        this.categories = [
            { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Hackathon', color: '#e74c3c' },
            { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'Workshop', color: '#3498db' },
            { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Tech Talk', color: '#2ecc71' },
            { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'Fest', color: '#f39c12' },
            { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Seminar', color: '#9b59b6' }
        ];
        this.currentEvents = [];
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateCategories();
        if (this.token) {
            this.showApp();
            this.loadDashboard();
        } else {
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.navigate(e.target.dataset.page));
        });
        
        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Create event buttons
        document.getElementById('create-event-btn').addEventListener('click', () => this.openEventModal());
        document.getElementById('add-event-btn').addEventListener('click', () => this.openEventModal());
        
        // Event form
        document.getElementById('event-form').addEventListener('submit', (e) => this.handleEventSubmit(e));
        
        // Modal close
        document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.filterEvents());
        document.getElementById('category-filter').addEventListener('change', () => this.filterEvents());
        
        // Add user button
        document.getElementById('add-user-btn').addEventListener('click', () => this.showAddUserForm());
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const college = document.getElementById('college-select').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!college || !email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call - In real app, this would be an actual API call
            const validCredentials = this.validateCredentials(college, email, password);
            
            if (validCredentials) {
                // Simulate JWT token
                const token = 'mock_jwt_token_' + Date.now();
                localStorage.setItem('admin_token', token);
                this.token = token;
                this.currentCollege = college;
                
                document.getElementById('college-name').textContent = this.colleges[college].name;
                
                this.showApp();
                this.loadDashboard();
                this.showToast('Login successful', 'success');
            } else {
                this.showError('Invalid credentials');
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    validateCredentials(college, email, password) {
        const validUsers = [
            { email: 'admin@mit.edu', password: 'password123', college: 'MIT' },
            { email: 'admin@stanford.edu', password: 'password123', college: 'STANFORD' },
            { email: 'admin@iitd.ac.in', password: 'password123', college: 'IITD' }
        ];
        
        return validUsers.some(user => 
            user.email === email && 
            user.password === password && 
            user.college === college
        );
    }

    logout() {
        localStorage.removeItem('admin_token');
        this.token = null;
        this.currentUser = null;
        this.currentCollege = null;
        this.showLogin();
        this.showToast('Logged out successfully', 'success');
    }

    // UI Management
    showLogin() {
        document.getElementById('login-page').classList.add('active');
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('login-error').classList.add('hidden');
    }

    showApp() {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('app-container').classList.remove('hidden');
    }

    showError(message) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    showLoading(show) {
        document.getElementById('loading').classList.toggle('hidden', !show);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Navigation
    navigate(page) {
        if (this.currentPage === page) return;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.toggle('active', pageEl.id === `${page}-page`);
            pageEl.classList.toggle('hidden', pageEl.id !== `${page}-page`);
        });
        
        this.currentPage = page;
        
        // Load page content
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'events':
                this.loadEvents();
                break;
            case 'registrations':
                this.loadRegistrations();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    // Dashboard Methods
    async loadDashboard() {
        this.showLoading(true);
        try {
            // Simulate API calls
            const stats = await this.generateMockStats();
            const events = await this.generateMockEvents();
            
            this.updateDashboardStats(stats);
            this.displayRecentEvents(events.slice(0, 5));
        } catch (error) {
            this.showToast('Failed to load dashboard data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateMockStats() {
        return {
            totalEvents: 42,
            totalRegistrations: 1247,
            attendanceRate: 85.3,
            upcomingEvents: 8
        };
    }

    async generateMockEvents() {
        const events = [];
        const eventNames = ['AI Workshop', 'Blockchain Hackathon', 'Web Dev Bootcamp', 'Data Science Seminar', 'Tech Fest 2025'];
        const statuses = ['published', 'draft', 'cancelled'];
        
        for (let i = 0; i < 20; i++) {
            const category = this.categories[Math.floor(Math.random() * this.categories.length)];
            events.push({
                id: `event-${i}`,
                name: eventNames[Math.floor(Math.random() * eventNames.length)] + ` ${i + 1}`,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                category: category.name,
                categoryColor: category.color,
                startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + Math.random() * 35 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Room ' + Math.floor(Math.random() * 100),
                capacity: Math.floor(Math.random() * 200) + 50,
                price: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 1000),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                registrations: Math.floor(Math.random() * 100)
            });
        }
        
        this.currentEvents = events;
        return events;
    }

    updateDashboardStats(stats) {
        document.getElementById('total-events').textContent = stats.totalEvents;
        document.getElementById('total-registrations').textContent = stats.totalRegistrations;
        document.getElementById('attendance-rate').textContent = stats.attendanceRate + '%';
        document.getElementById('upcoming-events').textContent = stats.upcomingEvents;
    }

    displayRecentEvents(events) {
        const container = document.getElementById('recent-events-list');
        
        if (events.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No recent events</h3><p>Create your first event to get started.</p></div>';
            return;
        }
        
        container.innerHTML = events.map(event => `
            <div class="event-item">
                <div class="event-info">
                    <h4>${event.name}</h4>
                    <div class="event-meta">
                        <span class="category-indicator" style="background-color: ${event.categoryColor}"></span>
                        <span>${event.category}</span>
                        <span>•</span>
                        <span>${this.formatDate(event.startDate)}</span>
                        <span>•</span>
                        <span>${event.registrations} registered</span>
                    </div>
                </div>
                <div class="status-badge status-badge--${event.status}">
                    ${event.status}
                </div>
            </div>
        `).join('');
    }

    // Event Management
    async loadEvents() {
        this.showLoading(true);
        try {
            if (this.currentEvents.length === 0) {
                await this.generateMockEvents();
            }
            this.displayEvents(this.currentEvents);
        } catch (error) {
            this.showToast('Failed to load events', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayEvents(events) {
        const container = document.getElementById('events-table');
        
        if (events.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No events found</h3><p>Create your first event or adjust your filters.</p></div>';
            return;
        }
        
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Registrations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.map(event => `
                        <tr>
                            <td>
                                <div>
                                    <strong>${event.name}</strong>
                                    <br>
                                    <small class="text-muted">${event.location}</small>
                                </div>
                            </td>
                            <td>
                                <span class="category-indicator" style="background-color: ${event.categoryColor}"></span>
                                ${event.category}
                            </td>
                            <td>${this.formatDate(event.startDate)}</td>
                            <td>
                                <span class="status-badge status-badge--${event.status}">
                                    ${event.status}
                                </span>
                            </td>
                            <td>${event.registrations}/${event.capacity}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn--outline btn--sm" onclick="app.editEvent('${event.id}')">Edit</button>
                                    <button class="btn btn--outline btn--sm" onclick="app.toggleEventStatus('${event.id}')">
                                        ${event.status === 'published' ? 'Cancel' : 'Publish'}
                                    </button>
                                    <button class="btn btn--outline btn--sm" onclick="app.deleteEvent('${event.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    filterEvents() {
        const statusFilter = document.getElementById('status-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        
        let filteredEvents = this.currentEvents;
        
        if (statusFilter) {
            filteredEvents = filteredEvents.filter(event => event.status === statusFilter);
        }
        
        if (categoryFilter) {
            filteredEvents = filteredEvents.filter(event => event.category === categoryFilter);
        }
        
        this.displayEvents(filteredEvents);
    }

    // Modal Management
    openEventModal(eventId = null) {
        const modal = document.getElementById('event-modal');
        const form = document.getElementById('event-form');
        
        form.reset();
        
        if (eventId) {
            const event = this.currentEvents.find(e => e.id === eventId);
            if (event) {
                document.getElementById('modal-title').textContent = 'Edit Event';
                document.getElementById('event-name').value = event.name;
                document.getElementById('event-description').value = event.description;
                document.getElementById('event-category').value = event.category;
                document.getElementById('event-capacity').value = event.capacity;
                document.getElementById('event-start-date').value = event.startDate.slice(0, 16);
                document.getElementById('event-end-date').value = event.endDate.slice(0, 16);
                document.getElementById('event-location').value = event.location;
                document.getElementById('event-price').value = event.price;
                form.dataset.eventId = eventId;
            }
        } else {
            document.getElementById('modal-title').textContent = 'Create Event';
            delete form.dataset.eventId;
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            name: document.getElementById('event-name').value,
            description: document.getElementById('event-description').value,
            category: document.getElementById('event-category').value,
            capacity: parseInt(document.getElementById('event-capacity').value),
            startDate: document.getElementById('event-start-date').value,
            endDate: document.getElementById('event-end-date').value,
            location: document.getElementById('event-location').value,
            price: parseFloat(document.getElementById('event-price').value) || 0
        };
        
        const eventId = e.target.dataset.eventId;
        
        try {
            if (eventId) {
                await this.updateEvent(eventId, eventData);
                this.showToast('Event updated successfully', 'success');
            } else {
                await this.createEvent(eventData);
                this.showToast('Event created successfully', 'success');
            }
            
            this.closeModal();
            this.loadEvents();
        } catch (error) {
            this.showToast('Failed to save event', 'error');
        }
    }

    async createEvent(eventData) {
        const category = this.categories.find(c => c.name === eventData.category);
        const newEvent = {
            id: `event-${Date.now()}`,
            ...eventData,
            categoryColor: category?.color || '#666',
            status: 'draft',
            registrations: 0
        };
        
        this.currentEvents.push(newEvent);
        return newEvent;
    }

    async updateEvent(eventId, eventData) {
        const eventIndex = this.currentEvents.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            const category = this.categories.find(c => c.name === eventData.category);
            this.currentEvents[eventIndex] = {
                ...this.currentEvents[eventIndex],
                ...eventData,
                categoryColor: category?.color || '#666'
            };
        }
    }

    editEvent(eventId) {
        this.openEventModal(eventId);
    }

    async toggleEventStatus(eventId) {
        const event = this.currentEvents.find(e => e.id === eventId);
        if (event) {
            event.status = event.status === 'published' ? 'cancelled' : 'published';
            this.loadEvents();
            this.showToast(`Event ${event.status}`, 'success');
        }
    }

    async deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.currentEvents = this.currentEvents.filter(e => e.id !== eventId);
            this.loadEvents();
            this.showToast('Event deleted successfully', 'success');
        }
    }

    // Registration Management
    async loadRegistrations() {
        this.showLoading(true);
        try {
            const registrations = await this.generateMockRegistrations();
            this.displayRegistrations(registrations);
        } catch (error) {
            this.showToast('Failed to load registrations', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateMockRegistrations() {
        const registrations = [];
        const events = this.currentEvents.slice(0, 5);
        const studentNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams'];
        
        events.forEach(event => {
            for (let i = 0; i < Math.min(event.registrations, 10); i++) {
                registrations.push({
                    id: `reg-${Date.now()}-${i}`,
                    eventId: event.id,
                    eventName: event.name,
                    studentName: studentNames[i % studentNames.length],
                    studentEmail: `student${i}@example.com`,
                    registrationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    attended: Math.random() > 0.3
                });
            }
        });
        
        return registrations;
    }

    displayRegistrations(registrations) {
        const container = document.getElementById('registrations-content');
        
        if (registrations.length === 0) {
            container.innerHTML = '<div class="empty-state"><h3>No registrations found</h3><p>Event registrations will appear here.</p></div>';
            return;
        }
        
        const groupedRegistrations = registrations.reduce((acc, reg) => {
            if (!acc[reg.eventName]) {
                acc[reg.eventName] = [];
            }
            acc[reg.eventName].push(reg);
            return acc;
        }, {});
        
        container.innerHTML = Object.entries(groupedRegistrations).map(([eventName, regs]) => `
            <div class="card" style="margin-bottom: 16px;">
                <div class="card__header">
                    <h4>${eventName}</h4>
                    <span class="badge">${regs.length} registrations</span>
                </div>
                <div class="card__body">
                    ${regs.map(reg => `
                        <div class="registration-item">
                            <div class="student-info">
                                <h5>${reg.studentName}</h5>
                                <p>${reg.studentEmail} • Registered ${this.formatDate(reg.registrationDate)}</p>
                            </div>
                            <div class="attendance-status">
                                <label>
                                    <input type="checkbox" class="attendance-checkbox" 
                                           ${reg.attended ? 'checked' : ''} 
                                           onchange="app.toggleAttendance('${reg.id}', this.checked)">
                                    Attended
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    toggleAttendance(registrationId, attended) {
        // In real app, this would make an API call
        this.showToast(`Attendance ${attended ? 'marked' : 'unmarked'}`, 'success');
    }

    // Reports
    async loadReports() {
        this.showLoading(true);
        try {
            await this.loadPopularityChart();
            await this.loadParticipationChart();
        } catch (error) {
            this.showToast('Failed to load reports', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadPopularityChart() {
        const ctx = document.getElementById('popularity-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Hackathons', 'Workshops', 'Tech Talks', 'Fests', 'Seminars'],
                datasets: [{
                    label: 'Number of Events',
                    data: [12, 19, 8, 15, 6],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Events by Category'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    async loadParticipationChart() {
        const ctx = document.getElementById('participation-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Attended', 'Registered Only', 'No Show'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Participation Overview'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // User Management
    async loadUsers() {
        this.showLoading(true);
        try {
            const users = await this.generateMockUsers();
            this.displayUsers(users);
        } catch (error) {
            this.showToast('Failed to load users', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateMockUsers() {
        const users = [];
        const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'];
        const roles = ['student', 'admin', 'staff'];
        
        for (let i = 0; i < 20; i++) {
            users.push({
                id: `user-${i}`,
                name: names[i % names.length] + ` ${i + 1}`,
                email: `user${i}@example.com`,
                role: roles[Math.floor(Math.random() * roles.length)],
                college: this.currentCollege,
                lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        return users;
    }

    displayUsers(users) {
        const container = document.getElementById('users-table');
        
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>
                                <span class="status-badge status-badge--${user.role === 'admin' ? 'error' : 'success'}">
                                    ${user.role}
                                </span>
                            </td>
                            <td>${this.formatDate(user.lastActive)}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="btn btn--outline btn--sm" onclick="app.editUser('${user.id}')">Edit</button>
                                    <button class="btn btn--outline btn--sm" onclick="app.deleteUser('${user.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    showAddUserForm() {
        this.showToast('Add user functionality would be implemented here', 'info');
    }

    editUser(userId) {
        this.showToast('Edit user functionality would be implemented here', 'info');
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.showToast('User deleted successfully', 'success');
        }
    }

    // Utility Methods
    populateCategories() {
        const categorySelect = document.getElementById('event-category');
        const categoryFilter = document.getElementById('category-filter');
        
        this.categories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category.name;
            option1.textContent = category.name;
            categorySelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = category.name;
            option2.textContent = category.name;
            categoryFilter.appendChild(option2);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the application
const app = new AdminPortal();