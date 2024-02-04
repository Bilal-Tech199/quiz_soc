const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
require("dotenv").config();
app.use(
  cors({
    origin: process.env.ALLOW_ORIGIN || "*",
  })
);

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN || "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Student connected: ${socket.id}`);

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

  socket.on("disconnect", () => {
    console.log(`Student disconnected: ${socket.id}`);
  });
});


app.get('/',(req,res)=>{
  res.send('Server is running...')
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
