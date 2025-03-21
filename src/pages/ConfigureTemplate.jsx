import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Alert, 
  Divider
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import api from '../api/api';

const { Title } = Typography;
const { TextArea } = Input;

const WhatsappMessageSender = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const initialValues = {
    phone_number: "555484043307",
    key_wpp: "EAA1hFZCFBcaMBO1k7Ic8lMHorNCoyJ3gg5X1xjyvXIqSleoGTZBeVg30V3yhlEyKf4hnG3KEQ6CQo89oeHdHYvHLu4ZBaRXIqfTkK4hLfUnoZBbPDZCdznRr2Fyy3Ucm85qkJi6kpvSfwVKyiAaj9M4sJoMUO3AxfUSyqmhROnVOPN1k7gsuxATUskHbhbJnM5jkbFDTjx9R6vhqeFJp7NInfxUxHAURDijUruJM6pM0ZD",
    template_wpp: "teste_utilidades",
    phone_number_id: "115101411576723",
    header_text: "Prefeitura de Erechim",
    body_param1: "Eduardo Mokfa",
    body_param2: "Prefeitura de Erechim",
    body_param3: "2025",
    body_param4: "01/05/2025",
    body_param5: "pmErechim"
  };

  const onFinish = async (values) => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    // Construindo o payload no formato correto
    const payload = {
      phone_number: values.phone_number,
      key_wpp: values.key_wpp,
      template_wpp: values.template_wpp,
      phone_number_id: values.phone_number_id,
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "text",
              text: values.header_text
            }
          ]
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: values.body_param1
            },
            {
              type: "text",
              text: values.body_param2
            },
            {
              type: "text",
              text: values.body_param3
            },
            {
              type: "text",
              text: values.body_param4
            },
            {
              type: "text",
              text: values.body_param5
            }
          ]
        }
      ]
    };

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

      const response = await api.post('/api/whatsapp/sendFirstMessage', payload);
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.details}`);
      }

      const data = await response.json();
      setSuccess(true);
      setLoading(false);
      console.log('Mensagem enviada com sucesso:', data);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  return (
    <Card style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>Envio de Mensagens WhatsApp</Title>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Número de Telefone" 
              name="phone_number"
              rules={[{ required: true, message: 'Por favor insira o número de telefone' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item 
              label="ID do Número de Telefone" 
              name="phone_number_id"
              rules={[{ required: true, message: 'Por favor insira o ID do telefone' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Template WhatsApp" 
              name="template_wpp"
              rules={[{ required: true, message: 'Por favor insira o template' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          label="Chave WhatsApp" 
          name="key_wpp"
          rules={[{ required: true, message: 'Por favor insira a chave WhatsApp' }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Divider orientation="left">Parâmetros do Cabeçalho</Divider>
        
        <Form.Item 
          label="Texto do Cabeçalho" 
          name="header_text"
          rules={[{ required: true, message: 'Por favor insira o texto do cabeçalho' }]}
        >
          <Input />
        </Form.Item>

        <Divider orientation="left">Parâmetros do Corpo</Divider>
        
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item 
              label="Parâmetro 1" 
              name="body_param1"
              rules={[{ required: true, message: 'Por favor insira o parâmetro 1' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item 
              label="Parâmetro 2" 
              name="body_param2"
              rules={[{ required: true, message: 'Por favor insira o parâmetro 2' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item 
              label="Parâmetro 3" 
              name="body_param3"
              rules={[{ required: true, message: 'Por favor insira o parâmetro 3' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item 
              label="Parâmetro 4" 
              name="body_param4"
              rules={[{ required: true, message: 'Por favor insira o parâmetro 4' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item 
              label="Parâmetro 5" 
              name="body_param5"
              rules={[{ required: true, message: 'Por favor insira o parâmetro 5' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SendOutlined />} 
            loading={loading}
            block
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </Form.Item>
      </Form>

      {error && (
        <Alert
          message="Erro"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {success && (
        <Alert
          message="Sucesso"
          description="Mensagem enviada com sucesso!"
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};

export default WhatsappMessageSender;