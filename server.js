const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const { addSocketId, removeSocketId, addScore ,sendQuizStartNotification} = require("./database");
require("dotenv").config();
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN || "*",
  })
);


let totalConnetedUsers=0;


const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN || "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Student connected: ${socket.id}`);
  ++totalConnetedUsers;
  io.emit('getUsersCount',totalConnetedUsers )

  socket.on("add_socket_id", async (data) => {
    const { studentId } = data;
    await addSocketId({ socketId: socket.id, studentId });
  });

  socket.on("sendAnswer", async (data) => {
    await addScore(data);
  });

  socket.on("sendQuizStartNotification", async (data) => {
    await sendQuizStartNotification(data);
  });

  socket.on("sendQuizDetails", (data) => {
    socket.broadcast.emit("getQuizDetails", data);
  });

  socket.on("sendEndSession", (data) => {
    socket.broadcast.emit("getEndSession", data);
  });

  socket.on("sendQuestion", (data) => {
    socket.broadcast.emit("getQuestion", data);
  });

  socket.on("deleteQuestion", (data) => {
    socket.broadcast.emit("deleteQuestion", data);
  });

  socket.on("disconnect", async () => {
    console.log(`Student disconnected: ${socket.id}`);
    --totalConnetedUsers;
    io.emit('getUsersCount',totalConnetedUsers )
    await removeSocketId({ socketId: socket.id });
  });
});

app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
