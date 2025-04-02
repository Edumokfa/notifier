import React, { useState, useEffect } from 'react';
import { Table, Card, Space, Badge, Typography, Tag, Button, Drawer, Spin, notification } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import ReactJson from 'react-json-view';
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
      title: 'Telefone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Status',
      dataIndex: 'messageStatus',
      key: 'messageStatus',
      render: (text, record) => getStatusBadge(text, record.statusCode),
      filters: [
        { text: 'Entregue', value: 'delivered' },
        { text: 'Enviado', value: 'sent' },
        { text: 'Falha', value: 'failed' },
      ],
      onFilter: (value, record) => record.messageStatus?.toLowerCase().includes(value),
    },
    {
      title: 'Código',
      dataIndex: 'statusCode',
      key: 'statusCode',
      render: (statusCode) => {
        let color = 'green';
        if (statusCode >= 400 && statusCode < 500) color = 'orange';
        else if (statusCode >= 500) color = 'red';
        
        return <Tag color={color}>{statusCode}</Tag>;
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => showDrawer(record)}
          size="small"
        >
          Detalhes
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3}>Histórico de Mensagens</Title>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table 
              dataSource={filteredHistory} 
              columns={columns} 
              rowKey="id"
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total) => `Total: ${total} registros` 
              }}
              locale={{ emptyText: 'Nenhum registro encontrado' }}
            />
          )}
        </Space>
      </Card>

      <Drawer
        title="Detalhes da Mensagem"
        placement="right"
        width={600}
        onClose={closeDrawer}
        visible={drawerVisible}
        extra={
          <Space>
            <Button onClick={closeDrawer}>Fechar</Button>
          </Space>
        }
      >
        {selectedRecord && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>ID: </Text>
              <Text>{selectedRecord.id}</Text>
            </div>
            
            <div>
              <Text strong>Telefone: </Text>
              <Text>{selectedRecord.phoneNumber}</Text>
            </div>
            
            <div>
              <Text strong>Status da Mensagem: </Text>
              {getStatusBadge(selectedRecord.messageStatus, selectedRecord.statusCode)}
            </div>
            
            <div>
              <Text strong>Código de Status: </Text>
              <Tag color={selectedRecord.statusCode < 400 ? 'green' : 'red'}>
                {selectedRecord.statusCode}
              </Tag>
            </div>
            
            <div>
              <Text strong>Data de Criação: </Text>
              <Text>{formatDate(selectedRecord.createdAt)}</Text>
            </div>
            
            <div>
              <Text strong>Dados da Requisição:</Text>
              <Card size="small" style={{ marginTop: 10 }}>
                <ReactJson 
                  src={selectedRecord.requestPayload} 
                  collapsed={2}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              </Card>
            </div>
            
            <div>
              <Text strong>Dados da Resposta:</Text>
              <Card size="small" style={{ marginTop: 10 }}>
                <ReactJson 
                  src={selectedRecord.responsePayload} 
                  collapsed={2}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              </Card>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default MessageHistoryDashboard;