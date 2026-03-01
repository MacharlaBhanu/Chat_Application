const express = require("express"); // Import the Express module
const cors = require("cors"); // Import the CORS module
const mongoose = require("mongoose"); // Import the Mongoose module
const path = require("path");
const app = express(); // Initialize the Express application
const userRoutes=require("./routes/userRoutes")
const messageRoutes=require("./routes/messagesRoutes")
const socket = require("socket.io");
require("dotenv").config(); // Load environment variables from .env file into process.env

app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS) for all routes
app.use(express.json()); // Use middleware to parse incoming requests with JSON payloads
app.use("/api/auth",userRoutes)
app.use("/api/messages",messageRoutes)

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "..", "public", "build");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}
// Connect to MongoDB using the connection string from the environment variable
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true, // Use the new MongoDB URL parser
    useUnifiedTopology: true, // Use the new topology engine for MongoDB
})
.then(() => {
    console.log("DB Connection Successful"); // Log success message upon successful connection
})
.catch((err) => {
    console.error("DB Connection Error: ", err); // Log error message if connection fails
});

// Start the server on the port specified in the environment variable
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`); // Log message when server starts successfully
});

const socketOptions = process.env.CLIENT_ORIGIN
  ? {
      cors: {
        origin: process.env.CLIENT_ORIGIN,
        credentials: true,
      },
    }
  : {};

const io = socket(server, socketOptions);
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.message);
      }
    });
  });
