const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);


  socket.on("drawing_step", (drawData) => {
    socket.broadcast.emit("drawing_step", drawData);
  });

  socket.on("cursor", (position) => {
    socket.broadcast.emit("cursor", position);
  });

  socket.on("undo", (removed) => {
    io.emit("undo", removed);
  });

  socket.on("redo", (restored) => {
    io.emit("redo", restored);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

