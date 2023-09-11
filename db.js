require('dotenv/config')
// For example:
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'dbvirtual.mysql.database.azure.com',
    user: 'carlosDB',
    password: 'TDS@121829',
    database: 'sitevendas'
});
module.exports = {
    connection:connection
}