import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd'; // Optional: for theme customization
import Login from './pages/Login';
import Register from './pages/Register';
import ConfigureTemplate from './pages/ConfigureTemplate';
import { PrivateRoute } from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout'; // New layout component
import MessageConfigList from './pages/MessageConfig';
import MessageHistoryDashboard from './pages/MessageHistory';

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/whatsapp" 
              element={
                <PrivateRoute>
                  <Layout>
                    <ConfigureTemplate />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/messageConfig" 
              element={
                <PrivateRoute>
                  <Layout>
                    <MessageConfigList />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/messageHistory" 
              element={
                <PrivateRoute>
                  <Layout>
                    <MessageHistoryDashboard />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Layout>
                    {}
                  </Layout>
                </PrivateRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;