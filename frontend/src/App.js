import React, {useState, useEffect} from 'react';
import {Layout, Menu, Form, Input, DatePicker, Button, message, Collapse, Space, Tooltip, Popconfirm} from 'antd';
import {
    UnorderedListOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const {Sider, Content} = Layout;
const {TextArea} = Input;
const {Panel} = Collapse;

function App() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('list');
    const [editingTask, setEditingTask] = useState(null);
    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/tasks');
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            message.error('Ошибка при загрузке задач');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const deadline = values.deadline.toISOString();
            const payload = {
                title: values.title,
                description: values.description,
                deadline,
            };

            if (editingTask) {
                await axios.put(`http://localhost:3000/api/tasks/${editingTask.id}`, payload);
                message.success('Задача успешно обновлена!');
            } else {
                await axios.post('http://localhost:3000/api/tasks', payload);
                message.success('Задача успешно создана!');
            }

            form.resetFields();
            setEditingTask(null);
            fetchTasks();
            setActiveTab('list');
        } catch (error) {
            message.error(`Ошибка при ${editingTask ? 'обновлении' : 'создании'} задачи`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const completeTask = async (taskId) => {
        try {
            await axios.patch(`http://localhost:3000/api/tasks/${taskId}`, {completed: true});
            message.success('Задача отмечена как выполненная');
            fetchTasks();
        } catch (error) {
            message.error('Ошибка при завершении задачи');
            console.error(error);
        }
    };

    const editTask = (task) => {
        setEditingTask(task);
        setActiveTab('create');
        form.setFieldsValue({
            title: task.title,
            description: task.description,
            deadline: dayjs(task.deadline),
        });
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
            message.success('Задача удалена');
            fetchTasks();
        } catch (error) {
            message.error('Ошибка при удалении задачи');
            console.error(error);
        }
    };


    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider width={200} style={{background: '#fff'}}>
                <Menu
                    mode="inline"
                    selectedKeys={[activeTab]}
                    onClick={(e) => {
                        setActiveTab(e.key);
                        if (e.key === 'list') {
                            setEditingTask(null);
                            form.resetFields();
                        }
                    }}
                    style={{height: '100%', borderRight: 0}}
                >
                    <Menu.Item key="list" icon={<UnorderedListOutlined/>}>
                        Задачи
                    </Menu.Item>
                    <Menu.Item key="create" icon={<PlusOutlined/>}>
                        {editingTask ? 'Редактировать задачу' : 'Создание задачи'}
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout style={{padding: '24px'}}>
                <Content style={{background: '#fff', padding: 24, minHeight: 280}}>
                    {activeTab === 'list' && (
                        <>
                            <h2>Список задач</h2>
                            <Collapse accordion>
                                {tasks.map((task) => {
                                    const deadline = dayjs(task.deadline);
                                    const created = dayjs(task.createdAt);
                                    const remaining = deadline.diff(dayjs(), 'day');

                                    return (
                                        <Panel
                                            key={task.id}
                                            header={
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <strong>{task.title} (#{task.id})</strong>
                                                        <div style={{fontSize: 12, color: 'gray'}}>
                                                            Создано: {created.format('DD.MM.YYYY HH:mm')}<br/>
                                                            Дедлайн: {deadline.format('DD.MM.YYYY HH:mm')}<br/>
                                                            Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Просрочено'}
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Tooltip title="Выполнить">
                                                            <Button
                                                                type="text"
                                                                icon={<CheckCircleOutlined
                                                                    style={{fontSize: 20, color: 'green'}}/>}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    completeTask(task.id);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Редактировать">
                                                            <Button
                                                                type="text"
                                                                icon={<EditOutlined style={{fontSize: 20}}/>}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    editTask(task);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Удалить задачу?"
                                                            onConfirm={() => handleDelete(task.id)}
                                                            okText="Да"
                                                            cancelText="Нет"
                                                        >
                                                            <Tooltip title="Удалить">
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined style={{fontSize: 20}}/>}
                                                                />
                                                            </Tooltip>
                                                        </Popconfirm>

                                                    </Space>
                                                </div>
                                            }
                                        >
                                            <p><strong>Описание:</strong><br/>{task.description}</p>
                                            <p><strong>Создано:</strong> {created.format('DD.MM.YYYY HH:mm')}</p>
                                            <p><strong>Дедлайн:</strong> {deadline.format('DD.MM.YYYY HH:mm')}</p>
                                            <p>
                                                <strong>Осталось:</strong> {remaining >= 0 ? `${remaining} дней` : 'Просрочено'}
                                            </p>
                                        </Panel>
                                    );
                                })}
                            </Collapse>
                        </>
                    )}
                    {activeTab === 'completed' && (
                        <>
                            <h2>Выполненные задачи</h2>
                            <Collapse accordion>
                                {completedTasks.map((task) => {
                                    const deadline = dayjs(task.deadline);
                                    const created = dayjs(task.createdAt);
                                    const remaining = deadline.diff(dayjs(), 'day');

                                    return (
                                        <Panel
                                            key={task.id}
                                            header={
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <strong>{task.title} (#{task.id})</strong>
                                                        <div style={{fontSize: 12, color: 'gray'}}>
                                                            Создано: {created.format('DD.MM.YYYY HH:mm')}<br/>
                                                            Дедлайн: {deadline.format('DD.MM.YYYY HH:mm')}<br/>
                                                            Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Просрочено'}
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Tooltip title="Редактировать">
                                                            <Button
                                                                type="text"
                                                                icon={<EditOutlined style={{fontSize: 20}}/>}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    editTask(task);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Удалить задачу?"
                                                            onConfirm={() => handleDelete(task.id)}
                                                            okText="Да"
                                                            cancelText="Нет"
                                                        >
                                                            <Tooltip title="Удалить">
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined style={{fontSize: 20}}/>}
                                                                />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            }
                                        >
                                            <p><strong>Описание:</strong><br/>{task.description}</p>
                                            <p><strong>Создано:</strong> {created.format('DD.MM.YYYY HH:mm')}</p>
                                            <p><strong>Дедлайн:</strong> {deadline.format('DD.MM.YYYY HH:mm')}</p>
                                            <p>
                                                <strong>Осталось:</strong> {remaining >= 0 ? `${remaining} дней` : 'Просрочено'}
                                            </p>
                                        </Panel>
                                    );
                                })}
                            </Collapse>
                        </>
                    )}


                    {activeTab === 'create' && (
                        <>
                            <h2>{editingTask ? 'Редактирование задачи' : 'Создание задачи'}</h2>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                initialValues={{title: '', description: ''}}
                            >
                                <Form.Item
                                    name="title"
                                    label="Название задачи"
                                    rules={[{required: true, message: 'Введите название'}]}
                                >
                                    <Input placeholder="Название"/>
                                </Form.Item>

                                <Form.Item
                                    name="description"
                                    label="Описание задачи"
                                    rules={[{required: true, message: 'Введите описание'}]}
                                >
                                    <TextArea rows={4} placeholder="Описание"/>
                                </Form.Item>

                                <Form.Item
                                    name="deadline"
                                    label="Дедлайн"
                                    rules={[{required: true, message: 'Выберите дату'}]}
                                >
                                    <DatePicker showTime format="DD.MM.YYYY HH:mm"/>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        {editingTask ? 'Обновить задачу' : 'Создать задачу'}
                                    </Button>
                                    {editingTask && (
                                        <Button
                                            style={{marginLeft: 8}}
                                            onClick={() => {
                                                setEditingTask(null);
                                                form.resetFields();
                                                setActiveTab('list');
                                            }}
                                        >
                                            Отмена
                                        </Button>
                                    )}
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}


export default App;