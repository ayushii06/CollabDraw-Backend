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
    origin: "https://draw-tool-seven.vercel.app",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("🟢 NEW CONNECTION:", socket.id);

  socket.on("join-room", ({ roomId, username, userId }) => {
    console.log("\n📥 JOIN REQUEST");
    console.log("socket:", socket.id);
    console.log("userId:", userId);
    console.log("roomId:", roomId);

    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: {},
        elements: [],
      };
      console.log("🆕 Created new room:", roomId);
    }

    const room = rooms[roomId];

    // 🔥 Remove old connection (same userId)
    Object.keys(room.users).forEach((key) => {
      if (room.users[key].userId === userId) {
        console.log("♻️ Removing old connection:", key);
        delete room.users[key];
      }
    });

    const color =
      COLORS[Object.keys(room.users).length % COLORS.length];

    const user = {
      userId,
      username,
      color,
      socketId: socket.id,
    };

    room.users[socket.id] = user;

    console.log("✅ User added:", user);
    console.log("👥 Total users:", Object.keys(room.users).length);

    socket.emit("room-joined", {
      users: Object.values(room.users),
      elements: room.elements,
    });

    socket.to(roomId).emit("user-joined", user);

    io.to(roomId).emit(
      "room-users",
      Object.values(room.users)
    );

    console.log("📦 Current users list:", room.users);
  });

  socket.on("sync-element", ({ roomId, element }) => {
    console.log("\n✏️ ELEMENT SYNC");
    console.log("room:", roomId);
    console.log(element)
    console.log("elementId:", element.id);

    const room = rooms[roomId];
    if (!room) {
      console.log("❌ Room not found");
      return;
    }

    const index = room.elements.findIndex(
      (el) => el.id === element.id
    );

    if (index === -1) {
      console.log("➕ New element added");
      room.elements.push(element);
    } else {
      console.log("♻️ Element updated");
      room.elements[index] = element;
    }

    socket.to(roomId).emit("element-sync", element);
  });

  socket.on("delete-element", ({ roomId, id }) => {
    console.log("\n🗑️ DELETE ELEMENT");
    console.log("room:", roomId);
    console.log("elementId:", id);

    const room = rooms[roomId];
    if (!room) return;

    room.elements = room.elements.filter(
      (el) => el.id !== id
    );

    socket.to(roomId).emit("element-delete", id);
  });

  socket.on("cursor-move", ({ roomId, userId, x, y }) => {
    const room = rooms[roomId];
    if (!room) return;

    const user = Object.values(room.users).find(
      (u) => u.userId === userId
    );

    if (!user) {
      console.log("⚠️ Cursor user not found:", userId);
      return;
    }

    socket.to(roomId).emit("cursor-update", {
      user,
      x,
      y,
    });
  });

  socket.on("leave-room", ({ roomId }) => {
    console.log("\n🚪 LEAVE ROOM");
    console.log("socket:", socket.id);
    console.log("userId:", socket.user);
    // username
  
    const room = rooms[roomId];
    if (!room) return;

     const user = rooms[roomId]?.users[socket.id];


    delete room.users[socket.id];

    socket.leave(roomId);

    socket.to(roomId).emit("user-left", user);

    io.to(roomId).emit(
      "room-users",
      Object.values(room.users)
    );

    socket.emit("left-room");

    console.log("👥 Users after leave:", Object.keys(room.users).length);

    if (Object.keys(room.users).length === 0) {
      console.log("🗑️ Deleting empty room:", roomId);
      delete rooms[roomId];
    }
  });

  socket.on("disconnect", () => {
    console.log("\n🔴 DISCONNECT");
    console.log("socket:", socket.id);
    console.log("userId:", socket.userId);


    
    const { roomId, userId } = socket;
    const user = rooms[roomId]?.users[socket.id];

    if (!roomId || !rooms[roomId]) {
      console.log("⚠️ Room not found during disconnect");
      return;
    }

    const room = rooms[roomId];

    delete room.users[socket.id];

    socket.to(roomId).emit("user-left", user);

    io.to(roomId).emit(
      "room-users",
      Object.values(room.users)
    );

    console.log("👥 Users after disconnect:", Object.keys(room.users).length);

    if (Object.keys(room.users).length === 0) {
      console.log("🗑️ Deleting empty room:", roomId);
      delete rooms[roomId];
    }

    console.log("📦 Current rooms state:", rooms);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("🚀 Socket server running on 5000");
});