// Campus Events Student App - JavaScript

// Application State
let currentUser = null;
let currentScreen = 'dashboard';
let currentTheme = 'light';
let allEvents = [];
let userRegistrations = [];
let userAttendance = [];

// Sample Data
const colleges = {
    'MIT': {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Massachusetts Institute of Technology',
        code: 'MIT',
        domain: 'mit.edu'
    },
    'STANFORD': {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Stanford University',
        code: 'STANFORD',
        domain: 'stanford.edu'
    },
    'IITD': {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Indian Institute of Technology Delhi',
        code: 'IITD',
        domain: 'iitd.ac.in'
    }
};

const categories = [
    { id: 'hackathon', name: 'Hackathon', color: '#e74c3c', icon: '💻' },
    { id: 'workshop', name: 'Workshop', color: '#3498db', icon: '🛠️' },
    { id: 'tech-talk', name: 'Tech Talk', color: '#2ecc71', icon: '🎤' },
    { id: 'fest', name: 'Fest', color: '#f39c12', icon: '🎉' },
    { id: 'seminar', name: 'Seminar', color: '#9b59b6', icon: '📚' }
];

const sampleStudents = [
    {
        email: 'alice.johnson@mit.edu',
        password: 'password123',
        name: 'Alice Johnson',
        college: 'MIT',
        department: 'Computer Science',
        year: 2
    },
    {
        email: 'bob.smith@mit.edu',
        password: 'password123',
        name: 'Bob Smith',
        college: 'MIT',
        department: 'Electrical Engineering',
        year: 2
    },
    {
        email: 'emma.brown@stanford.edu',
        password: 'password123',
        name: 'Emma Brown',
        college: 'STANFORD',
        department: 'Computer Science',
        year: 2
    }
];

// Generate Sample Events
function generateSampleEvents() {
    const eventTitles = {
        'hackathon': ['AI Innovation Challenge', 'Blockchain Hackathon', 'Mobile App Competition', 'Data Science Challenge'],
        'workshop': ['React Workshop', 'Python for Beginners', 'UI/UX Design Fundamentals', 'Cloud Computing Basics'],
        'tech-talk': ['Future of AI', 'Quantum Computing', 'Cybersecurity Trends', 'Web3 Revolution'],
        'fest': ['Tech Fest 2025', 'Innovation Day', 'Startup Expo', 'Developer Conference'],
        'seminar': ['Research Methods', 'Industry Insights', 'Academic Writing', 'Career Guidance']
    };

    const locations = ['Main Auditorium', 'Computer Lab 1', 'Conference Room A', 'Library Hall', 'Innovation Center'];
    const events = [];

    categories.forEach(category => {
        eventTitles[category.id].forEach((title, index) => {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30) + 1);
            
            events.push({
                id: `${category.id}-${index + 1}`,
                title: title,
                description: `Join us for an exciting ${category.name.toLowerCase()} focused on ${title.toLowerCase()}. This event will provide hands-on experience and valuable networking opportunities.`,
                category: category.id,
                categoryName: category.name,
                categoryIcon: category.icon,
                date: eventDate.toISOString().split('T')[0],
                time: ['09:00', '14:00', '16:00'][Math.floor(Math.random() * 3)],
                location: locations[Math.floor(Math.random() * locations.length)],
                capacity: [50, 100, 150, 200][Math.floor(Math.random() * 4)],
                registered: Math.floor(Math.random() * 100),
                price: category.id === 'fest' ? 25 : (Math.random() > 0.5 ? 0 : [5, 10, 15][Math.floor(Math.random() * 3)]),
                registrationDeadline: new Date(eventDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'published',
                requirements: `Basic knowledge of ${category.name.toLowerCase()} concepts recommended.`,
                organizer: 'Student Activities Committee'
            });
        });
    });

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Utility Functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateStr, timeStr) {
    const date = new Date(dateStr);
    return `${formatDate(dateStr)} at ${timeStr}`;
}

// Theme Management
function initializeTheme() {
    const savedTheme = 'light'; // Default since we can't use localStorage
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    updateThemeIcon();
    showToast(`Switched to ${currentTheme} mode`, 'success');
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

// Authentication
function validateLogin(email, password, college) {
    const student = sampleStudents.find(s => 
        s.email === email && 
        s.password === password && 
        s.college === college
    );
    return student;
}

function login(email, password, college) {
    const user = validateLogin(email, password, college);
    if (user) {
        currentUser = user;
        showMainApp();
        initializeDashboard();
        showToast(`Welcome back, ${user.name}!`, 'success');
        return true;
    } else {
        showToast('Invalid credentials. Please try again.', 'error');
        return false;
    }
}

function logout() {
    currentUser = null;
    userRegistrations = [];
    userAttendance = [];
    showLoginScreen();
    showToast('Logged out successfully', 'success');
}

// Screen Management
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainApp').classList.add('hidden');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainApp').classList.remove('hidden');
}

function switchScreen(screenName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.screen === screenName);
    });
    
    // Update content
    document.querySelectorAll('.screen-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(screenName + 'Content').classList.add('active');
    
    // Update header title
    const titles = {
        'dashboard': 'Dashboard',
        'browse': 'Browse Events',
        'myEvents': 'My Events',
        'checkin': 'Check-in',
        'profile': 'Profile'
    };
    document.getElementById('screenTitle').textContent = titles[screenName];
    
    currentScreen = screenName;
    
    // Load screen-specific content
    switch(screenName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'browse':
            loadBrowseEvents();
            break;
        case 'myEvents':
            loadMyEvents();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Dashboard
function initializeDashboard() {
    allEvents = generateSampleEvents();
    // Simulate some registrations for demo
    userRegistrations = [allEvents[0].id, allEvents[2].id, allEvents[5].id];
    userAttendance = [allEvents[1].id];
    loadDashboard();
}

function loadDashboard() {
    if (!currentUser) return;
    
    // Update greeting
    document.getElementById('userGreeting').textContent = `Welcome back, ${currentUser.name}!`;
    
    // Update stats
    const upcomingEvents = allEvents.filter(event => 
        userRegistrations.includes(event.id) && 
        new Date(event.date) >= new Date()
    );
    
    document.getElementById('registeredCount').textContent = userRegistrations.length;
    document.getElementById('attendedCount').textContent = userAttendance.length;
    document.getElementById('upcomingCount').textContent = 
        upcomingEvents.length > 0 ? 
        `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''}` :
        'No upcoming events';
    
    // Load upcoming events
    const upcomingEventsContainer = document.getElementById('upcomingEvents');
    if (upcomingEvents.length === 0) {
        upcomingEventsContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No upcoming events. <a href="#" onclick="switchScreen(\'browse\')">Browse events</a> to register!</p>';
    } else {
        upcomingEventsContainer.innerHTML = upcomingEvents.slice(0, 3).map(event => createEventCard(event, true)).join('');
    }
}

// Browse Events
function loadBrowseEvents() {
    // Populate category filter with proper options
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryOptions = categories.map(cat => 
        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
    
    renderEvents(allEvents);
}

function renderEvents(events) {
    const container = document.getElementById('allEvents');
    if (events.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No events found.</p>';
        return;
    }
    
    container.innerHTML = events.map(event => createEventCard(event)).join('');
}

function createEventCard(event, isRegistered = false) {
    const category = categories.find(cat => cat.id === event.category);
    const isUserRegistered = userRegistrations.includes(event.id);
    const isEventFull = event.registered >= event.capacity;
    const isPastEvent = new Date(event.date) < new Date();
    
    let statusText = 'Available';
    let statusClass = 'status-available';
    
    if (isUserRegistered) {
        statusText = 'Registered';
        statusClass = 'status-registered';
    } else if (isEventFull) {
        statusText = 'Full';
        statusClass = 'status-full';
    }
    
    return `
        <div class="event-card" onclick="showEventDetail('${event.id}')">
            <div class="event-header">
                <div class="event-category">
                    <span>${category.icon}</span>
                    <span>${category.name}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-body">
                <div class="event-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span>${formatDateTime(event.date, event.time)}</span>
                    </div>
                    <div class="meta-item">
                        <span>📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="meta-item">
                        <span>👥</span>
                        <span>${event.registered}/${event.capacity} registered</span>
                    </div>
                    <div class="meta-item">
                        <span>💰</span>
                        <span>${event.price === 0 ? 'Free' : `$${event.price}`}</span>
                    </div>
                </div>
            </div>
            <div class="event-footer">
                <span class="event-status ${statusClass}">${statusText}</span>
                ${!isUserRegistered && !isEventFull && !isPastEvent ? 
                    `<button class="btn btn--primary quick-register-btn" onclick="event.stopPropagation(); quickRegister('${event.id}')">Quick Register</button>` : 
                    ''
                }
            </div>
        </div>
    `;
}

// Event Details Modal
function showEventDetail(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const category = categories.find(cat => cat.id === event.category);
    const modal = document.getElementById('eventModal');
    
    // Populate modal content
    document.getElementById('modalEventTitle').textContent = event.title;
    document.getElementById('modalEventDateTime').textContent = formatDateTime(event.date, event.time);
    document.getElementById('modalEventLocation').textContent = event.location;
    document.getElementById('modalEventCapacity').textContent = `${event.registered}/${event.capacity}`;
    document.getElementById('modalEventPrice').textContent = event.price === 0 ? 'Free' : `$${event.price}`;
    document.getElementById('modalEventDescription').textContent = event.description;
    
    // Update register button
    const registerBtn = document.getElementById('registerEventBtn');
    const isRegistered = userRegistrations.includes(eventId);
    const isFull = event.registered >= event.capacity;
    
    if (isRegistered) {
        registerBtn.textContent = 'Cancel Registration';
        registerBtn.className = 'btn btn--secondary';
        registerBtn.onclick = () => cancelRegistration(eventId);
    } else if (isFull) {
        registerBtn.textContent = 'Join Waitlist';
        registerBtn.className = 'btn btn--outline';
        registerBtn.onclick = () => joinWaitlist(eventId);
    } else {
        registerBtn.textContent = 'Register Now';
        registerBtn.className = 'btn btn--primary';
        registerBtn.onclick = () => registerForEvent(eventId);
    }
    
    modal.classList.remove('hidden');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.add('hidden');
}

// Event Registration
function quickRegister(eventId) {
    registerForEvent(eventId);
}

function registerForEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (userRegistrations.includes(eventId)) {
        showToast('You are already registered for this event', 'error');
        return;
    }
    
    if (event.registered >= event.capacity) {
        showToast('This event is full', 'error');
        return;
    }
    
    // Simulate registration
    userRegistrations.push(eventId);
    event.registered += 1;
    
    showToast(`Successfully registered for ${event.title}!`, 'success');
    closeEventModal();
    
    // Refresh current screen
    if (currentScreen === 'browse') {
        renderEvents(getFilteredEvents());
    } else if (currentScreen === 'dashboard') {
        loadDashboard();
    }
}

function cancelRegistration(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const index = userRegistrations.indexOf(eventId);
    if (index > -1) {
        userRegistrations.splice(index, 1);
        event.registered = Math.max(0, event.registered - 1);
        showToast(`Registration cancelled for ${event.title}`, 'success');
        closeEventModal();
        
        // Refresh current screen
        if (currentScreen === 'browse') {
            renderEvents(getFilteredEvents());
        } else if (currentScreen === 'dashboard') {
            loadDashboard();
        } else if (currentScreen === 'myEvents') {
            loadMyEvents();
        }
    }
}

function joinWaitlist(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    showToast(`Added to waitlist for ${event.title}`, 'success');
    closeEventModal();
}

function shareEvent() {
    if (navigator.share) {
        navigator.share({
            title: 'Campus Event',
            text: 'Check out this event!',
            url: window.location.href
        });
    } else {
        showToast('Event link copied to clipboard!', 'success');
    }
}

// Search and Filter
function getFilteredEvents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = allEvents.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || event.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    // Sort events
    switch(sortFilter) {
        case 'date':
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'popularity':
            filtered.sort((a, b) => b.registered - a.registered);
            break;
        case 'deadline':
            filtered.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
            break;
    }
    
    return filtered;
}

function performSearch() {
    if (currentScreen === 'browse') {
        renderEvents(getFilteredEvents());
    }
}

// My Events
function loadMyEvents() {
    switchMyEventsTab('registered');
}

function switchMyEventsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Events').classList.add('active');
    
    // Load content
    if (tabName === 'registered') {
        const registeredEvents = allEvents.filter(event => userRegistrations.includes(event.id));
        const container = document.getElementById('registeredEvents').querySelector('.events-list');
        
        if (registeredEvents.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No registered events. <a href="#" onclick="switchScreen(\'browse\')">Browse events</a> to register!</p>';
        } else {
            container.innerHTML = registeredEvents.map(event => createEventCard(event, true)).join('');
        }
    } else if (tabName === 'attended') {
        const attendedEvents = allEvents.filter(event => userAttendance.includes(event.id));
        const container = document.getElementById('attendedEvents').querySelector('.events-list');
        
        if (attendedEvents.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No attended events yet.</p>';
        } else {
            container.innerHTML = attendedEvents.map(event => createAttendedEventCard(event)).join('');
        }
    }
}

function createAttendedEventCard(event) {
    const category = categories.find(cat => cat.id === event.category);
    
    return `
        <div class="event-card">
            <div class="event-header">
                <div class="event-category">
                    <span>${category.icon}</span>
                    <span>${category.name}</span>
                </div>
                <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-body">
                <div class="event-meta">
                    <div class="meta-item">
                        <span>📅</span>
                        <span>${formatDateTime(event.date, event.time)}</span>
                    </div>
                    <div class="meta-item">
                        <span>📍</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="meta-item">
                        <span>✅</span>
                        <span>Attended</span>
                    </div>
                </div>
            </div>
            <div class="event-footer">
                <span class="event-status status-registered">Completed</span>
                <button class="btn btn--outline quick-register-btn" onclick="provideFeedback('${event.id}')">Give Feedback</button>
            </div>
        </div>
    `;
}

function provideFeedback(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    showToast(`Feedback submitted for ${event.title}`, 'success');
}

// Check-in
function simulateQRScan() {
    showToast('QR Scanner activated', 'info');
    
    // Simulate successful scan after 2 seconds
    setTimeout(() => {
        const registeredEvents = allEvents.filter(event => 
            userRegistrations.includes(event.id) && 
            new Date(event.date).toDateString() === new Date().toDateString()
        );
        
        if (registeredEvents.length > 0) {
            const event = registeredEvents[0];
            performCheckin(event.id);
        } else {
            showToast('No events found for today', 'error');
        }
    }, 2000);
}

