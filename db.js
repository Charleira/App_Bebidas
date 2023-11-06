require('dotenv/config')
// For example:
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    port: '3308',
    user: 'root',
    password: 'Carlos1218',
    database: 'sitebebidas'
});
module.exports = {
    connection:connection
}