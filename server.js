const http = require('http');
const {app} = require('./app');
const port = process.env.PORT || 3001;
const server = http.createServer(app);
server.listen(port);
const {connection} = require ('./db');
    try{
        app.listen(3000, () => {
           connection.connect();
            console.log('Server is running on port 3000');
        });
    } catch (err) {
        console.error('Error connecting to the database:', err);
    };

    