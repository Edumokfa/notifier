import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Space, Card, 
  notification, Popconfirm, Typography, Spin, 
  Switch, Divider, Row, Col
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SaveOutlined, CloseOutlined, UserOutlined,
  ImportOutlined, ExportOutlined
} from '@ant-design/icons';
import api from '../api/api';
import Papa from 'papaparse';

const { Title, Text } = Typography;

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [form] = Form.useForm();
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/contacts');
      setContacts(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar os contatos: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentContact(null);
    form.resetFields();
    form.setFieldsValue({
      recebeEmail: true,
      recebeWhatsapp: true,
    });
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentContact(record);
    form.setFieldsValue(record);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/contacts/${id}`);
      notification.success({
        message: 'Sucesso',
        description: 'Contato excluído com sucesso!',
      });
      fetchContacts();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao excluir contato: ' + error.message,
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (currentContact) {
        await api.put(`/api/contacts/${currentContact.id}`, values);
        notification.success({
          message: 'Sucesso',
          description: 'Contato atualizado com sucesso!',
        });
      } else {
        await api.post('/api/contacts', values);
        notification.success({
          message: 'Sucesso',
          description: 'Contato criado com sucesso!',
        });
      }
      setFormVisible(false);
      fetchContacts();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao salvar contato: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data;
          await api.post('/api/contacts/import', { contacts: parsedData });
          notification.success({
            message: 'Sucesso',
            description: 'Contatos importados com sucesso!',
          });
          fetchContacts();
        } catch (error) {
          notification.error({
            message: 'Erro',
            description: 'Falha ao importar contatos: ' + error.message,
          });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        notification.error({
          message: 'Erro',
          description: 'Falha ao processar arquivo CSV: ' + error.message,
        });
        setLoading(false);
      }
    });
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Recebe E-mail',
      dataIndex: 'recebeEmail',
      key: 'recebeEmail',
      render: (val) => val ? 'Sim' : 'Não'
    },
    {
      title: 'Recebe WhatsApp',
      dataIndex: 'recebeWhatsapp',
      key: 'recebeWhatsapp',
      render: (val) => val ? 'Sim' : 'Não'
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
            title="Tem certeza que deseja excluir este contato?"
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
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Gerenciamento de Contatos
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Novo Contato
            </Button>

            <Button
              icon={<ImportOutlined />}
              onClick={() => fileInputRef.current.click()}
            >
              Importar CSV
            </Button>

            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportCSV}
              style={{ display: 'none' }}
            />
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={contacts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={currentContact ? 'Editar Contato' : 'Novo Contato'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        width={600}
        footer={modalFooter}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            recebeEmail: true,
            recebeWhatsapp: true,
          }}
        >
          <Card>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nome"
                  rules={[{ required: true, message: 'Por favor, insira o nome' }]}
                >
                  <Input placeholder="Nome do contato" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-mail"
                  rules={[{ required: true, message: 'Por favor, insira o e-mail' }]}
                >
                  <Input placeholder="email@exemplo.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefone"
                  rules={[{ required: true, message: 'Por favor, insira o telefone' }]}
                >
                  <Input placeholder="(XX) XXXXX-XXXX" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Preferências de Comunicação</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="recebeEmail"
                  label="Recebe E-mail"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="recebeWhatsapp"
                  label="Recebe WhatsApp"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactList;