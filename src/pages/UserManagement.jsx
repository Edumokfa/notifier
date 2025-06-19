import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Select, Space, Card, 
  notification, Popconfirm, Typography, Spin, 
  Tabs, Tag, Input, Divider
} from 'antd';
import { 
  EditOutlined, SaveOutlined, CloseOutlined, UserOutlined,
  TeamOutlined, CrownOutlined, CheckCircleOutlined,
  PlusOutlined, DeleteOutlined, UserAddOutlined, SearchOutlined
} from '@ant-design/icons';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext'; // Adjust import path as needed

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [addUserForm] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllUsers();
    fetchRelatedUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/list');
      setAllUsers(response.data.users);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar usuários: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/listRelatedUsers?userId=' + user.id);
      setRelatedUsers(response.data.users);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar usuários relacionados: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/api/user/list');
      // Filtrar usuários que não estão na lista de relacionados
      const relatedUserIds = relatedUsers.map(u => u.id);
      const available = response.data.users.filter(u => 
        !relatedUserIds.includes(u.id) && u.id !== user.id
      );
      setAvailableUsers(available);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar usuários disponíveis: ' + error.message,
      });
    }
  };

  const handleEditRole = (record) => {
    setCurrentUser(record);
    form.setFieldsValue({
      role: record.role,
      userId: record.id
    });
    setModalVisible(true);
  };

  const handleUpdateRole = async (values) => {
    setLoading(true);
    try {
      await api.put('/api/user/updateRole', {
        userId: values.userId,
        newRole: values.role
      });
      
      notification.success({
        message: 'Sucesso',
        description: 'Role do usuário atualizada com sucesso!',
      });
      
      setModalVisible(false);
      fetchAllUsers();
      fetchRelatedUsers();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao atualizar role: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelatedUser = async (values) => {
    setLoading(true);
    try {
      await api.post('/api/user/addRelatedUser', {
        userId: user.id,
        referenceUserId: values.userId
      });
      
      notification.success({
        message: 'Sucesso',
        description: 'Usuário adicionado aos relacionados com sucesso!',
      });
      
      setAddUserModalVisible(false);
      addUserForm.resetFields();
      fetchRelatedUsers();
    } catch (error) {
      console.log(error)
      notification.error({
        message: 'Erro',
        description: 'Falha ao adicionar usuário relacionado: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRelatedUser = async (userId) => {
    setLoading(true);
    try {
      await api.delete(`/api/user/removeRelatedUser?referenceUserId=${userId}`);
      
      notification.success({
        message: 'Sucesso',
        description: 'Usuário removido dos relacionados com sucesso!',
      });
      
      fetchRelatedUsers();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao remover usuário relacionado: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddUserModal = () => {
    fetchAvailableUsers();
    setAddUserModalVisible(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'user':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <CrownOutlined />;
      case 'user':
        return <UserOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag 
          color={getRoleColor(role)} 
          icon={getRoleIcon(role)}
        >
          {role?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Data de Criação',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '-'
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            ghost
            size="small"
            onClick={() => handleEditRole(record)}
          >
            Alterar Role
          </Button>
        </Space>
      ),
    },
  ];

  const relatedUsersColumns = [
    ...columns.slice(0, 4), // Todas as colunas exceto ações
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Remover usuário relacionado?"
            description={`Tem certeza que deseja remover ${record.name} dos usuários relacionados?`}
            onConfirm={() => handleRemoveRelatedUser(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Remover
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const modalFooter = [
    <Button 
      key="cancel" 
      onClick={() => setModalVisible(false)} 
      icon={<CloseOutlined />}
    >
      Cancelar
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      onClick={() => form.submit()} 
      icon={<SaveOutlined />}
      loading={loading}
    >
      Salvar
    </Button>
  ];

  const addUserModalFooter = [
    <Button 
      key="cancel" 
      onClick={() => setAddUserModalVisible(false)} 
      icon={<CloseOutlined />}
    >
      Cancelar
    </Button>,
    <Button 
      key="submit" 
      type="primary" 
      onClick={() => addUserForm.submit()} 
      icon={<UserAddOutlined />}
      loading={loading}
    >
      Adicionar
    </Button>
  ];

  // Filtrar usuários disponíveis baseado na busca
  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <TeamOutlined />
          Todos os Usuários ({allUsers.length})
        </span>
      ),
      children: (
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={allUsers}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} de ${total} usuários`,
            }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>
      ),
    },
    {
      key: 'related',
      label: (
        <span>
          <UserOutlined />
          Usuários Relacionados ({relatedUsers.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">
              Gerencie os usuários relacionados ao seu perfil
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddUserModal}
            >
              Adicionar Usuário
            </Button>
          </div>
          <Spin spinning={loading}>
            <Table
              columns={relatedUsersColumns}
              dataSource={relatedUsers}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} de ${total} usuários relacionados`,
              }}
              scroll={{ x: 'max-content' }}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <UserOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <div>
                      <Text type="secondary">Nenhum usuário relacionado encontrado</Text>
                      <br />
                      <Button 
                        type="link" 
                        onClick={handleOpenAddUserModal}
                        icon={<PlusOutlined />}
                      >
                        Adicionar primeiro usuário
                      </Button>
                    </div>
                  </div>
                )
              }}
            />
          </Spin>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Title level={2}>
            <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Gerenciamento de Usuários
          </Title>
          <Text type="secondary">
            Gerencie roles de usuários e visualize usuários relacionados
          </Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Modal para alterar role */}
      <Modal
        title={`Alterar Role - ${currentUser?.name}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={500}
        footer={modalFooter}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateRole}
        >
          <Card>
            <Form.Item name="userId" hidden>
              <input type="hidden" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Nova Role"
              rules={[{ required: true, message: 'Por favor, selecione uma role' }]}
            >
              <Select placeholder="Selecione a role">
                <Option value="user">
                  <Space>
                    <UserOutlined />
                    Usuário
                  </Space>
                </Option>
                <Option value="admin">
                  <Space>
                    <CrownOutlined />
                    Administrador
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f6f8fa', 
              borderRadius: '6px',
              marginTop: '16px'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <strong>Nota:</strong> Alterar a role de um usuário pode afetar suas permissões de acesso ao sistema.
              </Text>
            </div>
          </Card>
        </Form>
      </Modal>

      {/* Modal para adicionar usuário relacionado */}
      <Modal
        title="Adicionar Usuário Relacionado"
        open={addUserModalVisible}
        onCancel={() => setAddUserModalVisible(false)}
        width={600}
        footer={addUserModalFooter}
      >
        <Form
          form={addUserForm}
          layout="vertical"
          onFinish={handleAddRelatedUser}
        >
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <Input
                placeholder="Buscar por nome ou email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: '8px' }}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {filteredAvailableUsers.length} usuário(s) disponível(is)
              </Text>
            </div>

            <Form.Item
              name="userId"
              label="Selecionar Usuário"
              rules={[{ required: true, message: 'Por favor, selecione um usuário' }]}
            >
              <Select 
                placeholder="Selecione um usuário para adicionar"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: '100%' }}
              >
                {filteredAvailableUsers.map(user => (
                  <Option key={user.id} value={user.id}>
                    <Space>
                      {getRoleIcon(user.role)}
                      <span>
                        <strong>{user.name}</strong> - {user.email}
                        <Tag 
                          color={getRoleColor(user.role)} 
                          size="small" 
                          style={{ marginLeft: '8px' }}
                        >
                          {user.role?.toUpperCase()}
                        </Tag>
                      </span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider />

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '6px',
              border: '1px solid #bae7ff'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <CheckCircleOutlined style={{ color: '#1890ff', marginRight: '4px' }} />
                <strong>Dica:</strong> Usuários relacionados terão acesso a funcionalidades específicas baseadas na sua relação.
              </Text>
            </div>
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;