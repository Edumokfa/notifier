import React from 'react';
import { Navigate } from 'react-router-dom';
import { Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

export const PrivateRoute = ({ children, requiredRole  }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Modal
        open={loading}
        closable={false}
        footer={null}
        centered
        maskClosable={false}
        styles={{
          body: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '30px'
          }
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Carregando...</p>
        </div>
      </Modal>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  
  if (loading) {
    return (
      <Modal
        open={loading}
        closable={false}
        footer={null}
        centered
        maskClosable={false}
        styles={{
          body: { 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '30px'
          }
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin indicator={antIcon} size="large" />
          <p style={{ marginTop: 16 }}>Carregando...</p>
        </div>
      </Modal>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};