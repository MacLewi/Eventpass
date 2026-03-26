const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.post('/register', async (req, res) => {

    return res.send({"message": "This is the best kartel music endpoint","amount": 1000});
    const { name, email, password } = req.body;

    console.log("Register attempt:", req.body);  // Debugging: check incoming email
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
