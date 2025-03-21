import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [message, setMessage] = useState('');
  
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  
  const onFinish = async (values) => {
    const { email, password } = values;
    
    if (!email || !password) {
      setMessage('Por favor, preencha todos os campos');
      return;
    }
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/whatsapp');
    } else {
      setMessage(result.message || 'Erro ao fazer login');
    }
  };
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Login</Title>
        </div>
        
        {message && <Alert message={message} type="error" showIcon style={{ marginBottom: 16 }} />}
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Por favor, digite seu email' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Digite seu email" 
              type="email"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor, digite sua senha' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Digite sua senha"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              {loading ? 'Processando...' : 'Entrar'}
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <Text>Não tem uma conta?</Text>
            <Link href="/register">Registre-se</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Login;