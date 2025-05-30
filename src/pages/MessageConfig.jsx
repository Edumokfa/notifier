import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Space, Card, 
  notification, Popconfirm, Typography, Spin, 
  Select, Tag, Divider, Row, Col
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SaveOutlined, CloseOutlined, MessageOutlined,
  SettingOutlined
} from '@ant-design/icons';
import api from '../api/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MessageConfigList = () => {
  const [messageConfigs, setMessageConfigs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMessageConfigs();
    fetchTemplates();
  }, []);

  const fetchMessageConfigs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/messageConfig');
      setMessageConfigs(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar configurações de mensagem: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/template');
      setTemplates(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar templates: ' + error.message,
      });
    }
  };

  const handleCreate = () => {
    setCurrentConfig(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      channelType: 'whatsapp'
    });
    setFormVisible(true);
  };

  const handleEdit = (config) => {
    setCurrentConfig(config);
    
    const formData = {
      channelType: config.channelType,
      executionFrequency: config.executionFrequency,
      templateId: config.templateId,
      messageTemplate: config.messageTemplate,
      status: config.status,
    };
    
    // Adicionar campos específicos de cada canal
    if (config.channelType === 'whatsapp' && config.whatsappConfig) {
      formData.whatsappApiKey = config.whatsappConfig.apiKey;
      formData.whatsappPhoneNumber = config.whatsappConfig.phoneNumber;
    } else if (config.channelType === 'email' && config.emailConfig) {
      formData.emailSmtpServer = config.emailConfig.smtpServer;
      formData.emailSmtpPort = config.emailConfig.smtpPort;
      formData.emailUsername = config.emailConfig.username;
      formData.emailPassword = config.emailConfig.password;
    }
    
    form.setFieldsValue(formData);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/messageConfig/${id}`);
      notification.success({
        message: 'Sucesso',
        description: 'Configuração removida com sucesso!',
      });
      fetchMessageConfigs();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao remover configuração: ' + error.message,
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Adicionar configurações específicas de canal
      const configData = { ...values };
      
      if (values.channelType === 'whatsapp') {
        configData.whatsappConfig = {
          apiKey: values.whatsappApiKey,
          phoneNumber: values.whatsappPhoneNumber
        };
      } else if (values.channelType === 'email') {
        configData.emailConfig = {
          smtpServer: values.emailSmtpServer,
          smtpPort: values.emailSmtpPort,
          username: values.emailUsername,
          password: values.emailPassword
        };
      }

      // Remover campos extras do formulário
      delete configData.whatsappApiKey;
      delete configData.whatsappPhoneNumber;
      delete configData.emailSmtpServer;
      delete configData.emailSmtpPort;
      delete configData.emailUsername;
      delete configData.emailPassword;

      if (currentConfig) {
        await api.put(`/api/messageConfig/${currentConfig.id}`, configData);
        notification.success({
          message: 'Sucesso',
          description: 'Configuração atualizada com sucesso!',
        });
      } else {
        await api.post('/api/messageConfig', configData);
        notification.success({
          message: 'Sucesso',
          description: 'Configuração criada com sucesso!',
        });
      }
      
      setFormVisible(false);
      fetchMessageConfigs();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao salvar configuração: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChannelSpecificFields = () => {
    const channelType = form.getFieldValue('channelType');
    
    if (channelType === 'whatsapp') {
      return (
        <>
          <Form.Item
            name="whatsappApiKey"
            label="API Key do WhatsApp"
            rules={[{ 
              required: true, 
              message: 'Por favor, insira a API Key do WhatsApp' 
            }]}
          >
            <TextArea 
              placeholder="Chave de API do WhatsApp" 
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
          <Form.Item
            name="whatsappPhoneNumber"
            label="Número de Telefone"
            rules={[{ 
              required: true, 
              message: 'Por favor, insira o número de telefone' 
            }]}
          >
            <Input placeholder="Número de telefone com código do país" />
          </Form.Item>
        </>
      );
    } else if (channelType === 'email') {
      return (
        <>
          <Form.Item
            name="emailSmtpServer"
            label="Servidor SMTP"
            rules={[{ 
              required: true, 
              message: 'Por favor, insira o servidor SMTP' 
            }]}
          >
            <Input placeholder="Ex: smtp.gmail.com" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="emailSmtpPort"
                label="Porta SMTP"
                rules={[{ 
                  required: true, 
                  message: 'Por favor, insira a porta SMTP' 
                }]}
              >
                <Input type="number" placeholder="Ex: 587" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="emailUsername"
            label="Usuário SMTP"
            rules={[{ 
              required: true, 
              message: 'Por favor, insira o usuário SMTP' 
            }]}
          >
            <Input placeholder="Seu endereço de e-mail" />
          </Form.Item>
          <Form.Item
            name="emailPassword"
            label="Senha SMTP"
            rules={[{ 
              required: true, 
              message: 'Por favor, insira a senha SMTP' 
            }]}
          >
            <Input.Password placeholder="Senha ou chave de app" />
          </Form.Item>
        </>
      );
    }
    
    return null;
  };

  const columns = [
    {
      title: 'Canal',
      dataIndex: 'channelType',
      key: 'channelType',
      render: (type) => {
        const typeMap = {
          'whatsapp': 'WhatsApp',
          'email': 'E-mail',
          'sms': 'SMS'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: 'Frequência',
      dataIndex: 'executionFrequency',
      key: 'executionFrequency',
      render: (freq) => {
        const freqMap = {
          'every_1_hour': 'A cada 1 hora',
          'every_6_hours': 'A cada 6 horas',
          'every_12_hours': 'A cada 12 horas',
          'every_24_hours': 'A cada 24 horas',
          'every_7_days': 'A cada 7 dias',
          'every_15_days': 'A cada 15 dias',
          'every_30_days': 'A cada 30 dias',
          'every_60_days': 'A cada 60 dias',
          'every_90_days': 'A cada 90 dias',
          'every_180_days': 'A cada 180 dias',
          'every_1_year': 'A cada 1 ano'
        };
        return freqMap[freq] || freq;
      }
    },
    {
      title: 'Template',
      dataIndex: 'template',
      key: 'template',
      render: (template) => template ? template.name : 'Sem template'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'active': 'Ativo',
          'inactive': 'Inativo',
          'paused': 'Pausado'
        };
        const colorMap = {
          'active': 'green',
          'inactive': 'red',
          'paused': 'orange'
        };
        return <Tag color={colorMap[status]}>{statusMap[status]}</Tag>;
      }
    },
    {
      title: 'Próxima Execução',
      dataIndex: 'nextExecutionDate',
      key: 'nextExecutionDate',
      render: (date) => date ? new Date(date).toLocaleString() : 'Não agendado'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta configuração?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button icon={<DeleteOutlined />} danger>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const modalFooter = [
    <Button key="cancel" onClick={() => setFormVisible(false)} icon={<CloseOutlined />}>
      Cancelar
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      onClick={() => form.submit()} 
      icon={<SaveOutlined />}
    >
      Salvar
    </Button>
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={2}>
            <MessageOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
            Configurações de Mensagens
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nova Configuração
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={messageConfigs}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={currentConfig ? 'Editar Configuração' : 'Nova Configuração'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        width={800}
        footer={modalFooter}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            channelType: 'whatsapp'
          }}
        >
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="channelType"
                  label="Canal de Comunicação"
                  rules={[{ 
                    required: true, 
                    message: 'Por favor, selecione o canal' 
                  }]}
                >
                  <Select placeholder="Selecione o canal">
                    <Option value="whatsapp">WhatsApp</Option>
                    <Option value="email">E-mail</Option>
                    <Option value="sms">SMS</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                >
                  <Select placeholder="Selecione o status">
                    <Option value="active">Ativo</Option>
                    <Option value="inactive">Inativo</Option>
                    <Option value="paused">Pausado</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="executionFrequency"
              label="Frequência de Execução"
              rules={[{ 
                required: true, 
                message: 'Por favor, selecione a frequência' 
              }]}
            >
              <Select placeholder="Selecione a frequência">
                <Option value="every_1_hour">A cada 1 hora</Option>
                <Option value="every_6_hours">A cada 6 horas</Option>
                <Option value="every_12_hours">A cada 12 horas</Option>
                <Option value="every_24_hours">A cada 24 horas</Option>
                <Option value="every_7_days">A cada 7 dias</Option>
                <Option value="every_15_days">A cada 15 dias</Option>
                <Option value="every_30_days">A cada 30 dias</Option>
                <Option value="every_60_days">A cada 60 dias</Option>
                <Option value="every_90_days">A cada 90 dias</Option>
                <Option value="every_180_days">A cada 180 dias</Option>
                <Option value="every_1_year">A cada 1 ano</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left">Mensagem</Divider>

            <Form.Item
              name="templateId"
              label="Template"
            >
              <Select 
                placeholder="Selecione um template (opcional)"
                allowClear
              >
                {templates.map(template => (
                  <Option key={template.id} value={template.id}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="messageTemplate"
              label="Mensagem Personalizada"
              tooltip="Use apenas se não selecionar um template"
            >
              <TextArea 
                rows={4} 
                placeholder="Mensagem personalizada, caso não use um template" 
              />
            </Form.Item>

            <Divider orientation="left">Configurações Específicas do Canal</Divider>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => 
                prevValues.channelType !== currentValues.channelType
              }
            >
              {() => renderChannelSpecificFields()}
            </Form.Item>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default MessageConfigList;