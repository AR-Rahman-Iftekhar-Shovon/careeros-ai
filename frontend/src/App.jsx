import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import CustomCursor from "./components/CustomCursor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import SessionPage from "./pages/SessionPage";
import CareerAnalysisPage from "./pages/CareerAnalysisPage";
import RoadmapPage from "./pages/RoadmapPage";
import MentorPage from "./pages/MentorPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("careeros_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/sessions" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
          <Route path="/dashboard/career" element={<ProtectedRoute><CareerAnalysisPage /></ProtectedRoute>} />
          <Route path="/dashboard/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/dashboard/mentor" element={<ProtectedRoute><MentorPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;