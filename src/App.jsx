import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import CreateVideo from "./components/CreateVideo";  // ✅ Import CreateVideo Page
import GenerateThumbnail from './components/GenerateThumbnail';
import Caption from "./components/Caption";
import Calendar from "./components/Calendar";
function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Authentication Routes */}
        <Route path="/" element={<Navigate to="/login" />} />   {/* Redirect to login by default */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />


        {/* ✅ Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-video" element={<CreateVideo />} />
        <Route path="/generate-thumbnail" element={<GenerateThumbnail />} />
        <Route path="/your-caption" element={<Caption />} />
        <Route path="/calendar" element={<Calendar />} />



        {/* ✅ Catch-All Route (404 Handling) */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
