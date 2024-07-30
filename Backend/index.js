// server.js
const express=require("express");
const app = express();
const PORT = 5040;
const mongoose=require("mongoose");
const bodyParser=require("body-parser");
const cors =require("cors");
const jwt=require("jsonwebtoken");


// import bodyParser from 'body-parser';
// import cors from 'cors';
const mongoURL = "mongodb://localhost:27017/employee";
// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
}));

mongoose.connect(mongoURL, { useNewUrlParser: true })
    .then(() => {
        console.log("Connected to mongoose db");
    }).catch((error) =>
        console.error("Failed to connected"));

// // Sample data (you can replace this with an actual database)

// const userSchema = new mongoose.Schema({
//     username: String,
//     email: String,
//     password: String,
//     mobile: Integer
// });


// const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Validate email format using a regular expression
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        // Additional password validation can be added here, such as minimum length or complex requirements
    },
    mobile: {
        type: Number, // Changed from 'Integer' to 'Number'
        // Additional validation for mobile numbers can be added here
    }
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { username, email, password, mobile } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        
        if (existingUser) { 
            
            // If the email already exists, respond with an error message
            return res.status(400).json({ message: 'Email address is already registered' });
        }
        // Create a new user document
        const newUser = new User({ username, email, password, mobile });
       
        // Save the user document to the database
        await newUser.save();

        console.log('Registration successful:', newUser);
        // Respond with a success message
        res.status(200).json({ message: 'Registration successful', user: newUser});
    } catch (error) {
        console.error('Failed to register:', error);
        res.status(500).json({ message: 'Failed to register' });
    }
});
app.post('/userLogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email and password
        const user = await User.findOne({ email, password });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        var token= jwt.sign({email},"novacapture");
        // If user exists, respond with success message and user data
        res.status(200).json({ message: 'Login successful', token});
    } catch (error) {
        console.error('Failed to login:');
        res.status(500).json({ message: 'Failed to login' });
    }
});
app.post('/adminLogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email and password
        const user = await User.findOne({ email, password });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If user exists, respond with success message and user data
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Failed to login:');
        res.status(500).json({ message: 'Failed to login' });
    }
})
// Start server
 app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



