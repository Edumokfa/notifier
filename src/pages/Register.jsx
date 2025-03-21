import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Form, Input, Button, Card, Alert, Typography, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text, Link } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [message, setMessage] = useState('');
  
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();
  
  const onFinish = async (values) => {
    const { name, email, password, confirmPassword } = values;
    
    if (!name || !email || !password) {
      setMessage('Por favor, preencha todos os campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem');
      return;
    }
    
    const userData = {
      name,
      email,
      password
    };
    
    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setMessage(result.message || 'Erro ao registrar');
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
          <Title level={2}>Registre-se</Title>
        </div>
        
        {message && <Alert message={message} type="error" showIcon style={{ marginBottom: 16 }} />}
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Por favor, digite seu nome' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Digite seu nome" 
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor, digite seu email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Digite seu email" 
              type="email"
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Por favor, digite sua senha' },
              { min: 6, message: 'A senha deve ter pelo menos 6 caracteres' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Digite sua senha"
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Por favor, confirme sua senha' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('As senhas não coincidem'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirme sua senha"
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              {loading ? 'Processando...' : 'Registrar'}
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <Text>Já tem uma conta?</Text>
            <Link href="/login">Faça login</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Register;