import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboards";
import IndividualDashboard from "./components/IndividualDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard/:type" element={<Dashboard />} />
        <Route path="/dashboard/individuals" element={<IndividualDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
