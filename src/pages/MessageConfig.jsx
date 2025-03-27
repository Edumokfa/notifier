import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm,
  Space,
  Tag
} from 'antd';
import api from '../api/api';

const { Option } = Select;

const MessageConfigList = () => {
  const [messageConfigs, setMessageConfigs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [form] = Form.useForm();

  // Buscar configurações de mensagem
  const fetchMessageConfigs = async () => {
    try {
      const response = await api.get('/api/messageConfig');
      setMessageConfigs(response.data.data);
    } catch (error) {
      message.error('Erro ao carregar configurações de mensagem');
    }
  };

  // Buscar templates
  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/template');
      setTemplates(response.data.data);
    } catch (error) {
      message.error('Erro ao carregar templates');
    }
  };

  // Abrir modal para nova configuração
  const handleAddConfig = () => {
    setCurrentConfig(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Editar configuração existente
  const handleEditConfig = (config) => {
    setCurrentConfig(config);
    form.setFieldsValue({
      channelType: config.channelType,
      executionFrequency: config.executionFrequency,
      templateId: config.templateId,
      messageTemplate: config.messageTemplate,
      status: config.status,
      whatsappConfig: config.whatsappConfig,
      emailConfig: config.emailConfig
    });
    setIsModalVisible(true);
  };

  // Salvar configuração
  const handleSave = async (values) => {
    try {
      // Adicionar configurações específicas de canal
      if (values.channelType === 'whatsapp') {
        values.whatsappConfig = {
          apiKey: values.whatsappApiKey,
          phoneNumber: values.whatsappPhoneNumber
        };
      } else if (values.channelType === 'email') {
        values.emailConfig = {
          smtpServer: values.emailSmtpServer,
          smtpPort: values.emailSmtpPort,
          username: values.emailUsername,
          password: values.emailPassword
        };
      }

      // Remover campos extras do formulário
      delete values.whatsappApiKey;
      delete values.whatsappPhoneNumber;
      delete values.emailSmtpServer;
      delete values.emailSmtpPort;
      delete values.emailUsername;
      delete values.emailPassword;

      if (currentConfig) {
        // Atualizar configuração existente
        await api.put(`/api/messageConfig/${currentConfig.id}`, values);
        message.success('Configuração atualizada com sucesso');
      } else {
        // Criar nova configuração
        await api.post('/api/messageConfig', values);
        message.success('Configuração criada com sucesso');
      }
      
      setIsModalVisible(false);
      fetchMessageConfigs();
    } catch (error) {
      message.error('Erro ao salvar configuração');
    }
  };

  // Excluir configuração
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/messageConfig/${id}`);
      message.success('Configuração removida com sucesso');
      fetchMessageConfigs();
    } catch (error) {
      message.error('Erro ao remover configuração');
    }
  };

  // Colunas da tabela
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
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleEditConfig(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir esta configuração?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button type="link" danger>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchMessageConfigs();
    fetchTemplates();
  }, []);

  return (
    <div>
      <Button 
        type="primary" 
        onClick={handleAddConfig}
        style={{ marginBottom: 16 }}
      >
        Nova Configuração
      </Button>

      <Table 
        columns={columns} 
        dataSource={messageConfigs} 
        rowKey="id"
      />

      <Modal
        title={currentConfig ? 'Editar Configuração' : 'Nova Configuração'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
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

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.channelType !== currentValues.channelType
            }
          >
            {({ getFieldValue }) => 
              getFieldValue('channelType') === 'whatsapp' ? (
                <>
                </>
              ) : getFieldValue('channelType') === 'email' ? (
                <>
                  <Form.Item
                    name="emailSmtpServer"
                    label="Servidor SMTP"
                    rules={[{ 
                      required: true, 
                      message: 'Por favor, insira o servidor SMTP' 
                    }]}
                  >
                    <Input placeholder="Servidor SMTP" />
                  </Form.Item>
                  <Form.Item
                    name="emailSmtpPort"
                    label="Porta SMTP"
                    rules={[{ 
                      required: true, 
                      message: 'Por favor, insira a porta SMTP' 
                    }]}
                  >
                    <Input type="number" placeholder="Porta SMTP" />
                  </Form.Item>
                  <Form.Item
                    name="emailUsername"
                    label="Usuário SMTP"
                    rules={[{ 
                      required: true, 
                      message: 'Por favor, insira o usuário SMTP' 
                    }]}
                  >
                    <Input placeholder="Usuário SMTP" />
                  </Form.Item>
                  <Form.Item
                    name="emailPassword"
                    label="Senha SMTP"
                    rules={[{ 
                      required: true, 
                      message: 'Por favor, insira a senha SMTP' 
                    }]}
                  >
                    <Input.Password placeholder="Senha SMTP" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

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
            label="Mensagem Personalizada (Opcional)"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Mensagem personalizada, caso não use um template" 
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="active"
          >
            <Select placeholder="Selecione o status">
              <Option value="active">Ativo</Option>
              <Option value="inactive">Inativo</Option>
              <Option value="paused">Pausado</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              block
            >
              Salvar Configuração
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessageConfigList;