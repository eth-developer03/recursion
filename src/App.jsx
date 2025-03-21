import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import CreateVideo from "./components/CreateVideo";  // ✅ Import CreateVideo Page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-video" element={<CreateVideo />} />  {/* ✅ Added CreateVideo route */}
      </Routes>
    </Router>
  );
}

export default App;
