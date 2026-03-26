const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');   // ← your database config

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (CSS, images, etc.)
app.use(express.static('public'));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ Use collection as User model (common in simple Mongo tutorials)
const User = collection;

// ====================== ROUTES ======================

// Home Page - EventPass (your big HTML)
app.get('/', (req, res) => {
    res.render('index');          // ← This shows your beautiful EventPass homepage
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// ====================== POST ROUTES ======================

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
        res.redirect('/login');   // After register → go to login

    } catch (error) {
        console.log(error);
        res.send("Error registering user");
    }
});

// Login User (basic version)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);  // Debugging: check incoming email
    try {
        const check = await collection.findOne({ name: req.body.username });
if (!check) {
    res.send("user name not found");
}

// compare the hash password from the database with the plain text
const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
if (isPasswordMatch) {
    res.render("home");
} else {
    res.send("wrong password");
}
    } catch (error) {
        console.log(error);
        res.send("Error logging in");
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});