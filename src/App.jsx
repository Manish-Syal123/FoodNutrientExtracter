// import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Registeration from "./components/Registeration";
import ProtectedRoute from "./Utils/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import History from "./components/History";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registeration />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
