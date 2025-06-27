import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  MessageOutlined,
  LogoutOutlined,
  HistoryOutlined,
  ContactsOutlined,
  SettingOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust import path as needed

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AuthenticatedLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth(); // Assuming your AuthContext provides these
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fullMenuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>
    },
    {
      key: '/whatsapp',
      icon: <MessageOutlined />,
      label: <Link to="/whatsapp">Templates</Link>,
      roles: ['admin']  // <-- Só Admin
    },
    {
      key: '/messageConfig',
      icon: <SettingOutlined />,
      label: <Link to="/messageConfig">Configurar</Link>,
      roles: ['admin']  // <-- Só Admin
    },
    {
      key: '/messageHistory',
      icon: <HistoryOutlined />,
      label: <Link to="/messageHistory">Histórico</Link>
    },
    {
      key: '/contacts',
      icon: <ContactsOutlined />,
      label: <Link to="/contacts">Contatos</Link>
    },
    {
      key: '/userManagement',
      icon: <UserOutlined />,
      label: <Link to="/userManagement">Gerenciar Usuarios</Link>
    },
  ];
  
  const menuItems = fullMenuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });
  

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span onClick={handleLogout}>Sair</span>,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        theme="dark"
      >
        <div 
          style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          {collapsed ? 'Notificações' : 'Notificações'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
        />
      </Sider>
      <Layout>
        <Header 
          style={{ 
            background: '#fff', 
            padding: '0 16px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div>{/* You can add page title or breadcrumbs here */}</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ marginRight: 12 }}>
              {user?.name || 'Usuário'}
            </Text>
            <Dropdown menu={userMenu} placement="bottomRight">
              <span>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ cursor: 'pointer' }} 
                  src={user?.avatar} 
                />
              </span>
            </Dropdown>
          </div>
        </Header>
        <Content 
          style={{ 
            margin: '24px 16px', 
            padding: 24, 
            background: '#fff', 
            borderRadius: 8 
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AuthenticatedLayout;