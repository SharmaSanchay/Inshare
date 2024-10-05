const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: 'https://inshare-1-o9b6.onrender.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the database
connectDB();

// Routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download'));

// Home route
app.get('/', (req, res) => {
    return res.render('index');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
