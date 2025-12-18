const express = require("express");
const http = require("http");
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

// Socket logic
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg);
  });

  socket.on("imageMessage", (data) => {
    io.emit("imageMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
