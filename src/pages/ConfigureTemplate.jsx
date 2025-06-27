import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Space, Card, 
  notification, Popconfirm, Tabs, Typography, 
  Spin, Divider, Select, Row, Col, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SaveOutlined, CloseOutlined, WhatsAppOutlined,
  EyeOutlined, MailOutlined
} from '@ant-design/icons';
import api from '../api/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [form] = Form.useForm();
  const [componentsCount, setComponentsCount] = useState(1);
  const [formUpdate, setFormUpdate] = useState(0);
  const [parametersCount, setParametersCount] = useState({});
  const [templateType, setTemplateType] = useState('whatsapp'); // 'whatsapp' ou 'email'
  
  const [formValues, setFormValues] = useState({});
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFormValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

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
    setComponentsCount(0);
    setParametersCount({});
    setTemplateType('whatsapp');
    form.resetFields();
    setFormValues({});
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentTemplate(record);
    setTemplateType(record.type || 'whatsapp');
    
    const paramCounts = {};
    if (record.components && Array.isArray(record.components)) {
      record.components.forEach((component, idx) => {
        if (component.parameters && Array.isArray(component.parameters)) {
          paramCounts[idx] = component.parameters.length;
        }
      });
    }
    
    if (record.type === 'whatsapp') {
      const paramCounts = {};
      record.components?.forEach((component, idx) => {
        if (Array.isArray(component.parameters)) {
          paramCounts[idx] = component.parameters.length;
        }
      });
      setParametersCount(paramCounts);
    } else {
      setParametersCount({});
    }
      
    
    const formData = {
      name: record.name,
      type: record.type || 'whatsapp',
      phone_number: record.phone_number,
      key_wpp: record.key_wpp,
      template_wpp: record.template_wpp,
      phone_number_id: record.phone_number_id,
      email_subject: record.email_subject,
      email_body: record.email_body,
      ...extractComponentsForForm(record.components)
    };
    
    form.setFieldsValue(formData);
    setFormValues(formData);
    
    if (record.type === 'whatsapp' && record.components) {
      setComponentsCount(record.components.length);
    }
    
    setFormVisible(true);
  };

  const extractComponentsForForm = (components) => {
    if (templateType !== 'whatsapp') return null;
    console.log('não fez nada')
    const formValues = {};
    
    if (components && Array.isArray(components)) {
      components.forEach((component, idx) => {
        formValues[`component_type_${idx}`] = component.type;
        formValues[`component_text_${idx}`] = component.text || '';
        
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
    let components = [];
    
    if (values.type === 'whatsapp') {
      components = buildComponentsFromForm(values);
      if (components.length === 0 && currentTemplate?.components) {
        components = currentTemplate.components;
      }
    }
  
    const templateData = {
      name: values.name,
      type: values.type,
      phone_number: values.phone_number,
      key_wpp: values.key_wpp,
      template_wpp: values.template_wpp,
      phone_number_id: values.phone_number_id,
      // Campos de email
      email_subject: values.email_subject,
      email_body: values.email_body,
      components,
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
      const componentText = values[`component_text_${i}`];
      
      if (componentType) {
        const component = {
          type: componentType,
          text: componentText,
          parameters: []
        };
        
        const paramCount = parametersCount[i] || 0;
        for (let j = 0; j < paramCount; j++) {
          if (values[`component_${i}_param_type_${j}`]) {
            component.parameters.push({
              type: values[`component_${i}_param_type_${j}`],
              text: values[`component_${i}_param_text_${j}`] || '',
            });
          }
        }
        
        components.push(component);
      }
    }
    
    return components;
  };

  const addParameter = (componentIndex) => {
    const currentParamCount = parametersCount[componentIndex] || 0;
    const newParamCount = currentParamCount + 1;
    
    setParametersCount(prev => ({
      ...prev,
      [componentIndex]: newParamCount
    }));
    
    form.setFieldsValue({
      [`component_${componentIndex}_param_type_${currentParamCount}`]: 'text',
      [`component_${componentIndex}_param_text_${currentParamCount}`]: '',
    });
    
    const updatedValues = {
      ...formValues,
      [`component_${componentIndex}_param_type_${currentParamCount}`]: 'text',
      [`component_${componentIndex}_param_text_${currentParamCount}`]: '',
    };
    setFormValues(updatedValues);
    
    setFormUpdate(prev => prev + 1);
  };

  const renderPreviewText = (componentIndex) => {
    const text = formValues[`component_text_${componentIndex}`] || "";
    if (!text) return <Text type="secondary">Sem conteúdo para exibir</Text>;
    
    let previewText = text;
    const paramCount = parametersCount[componentIndex] || 0;
    
    for (let i = 0; i < paramCount; i++) {
      const paramValue = formValues[`component_${componentIndex}_param_text_${i}`] || "";
      previewText = previewText.replace(`{{${i+1}}}`, paramValue);
    }
    
    return previewText;
  };

  const renderFullPreview = () => {
    if (!currentTemplate) return null;
  
    if (currentTemplate.type === 'email') {
      return (
        <div style={{ padding: '20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#1890ff', color: 'white', padding: '16px', textAlign: 'center' }}>
              <MailOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Preview do Email</span>
            </div>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', minHeight: '300px' }}>
              <h2>{currentTemplate.email_subject}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: currentTemplate.email_body || "<i>Sem conteúdo</i>" }}
                style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
              />
            </div>
          </div>
        </div>
      );
    }
  
    // WhatsApp preview (mantido original)
    if (!currentTemplate.components) return null;
  
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#128C7E', color: 'white', padding: '16px', textAlign: 'center' }}>
            <WhatsAppOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Preview da Mensagem</span>
          </div>
          <div style={{ backgroundColor: '#E5DDD5', padding: '20px', minHeight: '300px' }}>
            {currentTemplate.components.map((component, index) => {
              let content = component.text || '';
              if (component.parameters && Array.isArray(component.parameters)) {
                component.parameters.forEach((param, paramIndex) => {
                  const paramValue = param.text || `[Parâmetro ${paramIndex + 1}]`;
                  content = content.replace(`{{${paramIndex + 1}}}`, paramValue);
                });
              }
  
              const styles = {
                padding: '12px 16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                marginBottom: '12px',
              };
  
              if (component.type === 'header') {
                styles.fontWeight = 'bold';
              } else if (component.type === 'footer') {
                styles.fontSize = '12px';
                styles.color = '#666';
              }
  
              return (
                <div key={`preview-component-${index}`} style={styles}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'email' ? 'blue' : 'green'} icon={type === 'email' ? <MailOutlined /> : <WhatsAppOutlined />}>
          {type === 'email' ? 'Email' : 'WhatsApp'}
        </Tag>
      ),
    },
    {
      title: 'Template/Assunto',
      key: 'template_info',
      render: (_, record) => (
        <Text>{record.type === 'email' ? record.email_subject : record.template_wpp}</Text>
      ),
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
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentTemplate(record);
              setPreviewVisible(true);
            }}
          >
            Preview
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
    
    for (let i = 0; i < paramCount; i++) {
      parameterItems.push(
        <div key={`param-${componentIndex}-${i}`} style={{ marginBottom: '16px', border: '1px dashed #d9d9d9', padding: '16px', borderRadius: '8px' }}>
          <Title level={5}>Parâmetro {i + 1}</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tipo"
                name={`component_${componentIndex}_param_type_${i}`}
                rules={[{ required: true, message: 'Por favor informe o tipo do parâmetro!' }]}
              >
                <Select placeholder="Selecione o tipo do parâmetro">
                  <Option value="text">Texto</Option>
                  <Option value="contact">Nome do Contato</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Texto"
            name={`component_${componentIndex}_param_text_${i}`}
            rules={[{ required: true, message: 'Por favor informe o texto do parâmetro!' }]}
          >
            <TextArea 
              placeholder="Texto do parâmetro (opcional para alguns tipos)"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>
        </div>
      );
    }
    
    const componentTypes = {
      header: "Cabeçalho",
      body: "Corpo",
      footer: "Rodapé",
      buttons: "Botões"
    };
    
    return (
      <Card 
        title={`Componente ${componentIndex + 1}`}
        extra={<Button type="primary" ghost onClick={() => addParameter(componentIndex)}>Adicionar Parâmetro</Button>}
        style={{ marginBottom: '24px' }}
        key={`component-${componentIndex}-${formUpdate}`}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de Componente"
              name={`component_type_${componentIndex}`}
              rules={[{ required: true, message: 'Por favor informe o tipo do componente!' }]}
            >
              <Select placeholder="Selecione o tipo do componente">
                {Object.entries(componentTypes).map(([value, label]) => (
                  <Option key={value} value={value}>{label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label="Texto do Componente"
              name={`component_text_${componentIndex}`}
              rules={[{ required: true, message: 'Por favor informe o texto do componente!' }]}
              tooltip="Use {{1}}, {{2}}, etc. para marcar onde os parâmetros serão inseridos"
            >
              <TextArea 
                placeholder="Ex: Esta é uma mensagem automática da {{1}} para confirmar seu pedido {{2}}"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Card 
          type="inner" 
          title="Preview" 
          style={{ marginTop: '16px', marginBottom: '16px', backgroundColor: '#f5f5f5' }}
        >
          <div className="whatsapp-preview" style={{ padding: '10px', backgroundColor: '#e5ffcc', borderRadius: '8px', border: '1px solid #9de288' }}>
            {renderPreviewText(componentIndex)}
          </div>
        </Card>

        <Divider orientation="left">Parâmetros</Divider>
        {parameterItems}
        {parameterItems.length === 0 && (
          <Button 
            type="dashed" 
            onClick={() => addParameter(componentIndex)} 
            block
            icon={<PlusOutlined />}
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


  const getTabItems = () => {
    const items = [
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
              label="Tipo de Template"
              name="type"
              rules={[{ required: true, message: 'Por favor selecione o tipo do template!' }]}
            >
              <Select 
                placeholder="Selecione o tipo do template"
                onChange={(value) => setTemplateType(value)}
              >
                <Option value="whatsapp">
                  <WhatsAppOutlined style={{ marginRight: '8px', color: '#25D366' }} />
                  WhatsApp
                </Option>
                <Option value="email">
                  <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                  Email
                </Option>
              </Select>
            </Form.Item>

            {/* Campos do WhatsApp */}
            {templateType === 'whatsapp' && (
              <>
                <Form.Item
                  label="API Key WhatsApp"
                  name="key_wpp"
                  rules={[{ required: true, message: 'Por favor informe a chave de API do WhatsApp!' }]}
                >
                  <TextArea placeholder="Chave de API do WhatsApp" autoSize={{ minRows: 2, maxRows: 4 }} />
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
            )}

            {/* Campos do Email */}
            {templateType === 'email' && (
              <>
                <Form.Item
                  label="Assunto do Email"
                  name="email_subject"
                  rules={[{ required: true, message: 'Por favor informe o assunto do email!' }]}
                >
                  <Input placeholder="Assunto do email" />
                </Form.Item>
                
                <Form.Item
                  label="Corpo do Email"
                  name="email_body"
                  rules={[{ required: true, message: 'Por favor informe o corpo do email!' }]}
                >
                  <ReactQuill
                    value={form.getFieldValue('email_body')}
                    onChange={(value) => form.setFieldsValue({ email_body: value })}
                  />
                </Form.Item>
              </>
            )}
          </>
        )
      }
    ];

    // Adicionar aba de componentes apenas para WhatsApp
    if (templateType === 'whatsapp') {
      items.push({
        key: "2",
        label: "Componentes",
        children: (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
              {'Configure os componentes do template como cabeçalho, corpo e rodapé. Use a sintaxe {{1}}, {{2}}, etc. para marcar onde os parâmetros serão inseridos.'}
            </Text>
            
            {renderComponentsForms()}
          </>
        )
      });
    }

    return items;
  };
  
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
            <Space>
              <WhatsAppOutlined style={{ color: '#25D366' }} />
              <MailOutlined style={{ color: '#1890ff' }} />
              Gerenciamento de Templates
            </Space>
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
          onValuesChange={handleFormValuesChange}
        >
          <Tabs defaultActiveKey="1" items={getTabItems()} />
        </Form>
      </Modal>

      <Modal
        title="Preview do Template"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={currentTemplate?.type === 'email' ? 700 : 500}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Fechar
          </Button>
        ]}
      >
        {renderFullPreview()}
      </Modal>
    </div>
  );
};

export default TemplateManagement;