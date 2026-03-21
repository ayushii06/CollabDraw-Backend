![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-black)
![License](https://img.shields.io/badge/license-MIT-blue)
# CollabDraw Backend

This repository contains the **backend server for CollabDraw**, a real-time collaborative drawing application that allows multiple users to draw together on the same canvas.

The backend is responsible for handling **real-time communication, room management, and synchronization of drawing events between users.**

---

# Features

### Real-Time Drawing Synchronization
The backend uses **WebSockets (Socket.IO)** to synchronize drawing events between all users connected to the same room.

Whenever a user draws something on the canvas, the event is broadcast to other connected clients in real time.

---

### Room-Based Collaboration
CollabDraw uses **room-based architecture**.

Each drawing session exists inside a **room**, allowing multiple users to collaborate on the same canvas.

Supported operations:

- Join a room
- Leave a room
- Broadcast updates within the room

---

### User Presence Tracking
The backend keeps track of users connected to a room and broadcasts updates when:

- A user joins a room
- A user leaves a room

This ensures all clients stay synchronized with the current room state.

---

### Real-Time Event Broadcasting

The server listens for drawing events and broadcasts them to all other users in the room.

Examples of events handled:

- drawing strokes
- shape creation
- element updates
- canvas reset
- user join/leave

---

# Tech Stack

- **Node.js**
- **Express.js**
- **Socket.IO**
- **CORS**

---

# Architecture

The backend follows a **WebSocket event-driven architecture**.

Flow:

1. User performs an action on the canvas.
2. Frontend emits a Socket.IO event.
3. Server receives the event.
4. Server broadcasts it to all users in the same room.
5. Clients update their canvas accordingly.

# Future Improvements

- Persistent canvas storage
- Authentication system
- Room history recovery
- Drawing replay functionality
- WebRTC voice chat inside rooms
- Performance optimization for large rooms

# Frontend Repository

Frontend code is available here:

https://github.com/ayushii06/CollabDraw

# Contributing

CollabDraw is an **open-source project**, and contributions are welcome.

You can:
- Open issues
- Suggest improvements
- Submit pull requests

# Author

**Ayushi Pal**  
https://github.com/ayushii06


# License

Distributed under the **MIT License**.
