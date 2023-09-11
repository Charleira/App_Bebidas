require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(express.json());

// Use the auth routes
app.use('/auth', authRoutes);

// Use the user routes
app.use('/user', userRoutes);

//Credenciais
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Assuming you have a database connection using MySQL or another library
// For example:
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: dbUser,
    password: dbPassword,
    database: process.env.DB_NAME
});

// Start the server
pool.promise()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err);
    });
