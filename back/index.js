import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { PORT } from "./config.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Mensajes guardados por sala
const messagesByRoom = {}; // Ej: { sala1: [{ roomId, message }] }

io.on("connection", (socket) => {
  console.log("Usuario conectado");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Usuario se unió a la sala ${roomId}`);

    // Enviar historial al que se conecta
    if (messagesByRoom[roomId]) {
      socket.emit("roomHistory", messagesByRoom[roomId]);
    } else {
      messagesByRoom[roomId] = []; // Inicializar si no existe
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

    // Guardar también el username
    const fullMessage = { roomId, message: msg, username };
    messagesByRoom[roomId].push(fullMessage);

    // Emitir con username también
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
