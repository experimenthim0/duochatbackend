const express = require('express');
const http = require('http');
require("dotenv").config();
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// REMOVED: app.listen(PORT); <--- This was the culprit!

// 1. Create the HTTP server using the Express 'app'
const server = http.createServer(app);

// 2. Attach Socket.io to that HTTP server
const io = new Server(server);

app.use(express.static('public'));

// 3. Consolidate your Socket.io logic into one 'connection' block (cleaner)
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg);
  });

  socket.on("imageMessage", (data) => {
    io.emit("imageMessage", data);
  });
});

// 4. Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
