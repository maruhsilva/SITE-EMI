import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import Admin from './pages/Admin';
import Home from './pages/Home'; 
import Checkout from './pages/Checkout'; // <-- ESTA LINHA FALTAVA!

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token_fisioemi');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* NOVA ROTA: Acesso ao resumo do curso (sem aula específica) */}
        <Route 
          path="/curso/:courseId" 
          element={
            <PrivateRoute>
              <CoursePlayer />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/curso/:courseId/aula/:lessonId" 
          element={
            <PrivateRoute>
              <CoursePlayer />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/checkout/:courseId" 
          element={<Checkout />} 
        />

        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;