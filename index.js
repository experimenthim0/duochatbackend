const express = require("express");
const http = require("http");
const { configDotenv } = require('dotenv');
require("dotenv").config();
const { Server } = require("socket.io");
const nodemailer = require('nodemailer');

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


const transporter = nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:465,
  secure:true,
  // service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your App Password (not your normal password)
  },
  tls: {
    rejectUnauthorized: false // Helps bypass some server restrictions
  }
});

function sendNotificationEmail() {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Sending the email to yourself
    subject: 'New User Connected to Duo Chat',
    text: ` Hi Nikhil! A new user just joined your chat at ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email Error: ", error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


// Socket logic
io.on("connection", (socket) => {
  
   const userCount = io.engine.clientsCount;
   console.log(`Current users: ${userCount}`);
   
   sendNotificationEmail();
socket.emit('userCountmsg', userCount);
   if (userCount > 2) {
    console.log('Connection rejected: Room is full');
    socket.emit('errorMsg', 'The chat is full (Max 2 users). Please try again later. Email Me: contact.nikhim@gmail.com');
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
