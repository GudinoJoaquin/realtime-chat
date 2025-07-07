import { Route, Routes } from "react-router-dom";
import Room from "./components/[roomId].tsx";
import RoomSelector from "./components/RoomSelector.tsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoomSelector />} />
      <Route path="/:roomId" element={<Room />} />
    </Routes>
  );
}
