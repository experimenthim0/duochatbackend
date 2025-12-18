const express = require('express');
const http = require('http');
const app = express();
const { Socket } = require('dgram');

const {Server} = require('socket.io');
const PORT = process.env.PORT || 3000;
app.listen(PORT);
const server = http.createServer(app);


const io = new Server(server);




app.use(express.static('public'));

// Socket.io connection
io.on('connection',(socket)=>{
     socket.on('chatMessage',(msg)=>{
        
        io.emit('chatMessage',msg);

     })

     
    })
    io.on('connection',(socket)=>{
      
      socket.on("imageMessage", (data) => {
        // send to all users
        io.emit("imageMessage", data);
      });
    })



server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

