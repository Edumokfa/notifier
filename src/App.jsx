import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WhatsappMessageSender from './pages/ConfigureTemplate';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/whatsapp" 
            element={<PrivateRoute component={WhatsappMessageSender} />} 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;