import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Space, Card, 
  notification, Popconfirm, Tabs, Typography, 
  Spin, Divider 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SaveOutlined, CloseOutlined, WhatsAppOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import api from '../api/api';

const { Title, Text } = Typography;

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();
  const [componentsCount, setComponentsCount] = useState(1);
  const [formUpdate, setFormUpdate] = useState(0);
  // Adicionando estado para rastrear parâmetros por componente
  const [parametersCount, setParametersCount] = useState({});

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/template');
      setTemplates(response.data.data);
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao carregar templates: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentTemplate(null);
    setComponentsCount(1);
    setParametersCount({});
    form.resetFields();
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentTemplate(record);
    
    // Calcular a contagem de parâmetros para cada componente
    const paramCounts = {};
    if (record.components && Array.isArray(record.components)) {
      record.components.forEach((component, idx) => {
        if (component.parameters && Array.isArray(component.parameters)) {
          paramCounts[idx] = component.parameters.length;
        }
      });
    }
    setParametersCount(paramCounts);
    
    form.setFieldsValue({
      name: record.name,
      phone_number: record.phone_number,
      key_wpp: record.key_wpp,
      template_wpp: record.template_wpp,
      phone_number_id: record.phone_number_id,
      ...extractComponentsForForm(record.components)
    });
    
    // Set the components count based on existing components
    if (record.components) {
      setComponentsCount(record.components.length);
    }
    
    setFormVisible(true);
  };

  const handleTest = async (record) => {
    record.phone_number = '555484043307'
    try{
      await api.post('/api/whatsapp/sendFirstMessage', record);
        notification.success({
          message: 'Sucesso',
          description: 'Mensagem enviada com sucesso!',
      });
    } catch (err) {
      console.error(err)
      notification.error({
        message: 'Erro',
        description: 'Falha ao excluir template: ' + err.message,
      });
    }
  };

  const extractComponentsForForm = (components) => {
    const formValues = {};
    
    if (components && Array.isArray(components)) {
      components.forEach((component, idx) => {
        formValues[`component_type_${idx}`] = component.type;
        
        if (component.parameters && Array.isArray(component.parameters)) {
          component.parameters.forEach((param, paramIdx) => {
            formValues[`component_${idx}_param_type_${paramIdx}`] = param.type;
            formValues[`component_${idx}_param_text_${paramIdx}`] = param.text;
          });
        }
      });
    }
    
    return formValues;
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/template/${id}`);
      notification.success({
        message: 'Sucesso',
        description: 'Template excluído com sucesso!',
      });
      fetchTemplates();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao excluir template: ' + error.message,
      });
    }
  };

  const handleSubmit = async (values) => {
    const templateData = {
      name: values.name,
      phone_number: values.phone_number,
      key_wpp: values.key_wpp,
      template_wpp: values.template_wpp,
      phone_number_id: values.phone_number_id,
      components: buildComponentsFromForm(values)
    };

    setLoading(true);
    try {
      if (currentTemplate) {
        await api.put(`/api/template/${currentTemplate.id}`, templateData);
        notification.success({
          message: 'Sucesso',
          description: 'Template atualizado com sucesso!',
        });
      } else {
        await api.post('/api/template', templateData);
        notification.success({
          message: 'Sucesso',
          description: 'Template criado com sucesso!',
        });
      }
      setFormVisible(false);
      fetchTemplates();
    } catch (error) {
      notification.error({
        message: 'Erro',
        description: 'Falha ao salvar template: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const buildComponentsFromForm = (values) => {
    const components = [];
    
    for (let i = 0; i < componentsCount; i++) {
      const componentType = values[`component_type_${i}`];
      
      if (componentType) {
        const component = {
          type: componentType,
          parameters: []
        };
        
        // Usar a contagem de parâmetros do estado
        const paramCount = parametersCount[i] || 0;
        for (let j = 0; j < paramCount; j++) {
          if (values[`component_${i}_param_type_${j}`]) {
            component.parameters.push({
              type: values[`component_${i}_param_type_${j}`],
              text: values[`component_${i}_param_text_${j}`] || ''
            });
          }
        }
        
        components.push(component);
      }
    }
    
    return components;
  };

  const addParameter = (componentIndex) => {
    // Atualizar a contagem de parâmetros para este componente
    const currentParamCount = parametersCount[componentIndex] || 0;
    const newParamCount = currentParamCount + 1;
    
    setParametersCount(prev => ({
      ...prev,
      [componentIndex]: newParamCount
    }));
    
    // Definir valores iniciais para o novo parâmetro
    form.setFieldsValue({
      [`component_${componentIndex}_param_type_${currentParamCount}`]: 'text',
      [`component_${componentIndex}_param_text_${currentParamCount}`]: ''
    });
    
    // Forçar re-renderização
    setFormUpdate(prev => prev + 1);
  };

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Template WhatsApp',
      dataIndex: 'template_wpp',
      key: 'template_wpp',
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
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => handleTest(record)}
            type="primary"
            ghost
          >
            Testar
          </Button>
          <Popconfirm
            title="Tem certeza que deseja excluir este template?"
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

  const renderComponentForm = (componentIndex) => {
    const parameterItems = [];
    const paramCount = parametersCount[componentIndex] || 0;
    
    // Renderizar campos de parâmetros com base na contagem armazenada
    for (let i = 0; i < paramCount; i++) {
      parameterItems.push(
        <div key={`param-${componentIndex}-${i}`} style={{ marginBottom: '8px', border: '1px dashed #d9d9d9', padding: '12px', borderRadius: '4px' }}>
          <Title level={5}>Parâmetro {i + 1}</Title>
          <Form.Item
            label="Tipo"
            name={`component_${componentIndex}_param_type_${i}`}
            rules={[{ required: true, message: 'Por favor informe o tipo do parâmetro!' }]}
          >
            <Input placeholder="Tipo do parâmetro (ex: text)" />
          </Form.Item>
          
          <Form.Item
            label="Texto"
            name={`component_${componentIndex}_param_text_${i}`}
            rules={[{ required: true, message: 'Por favor informe o texto do parâmetro!' }]}
          >
            <Input.TextArea placeholder="Texto do parâmetro" />
          </Form.Item>
        </div>
      );
    }
    
    return (
      <Card 
        title={`Componente ${componentIndex + 1}`} 
        extra={<Button type="primary" ghost onClick={() => addParameter(componentIndex)}>Adicionar Parâmetro</Button>}
        style={{ marginBottom: '16px' }}
        key={`component-${componentIndex}-${formUpdate}`}
      >
        <Form.Item
          label="Tipo de Componente"
          name={`component_type_${componentIndex}`}
          rules={[{ required: true, message: 'Por favor informe o tipo do componente!' }]}
        >
          <Input placeholder="Tipo do componente (ex: header, body)" />
        </Form.Item>
        
        <Divider orientation="left">Parâmetros</Divider>
        {parameterItems}
        {parameterItems.length === 0 && (
          <Button 
            type="dashed" 
            onClick={() => addParameter(componentIndex)} 
            block
          >
            Adicionar Primeiro Parâmetro
          </Button>
        )}
      </Card>
    );
  };

  const renderComponentsForms = () => {
    const componentForms = [];
    
    for (let i = 0; i < componentsCount; i++) {
      componentForms.push(renderComponentForm(i));
    }
    
    return (
      <div>
        {componentForms}
        <Button 
          type="dashed" 
          onClick={() => setComponentsCount(prev => prev + 1)} 
          block 
          icon={<PlusOutlined />}
        >
          Adicionar Componente
        </Button>
      </div>
    );
  };

  // Define tab items para Ant Design 5.x
  const tabItems = [
    {
      key: "1",
      label: "Informações Básicas",
      children: (
        <>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: 'Por favor informe o nome do template!' }]}
          >
            <Input placeholder="Nome do template" />
          </Form.Item>
          
          <Form.Item
            label="API Key WhatsApp"
            name="key_wpp"
            rules={[{ required: true, message: 'Por favor informe a chave de API do WhatsApp!' }]}
          >
            <Input.TextArea placeholder="Chave de API do WhatsApp" />
          </Form.Item>
          
          <Form.Item
            label="Template WhatsApp"
            name="template_wpp"
            rules={[{ required: true, message: 'Por favor informe o nome do template no WhatsApp!' }]}
          >
            <Input placeholder="Nome do template no WhatsApp" />
          </Form.Item>
          
          <Form.Item
            label="ID do Número de Telefone"
            name="phone_number_id"
            rules={[{ required: true, message: 'Por favor informe o ID do número de telefone!' }]}
          >
            <Input placeholder="ID do número de telefone" />
          </Form.Item>
        </>
      )
    },
    {
      key: "2",
      label: "Componentes",
      children: (
        <>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            Configure os componentes do template como cabeçalho, corpo e parâmetros.
          </Text>
          
          {renderComponentsForms()}
        </>
      )
    }
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
            <WhatsAppOutlined style={{ marginRight: '8px', color: '#25D366' }} />
            Gerenciamento de Templates
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Novo Template
          </Button>
        </div>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={templates}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={currentTemplate ? 'Editar Template' : 'Novo Template'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        width={800}
        footer={modalFooter}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateManagement;