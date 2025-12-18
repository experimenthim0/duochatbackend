const express = require("express");
const http = require("http");
const { Resend } = require('resend');
const { configDotenv } = require('dotenv');
require("dotenv").config();
const { Server } = require("socket.io");


const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (optional)
app.use(express.static("public"));

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});


const resend = new Resend(process.env.RESEND_API_KEY);



async function sendNotificationEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DuoChat <onboarding@resend.dev>',
      to: [process.env.EMAIL_USER], // The email you used to sign up for Resend
      subject: 'New User Connected!',
      html: `<strong>Alert:</strong> A new user joined your Duo Chat at ${new Date().toLocaleString()}`
    });

    if (error) {
      return console.error("Resend Error:", error);
    }

    console.log("Email sent successfully via Resend:", data.id);
  } catch (err) {
    console.error("System Error:", err);
  }
}


// Socket logic
io.on("connection", (socket) => {
  
   const userCount = io.engine.clientsCount;
   console.log(`Current users: ${userCount}`);
   
   sendNotificationEmail();
socket.emit('userCountmsg', userCount);
   if (userCount > 3) {
    console.log('Connection rejected: Room is full');
    socket.emit('errorMsg', 'The chat is full. Please try again later. Email Me: contact.nikhim@gmail.com');
    socket.disconnect(true);
    return; // Stop the rest of the code from running for this user
  }

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
  });

  socket.on("imageMessage", (data) => {
    io.emit("imageMessage", data);
  });


});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
