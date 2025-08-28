import "./App.css";
import Navbar from "./Components/Navbar/Navbar.jsx";

import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );
}

export default App;