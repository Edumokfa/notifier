import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Card, Badge, Typography, Tag, 
  Drawer, Spin, notification, Divider, Row, Col, Input
} from 'antd';
import { 
  EyeOutlined, CalendarOutlined, WhatsAppOutlined,
  ReloadOutlined, CloseOutlined, MailOutlined, SearchOutlined
} from '@ant-design/icons';
import ReactJsonPretty from 'react-json-pretty';
import api from '../api/api';

const { Title, Text } = Typography;

const MessageHistoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/messageHistory');
      
      if (response.data.success) {
        setFilteredHistory(response.data.data);
      } else {
        notification.error({
          message: 'Erro ao carregar dados',
          description: response.data.message || 'Não foi possível carregar o histórico de mensagens'
        });
      }
    } catch (error) {
      notification.error({
        message: 'Erro na requisição',
        description: error.message || 'Ocorreu um erro ao buscar o histórico de mensagens'
      });
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const getStatusBadge = (status, statusCode) => {
    if (!status) return <Badge status="default" text="Desconhecido" />;
    
    if (status.toLowerCase().includes('delivered') || status.toLowerCase().includes('read')) {
      return <Badge status="success" text={status} />;
    } else if (status.toLowerCase().includes('sent') || status.toLowerCase().includes('accepted')) {
      return <Badge status="processing" text={status} />;
    } else if (status.toLowerCase().includes('failed') || statusCode >= 400) {
      return <Badge status="error" text={status} />;
    } else {
      return <Badge status="warning" text={status} />;
    }
  };

  const getChannelTag = (channelType) => {
    if (channelType?.toLowerCase() === 'whatsapp') {
      return <Tag color="green" icon={<WhatsAppOutlined />}>WhatsApp</Tag>;
    } else if (channelType?.toLowerCase() === 'email') {
      return <Tag color="blue" icon={<MailOutlined />}>Email</Tag>;
    }
    return <Tag color="default">{channelType || 'Desconhecido'}</Tag>;
  };

  const getSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={placeholder}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
          >
            Buscar
          </Button>
          <Button onClick={() => clearFilters()} size="small">
            Limpar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const columns = [
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => (
        <Space>
          <CalendarOutlined />
          {formatDate(text)}
        </Space>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Contato',
      dataIndex: 'contact',
      key: 'contact',
      ...getSearchProps('contact', 'Buscar por contato'),
    },
    {
      title: 'Canal',
      dataIndex: 'channelType',
      key: 'channelType',
      render: (channelType) => getChannelTag(channelType),
      filters: [
        { text: 'WhatsApp', value: 'whatsapp' },
        { text: 'Email', value: 'email' },
      ],
      onFilter: (value, record) => record.channelType?.toLowerCase() === value,
    },
    {
      title: 'Status',
      dataIndex: 'messageStatus',
      key: 'messageStatus',
      render: (text, record) => getStatusBadge(text, record.statusCode),
      filters: [
        { text: 'Entregue', value: 'delivered' },
        { text: 'Enviado', value: 'sent' },
        { text: 'Lido', value: 'read' },
        { text: 'Falha', value: 'failed' },
      ],
      onFilter: (value, record) => record.messageStatus?.toLowerCase().includes(value),
    },
    {
      title: 'Response Code',
      dataIndex: 'statusCode',
      key: 'statusCode',
      render: (statusCode) => {
        let color = 'green';
        if (statusCode >= 400 && statusCode < 500) color = 'orange';
        else if (statusCode >= 500) color = 'red';
        
        return <Tag color={color}>{statusCode}</Tag>;
      },
      ...getSearchProps('statusCode', 'Buscar por código'),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => showDrawer(record)}
            ghost
          >
            Detalhes
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Title level={2}>
            <WhatsAppOutlined style={{ marginRight: '8px', color: '#25D366' }} />
            Histórico de Mensagens
          </Title>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchData}
          >
            Atualizar
          </Button>
        </div>
          
        <Spin spinning={loading}>
          <Table 
            dataSource={filteredHistory} 
            columns={columns} 
            rowKey="id"
            pagination={{ 
              pageSize: 10, 
              showTotal: (total) => `Total: ${total} registros` 
            }}
            locale={{ emptyText: 'Nenhum registro encontrado' }}
          />
        </Spin>
      </Card>

      <Drawer
        title={
          <Space>
            <WhatsAppOutlined style={{ color: '#25D366' }} />
            Detalhes da Mensagem
          </Space>
        }
        placement="right"
        width={600}
        onClose={closeDrawer}
        open={drawerVisible}
        extra={
          <Button onClick={closeDrawer} icon={<CloseOutlined />}>
            Fechar
          </Button>
        }
      >
        {selectedRecord && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>ID: </Text>
                  <Text>{selectedRecord.id}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Contato: </Text>
                  <Text>{selectedRecord.contact}</Text>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Canal: </Text>
                  {getChannelTag(selectedRecord.channelType)}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Status da Mensagem: </Text>
                  {getStatusBadge(selectedRecord.messageStatus, selectedRecord.statusCode)}
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text strong>Código de Status: </Text>
                  <Tag color={selectedRecord.statusCode < 400 ? 'green' : 'red'}>
                    {selectedRecord.statusCode}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text strong>Data de Criação: </Text>
                  <Text>{formatDate(selectedRecord.createdAt)}</Text>
                </div>
              </Col>
            </Row>
            
            <Divider orientation="left">Dados da Requisição</Divider>
            <Card size="small" style={{ marginTop: 10 }}>
              <ReactJsonPretty 
                data={selectedRecord.requestPayload} 
                collapsed={2}
                displayDataTypes={false}
                enableClipboard={false}
              />
            </Card>
            
            <Divider orientation="left">Dados da Resposta</Divider>
            <Card size="small" style={{ marginTop: 10 }}>
              <ReactJsonPretty  
                data={selectedRecord.responsePayload} 
                collapsed={2}
                displayDataTypes={false}
                enableClipboard={false}
              />
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default MessageHistoryDashboard;