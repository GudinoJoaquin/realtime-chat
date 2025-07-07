import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type FormEvent,
} from "react";
import { io, type Socket } from "socket.io-client";
import { Link, useParams, useNavigate } from "react-router-dom";

type ChatMessage = {
  roomId: string;
  message: string;
  username: string;
};

export default function App() {
  const { roomId } = useParams<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState<string>("anonimo");
  const socketRef = useRef<Socket | null>(null);
  const previousRoom = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      navigate("/", { replace: true });
    }
  }, [roomId, navigate]);

  useEffect(() => {
    setUsername(localStorage.getItem("username") as string);
  }, []);

  useEffect(() => {
    socketRef.current = io("https://realtime-chat-5kvw.onrender.com");

    socketRef.current.on("message", (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (!socketRef.current) return;

    if (previousRoom.current) {
      socketRef.current.emit("leaveRoom", previousRoom.current);
    }

    socketRef.current.emit("joinRoom", roomId);
    previousRoom.current = roomId as string;

    setMessages([]);

    socketRef.current.once("roomHistory", (mensajes) => {
      setMessages(mensajes);
    });
  }, [roomId]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!inputRef.current) return;
      const msg = inputRef.current.value.trim();
      if (!msg) return;

      socketRef.current?.emit("message", {
        roomId,
        msg,
        username,
      });

      inputRef.current.value = "";
    },
    [roomId, username]
  );

  return (
    <main style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <Link to={"/"}>Volver</Link>
      <h1>Chat Privado</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribí tu mensaje"
          autoComplete="off"
          style={{ marginRight: "0.5rem" }}
        />
        <button type="submit">Enviar</button>
      </form>

      <ul style={{ marginTop: "1rem" }}>
        {messages.map((m, i) => (
          <li key={i}>
            <strong>[{m.username}]</strong>: {m.message}
          </li>
        ))}
      </ul>
    </main>
  );
}
