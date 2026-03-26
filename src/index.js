const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const cors = require('cors');
const Event = require('./Event'); // ← Import the Event model correctly
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection

app.use(cors());
const mongoURI = 'mongodb://root:example@localhost:27017/event-pass?authSource=admin';
mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('✅ Database connected successfully');

    // Debug: Check Event model collection name
    console.log('Event collection name:', Event.collection.name);

    // Debug: Count events directly
    Event.countDocuments({}).then(count => {
        console.log('Event.countDocuments():', count);
    }).catch(err => {
        console.error('Error counting events:', err);
    });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (CSS, images, etc.)
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use User model from config
const User = collection;

// ====================== EVENT ROUTES ======================

// GET all events - API endpoint
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.getAllEvents();
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET all events - Render view
app.get('/events', async (req, res) => {
    try {
        const events = await Event.getAllEvents();
        res.render('events', {
            events: events,
            title: 'All Events'
        });
    } catch (error) {
        console.log('Error fetching events:', error);
        res.render('events', {
            events: [],
            error: 'Failed to load events',
            title: 'All Events'
        });
    }
});

// GET events by category
app.get('/events/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const events = await Event.getEventsByCategory(category);
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET upcoming events
app.get('/api/events/upcoming', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const events = await Event.getUpcomingEvents(limit);
        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET single event by ID
app.get('/api/events/:eventId', async (req, res) => {
    try {
        const event = await Event.getEventById(req.params.eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST - Create new event
app.post('/api/events', async (req, res) => {
    try {
        const eventData = req.body;
        const newEvent = new Event(eventData);
        await newEvent.save();
        res.status(201).json({
            success: true,
            data: newEvent
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// PUT - Update event
app.put('/api/events/:eventId', async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { event_id: req.params.eventId },
            { ...req.body, updated_at: new Date() },
            { new: true, runValidators: true }
        );
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE - Delete event
app.delete('/api/events/:eventId', async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ event_id: req.params.eventId });
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ====================== AUTH ROUTES ======================

// Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Register User
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists! Please login.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        res.redirect('/login');

    } catch (error) {
        console.log(error);
        res.send("Error registering user");
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await collection.findOne({ name: username });

        if (!user) {
            return res.send("User not found");
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Wrong password");
        }
    } catch (error) {
        console.log(error);
        res.send("Error logging in");
    }
});

// ====================== TEST ROUTE ======================
// Test endpoint to check events in database
app.get('/test-events', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json({
            message: 'Events in database',
            count: events.length,
            events: events
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
    console.log(`🔍 Test Events: http://localhost:${PORT}/test-events`);
});