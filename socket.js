const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json());

 socket.on('order:placed', (order) => {
    console.log('Pedido realizado:', order);
    io.emit('order:placed', order);
 });

http.listen(3002, () => {
 console.log('Servidor rodando na porta 3002');
});