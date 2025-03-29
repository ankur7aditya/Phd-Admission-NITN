const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const academicRoutes = require("./routes/AcademicDetails");
const authRoutes = require('./routes/Authroutes');
const personalRoutes = require('./routes/personalDetailsroutes');
const Counter = require('./models/Counter_mongo');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Referrer-Policy'],
    exposedHeaders: ['Content-Disposition'],
    referrerPolicy: 'strict-origin-when-cross-origin'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add headers middleware for PDF files and document uploads
app.use((req, res, next) => {
    // Set security headers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    if (req.path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
    }
    next();
});

// Routes
app.use('/api/academic', academicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/personal', personalRoutes);
app.use('/', (req, res) => {
    res.send('Hello from backend');
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Database connection
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Initialize Counter if it doesn't exist
        const counter = await Counter.findOne({ _id: 'userid_counter' });
        if (!counter) {
            await Counter.create({
                _id: 'userid_counter',
                sequence_value: 1
            });
        }
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