function manualCheckin() {
    const eventCode = document.getElementById('eventCodeInput').value.trim();
    if (!eventCode) {
        showToast('Please enter an event code', 'error');
        return;
    }
    
    // Simulate manual check-in
    const event = allEvents.find(e => e.id.includes(eventCode.toLowerCase()));
    if (event && userRegistrations.includes(event.id)) {
        performCheckin(event.id);
    } else {
        showToast('Invalid event code or not registered', 'error');
    }
    
    document.getElementById('eventCodeInput').value = '';
}

function performCheckin(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (!userRegistrations.includes(eventId)) {
        showToast('You are not registered for this event', 'error');
        return;
    }
    
    if (userAttendance.includes(eventId)) {
        showToast('You have already checked in for this event', 'error');
        return;
    }
    
    userAttendance.push(eventId);
    showToast(`✅ Successfully checked in to ${event.title}!`, 'success');
    
    // Update dashboard stats if on dashboard
    if (currentScreen === 'dashboard') {
        loadDashboard();
    }
}

// Profile
function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileCollege').textContent = colleges[currentUser.college].name;
    document.getElementById('profileDepartment').textContent = currentUser.department;
    document.getElementById('profileYear').textContent = `${currentUser.year}${getOrdinalSuffix(currentUser.year)} Year`;
}

function getOrdinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = num % 100;
    return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0];
}

function openSettings() {
    showToast('Settings page would open here', 'info');
}

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Show loading screen briefly
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
    
    // Login form handling
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const college = document.getElementById('collegeSelect').value;
        
        if (email && password && college) {
            login(email, password, college);
        }
    });
    
    // Navigation handling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchScreen(item.dataset.screen);
        });
    });
    
    // Tab handling for My Events
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchMyEventsTab(btn.dataset.tab);
        });
    });
    
    // Search and filter handling
    document.getElementById('searchInput').addEventListener('input', performSearch);
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('categoryFilter').addEventListener('change', performSearch);
    document.getElementById('sortFilter').addEventListener('change', performSearch);
    
    // Check-in handling
    document.getElementById('scanBtn').addEventListener('click', simulateQRScan);
    document.getElementById('manualCheckinBtn').addEventListener('click', manualCheckin);
    
    // Modal handling
    document.getElementById('closeModal').addEventListener('click', closeEventModal);
    document.getElementById('shareEventBtn').addEventListener('click', shareEvent);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Profile actions
    document.getElementById('profileBtn').addEventListener('click', () => switchScreen('profile'));
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Toast close
    document.getElementById('toastClose').addEventListener('click', () => {
        document.getElementById('toast').classList.add('hidden');
    });
    
    // Close modal when clicking outside
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });
    
    // Prevent form submission on Enter in search
    document.getElementById('eventCodeInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            manualCheckin();
        }
    });
    
    // Pull to refresh simulation (simplified)
    let startY = 0;
    let currentY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    });
    
    document.addEventListener('touchmove', function(e) {
        currentY = e.touches[0].pageY;
        if (currentY > startY + 50 && window.scrollY === 0) {
            // Pull to refresh detected
            if (currentScreen === 'browse') {
                performSearch();
            } else if (currentScreen === 'dashboard') {
                loadDashboard();
            }
        }
    });
    
    console.log('Campus Events Student App initialized');
    console.log('Sample credentials:');
    console.log('- alice.johnson@mit.edu / password123 (MIT)');
    console.log('- bob.smith@mit.edu / password123 (MIT)'); 
    console.log('- emma.brown@stanford.edu / password123 (STANFORD)');
});