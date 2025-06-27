import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Typography } from 'antd';
import { Bar, Pie, Line } from '@ant-design/charts';
import api from '../api/api';

const { Title } = Typography;

const MessageAnalytics = () => {
  const [data, setData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/messageHistory/messageStats');
      console.log(response.data);
      setData(response.data);
      
      const timeSeriesResponse = await api.get('/api/messageHistory/timeSeriesStats');
      setTimeSeriesData(timeSeriesResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const whatsappData = data.filter(d => d.channelType === 'whatsapp');
  const emailData = data.filter(d => d.channelType === 'email');

  const channelComparisonData = data.reduce((acc, item) => {
    const existing = acc.find(x => x.channel === item.channelType);
    if (existing) {
      existing.total += item.count;
    } else {
      acc.push({
        channel: item.channelType,
        total: item.count
      });
    }
    return acc;
  }, []);

  const lineConfig = {
  data: timeSeriesData,
  xField: 'date',
  yField: 'count',
  seriesField: 'channelType',
  smooth: true,
  legend: { position: 'top-right' },
  colorField: 'channelType',
  color: {
    whatsapp: '#25D366',
    email: '#1890FF',
  },
  slider: {
    start: 0.7,
    end: 1,
  },
};

    const channelConfig = {
    data: channelComparisonData,
    xField: 'channel',
    yField: 'total',
    colorField: 'channel',
    color: ({ channel }) =>
        channel === 'whatsapp' ? '#25D366' :
        channel === 'email' ? '#1890FF' : '#999',
    meta: {
        channel: { alias: 'Canal' },
        total: { alias: 'Total de Mensagens' },
    },
    };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Análise de Mensagens</Title>
      
      <Spin spinning={loading}>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card title="WhatsApp - Status">
              <Pie
                data={whatsappData}
                angleField="count"
                colorField="messageStatus"
                legend={{ position: 'bottom' }}
                height={200}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="E-mails - Status">
              <Pie
                data={emailData}
                angleField="count"
                colorField="messageStatus"
                legend={{ position: 'bottom' }}
                height={200}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Comparação entre Canais">
              <Bar
                {...channelConfig}
                height={200}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="Evolução de Mensagens ao Longo do Tempo">
              <Line
                {...lineConfig}
                height={300}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default MessageAnalytics;