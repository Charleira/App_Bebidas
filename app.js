require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(express.json()); // Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

// Use the auth routes
app.use('/auth', authRoutes);

// Use the user routes
app.use('/user', userRoutes);

module.exports = {
    app : app
};
