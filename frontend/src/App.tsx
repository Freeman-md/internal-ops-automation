import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { RunSession } from "./pages/RunSession";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/run" element={<RunSession />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
