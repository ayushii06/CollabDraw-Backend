import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const COLORS = [
  "#FF5733",
  "#33FF57",
  "#3380FF",
  "#FF33A8",
  "#FFD133",
  "#33FFF3",
];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {

  // As someone joins the room, they will be added to users list and also a notification will be sent to all clients in the room
 socket.on("join-room", ({ roomId, name }) => {
  socket.join(roomId);
  socket.roomId = roomId;

  if (!rooms[roomId]) {
    rooms[roomId] = {};
  }

  const color = COLORS[Object.keys(rooms[roomId]).length % COLORS.length];

  const user = {
    userId: socket.id,
    name,
    color,
  };

  rooms[roomId][socket.id] = user;

  // 🔹 notify others that someone joined
  console.log(user);
  socket.to(roomId).emit("user-joined", user);

  // 🔹 send updated users list
  io.to(roomId).emit("room-users", Object.values(rooms[roomId]));
});

  socket.on("draw-element", (element) => {
    // console.log("recevied", element);
    socket.to(socket.roomId).emit("draw", element);
  });
  socket.on("update-element", (element) => {
    // console.log("update recevied", element);
    socket.to(socket.roomId).emit("update", element);
  });

  socket.on("cursor-move", (data) => {
    const roomId = socket.roomId;

    if (!roomId) return;

    const user = rooms[roomId]?.[socket.id];

    if (!user) return;

    socket.to(roomId).emit("cursor-update", {
      userId: socket.id,
      name: user.name,
      color: user.color,
      x: data.x,
      y: data.y,
    });
  });

  socket.on("leave-room", () => {
  const roomId = socket.roomId;

  if (!roomId || !rooms[roomId]) return;

  const user = rooms[roomId][socket.id];

  delete rooms[roomId][socket.id];

  socket.leave(roomId);

  socket.to(roomId).emit("user-left", user);

  io.to(roomId).emit("room-users", Object.values(rooms[roomId]));

  socket.emit("left-room"); // confirmation to the leaving user
});

  socket.on("disconnect", () => {
    const roomId = socket.roomId;

    if (!roomId || !rooms[roomId]) return;

    delete rooms[roomId][socket.id];

    io.to(roomId).emit("room-users", Object.values(rooms[roomId]));
  });
});

server.listen(5000, () => {
  console.log("Socket server running on 5000");
});
