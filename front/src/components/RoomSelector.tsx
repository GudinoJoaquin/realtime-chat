import { useCallback, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";

export default function RoomSelector() {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    const value = inputRef.current?.value;
    localStorage.setItem("username", value ?? "anonimo");
    alert("Nombre de usuario guardado");
    inputRef.current.value = "";
  }, []);

  return (
    <main>
      <Link to={"/sala1"}>Sala 1</Link>
      <Link to={"/sala2"}>Sala 2</Link>
      <Link to={"/sala3"}>Sala 3</Link>

      <form onSubmit={handleSubmit}>
        <input type="text" ref={inputRef} placeholder="Username" />
        <button type="submit">Guardar</button>
      </form>
    </main>
  );
}
