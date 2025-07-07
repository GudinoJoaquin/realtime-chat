import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { PORT } from "./config.js";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://realtime-chat-pied.vercel.app",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "https://realtime-chat-pied.vercel.app",
    methods: ["GET", "POST"],
  })
);

const messagesByRoom = {};

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Usuario se unió a la sala ${roomId}`);

    if (messagesByRoom[roomId]) {
      socket.emit("roomHistory", messagesByRoom[roomId]);
    } else {
      messagesByRoom[roomId] = [];
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`Usuario salió de la sala ${roomId}`);
  });

  socket.on("message", ({ roomId, msg, username }) => {
    const mensaje = { roomId, message: msg };

    if (!messagesByRoom[roomId]) {
      messagesByRoom[roomId] = [];
    }

    const fullMessage = { roomId, message: msg, username };
    messagesByRoom[roomId].push(fullMessage);

    io.to(roomId).emit("message", fullMessage);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

app.get("/", (req, res) => {
  res.send("Servidor corriendo con historial de salas.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
