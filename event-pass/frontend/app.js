// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// DOM elements
const eventsContainer = document.getElementById('eventsContainer');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const bookingModal = document.getElementById('bookingModal');
const bookingDetails = document.getElementById('bookingDetails');
const bookingForm = document.getElementById('bookingForm');
const closeBtn = document.querySelector('.close');

// State
let allEvents = [];
let currentEvent = null;

// Fetch events from API
async function fetchEvents() {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/events`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allEvents = data.data;
            displayEvents(allEvents);
        } else {
            throw new Error(data.error || 'Failed to fetch events');
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        showError('Failed to load events. Please make sure the backend server is running on http://localhost:3000');
    }
}

// Show loading state
function showLoading() {
    eventsContainer.innerHTML = '<div class="loading">Loading events...</div>';
}

// Show error message
function showError(message) {
    eventsContainer.innerHTML = `<div class="error">❌ ${message}</div>`;
}

// Show no events message
function showNoEvents() {
    eventsContainer.innerHTML = '<div class="no-events">No events found matching your criteria.</div>';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        technology: '💻',
        music: '🎵',
        business: '💼',
        art: '🎨',
        education: '📚',
        sports: '⚽',
        health: '🏥',
        charity: '🤝',
        other: '🎉'
    };
    return icons[category] || '🎫';
}

// Create event card HTML
function createEventCard(event) {
    const startDate = formatDate(event.start_date);
    const endDate = formatDate(event.end_date);
    const categoryIcon = getCategoryIcon(event.category);
    const isFree = event.is_free || event.ticket_price === 0;

    // Truncate description if too long
    const description = event.description.length > 150
        ? event.description.substring(0, 150) + '...'
        : event.description;

    // Get top 3 tags
    const tags = event.tags.slice(0, 3);

    return `
        <div class="event-card" data-event-id="${event.event_id}">
            <div class="event-image">
                <span>${categoryIcon}</span>
                <span class="event-category">${event.category}</span>
            </div>
            <div class="event-content">
                <h3 class="event-title">${escapeHtml(event.name)}</h3>
                <p class="event-description">${escapeHtml(description)}</p>
                
                <div class="event-details">
                    <div class="event-detail">
                        <span class="emoji">📅</span>
                        <span>${startDate}</span>
                    </div>
                    <div class="event-detail">
                        <span class="emoji">📍</span>
                        <span>${escapeHtml(event.location.venue)}, ${escapeHtml(event.location.city)}</span>
                    </div>
                    <div class="event-detail">
                        <span class="emoji">👥</span>
                        <span>${event.available_seats} seats available</span>
                    </div>
                </div>
                
                ${tags.length > 0 ? `
                    <div class="event-tags">
                        ${tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="event-footer">
                    <div class="event-price ${isFree ? 'free' : ''}">
                        ${isFree ? 'FREE' : `$${event.ticket_price.toFixed(2)}`}
                    </div>
                    <button class="book-btn" onclick="openBookingModal('${event.event_id}')">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Display events
function displayEvents(events) {
    if (!events || events.length === 0) {
        showNoEvents();
        return;
    }

    const eventsHTML = events.map(event => createEventCard(event)).join('');
    eventsContainer.innerHTML = eventsHTML;
}

// Filter events based on category and search
function filterEvents() {
    const category = categoryFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filteredEvents = [...allEvents];

    // Filter by category
    if (category) {
        filteredEvents = filteredEvents.filter(event => event.category === category);
    }

    // Filter by search term
    if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    displayEvents(filteredEvents);
}

// Open booking modal
function openBookingModal(eventId) {
    currentEvent = allEvents.find(e => e.event_id === eventId);
    if (!currentEvent) return;

    const isFree = currentEvent.is_free || currentEvent.ticket_price === 0;

    bookingDetails.innerHTML = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
            <h3>${escapeHtml(currentEvent.name)}</h3>
            <p><strong>Date:</strong> ${formatDate(currentEvent.start_date)}</p>
            <p><strong>Location:</strong> ${escapeHtml(currentEvent.location.venue)}</p>
            <p><strong>Price:</strong> ${isFree ? 'FREE' : `$${currentEvent.ticket_price}`}</p>
            <p><strong>Available Seats:</strong> ${currentEvent.available_seats}</p>
        </div>
    `;

    bookingModal.style.display = 'block';

    // Reset form
    bookingForm.reset();
    document.getElementById('ticketType').value = 'regular';
    document.getElementById('quantity').value = '1';
}

// Close modal
function closeModal() {
    bookingModal.style.display = 'none';
    currentEvent = null;
}

// Handle booking submission
async function handleBooking(event) {
    event.preventDefault();

    if (!currentEvent) return;

    const ticketType = document.getElementById('ticketType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Validate quantity
    if (quantity > currentEvent.available_seats) {
        alert(`Sorry, only ${currentEvent.available_seats} seats available.`);
        return;
    }

    // Calculate total price
    let totalPrice = currentEvent.ticket_price * quantity;
    if (ticketType === 'vip') totalPrice *= 2;
    if (ticketType === 'student') totalPrice *= 0.8;

    // Show confirmation
    const confirmMessage = `
        Booking Summary:
        Event: ${currentEvent.name}
        Ticket Type: ${ticketType.toUpperCase()}
        Quantity: ${quantity}
        Total: $${totalPrice.toFixed(2)}
        
        Name: ${name}
        Email: ${email}
        
        Confirm booking?
    `;

    if (confirm(confirmMessage)) {
        // Here you would make an API call to your backend to create the booking
        // For demo purposes, just show success message
        alert(`✅ Booking confirmed!\n\nCheck your email at ${email} for tickets.`);
        closeModal();

        // Refresh events to update available seats
        await fetchEvents();
    }
}

// Add event listeners
categoryFilter.addEventListener('change', filterEvents);
searchInput.addEventListener('input', filterEvents);
closeBtn.addEventListener('click', closeModal);
bookingForm.addEventListener('submit', handleBooking);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === bookingModal) {
        closeModal();
    }
});

// Handle login/register buttons (demo)
document.getElementById('loginBtn').addEventListener('click', () => {
    alert('Login functionality would be implemented here. This is a demo frontend.');
});

document.getElementById('registerBtn').addEventListener('click', () => {
    alert('Registration functionality would be implemented here. This is a demo frontend.');
});

// Smooth scroll for navigation links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Initialize
fetchEvents();

// Optional: Refresh events every 30 seconds
setInterval(() => {
    if (document.hasFocus()) {
        fetchEvents();
    }
}, 30000);