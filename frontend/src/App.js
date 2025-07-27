import React, { useState, useEffect } from 'react';
import { Layout, Menu, Form, Input, DatePicker, Button, message, Collapse, Space, Tooltip, Popconfirm, Card } from 'antd';
import {
    UnorderedListOutlined, PlusOutlined, CheckCircleOutlined,
    EditOutlined, RollbackOutlined, DeleteOutlined, UserOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function App() {
    // --- User State ---
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    });
    const [showRegister, setShowRegister] = useState(false);

    // --- Tasks State ---
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('list');
    const [editingTask, setEditingTask] = useState(null);

    const activeTasks = tasks.filter((t) => !t.completed);
    const completedTasks = tasks.filter((t) => t.completed);

    // --- Fetch tasks ---
    const fetchTasks = async () => {
        if (!user) return;
        try {
            const response = await axios.get('http://localhost:3000/api/tasks', {
                headers: { 'X-User-ID': user.id }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            message.error('Ошибка при загрузке задач');
        }
    };

    useEffect(() => { if (user) fetchTasks(); }, [user]);

    // --- User actions ---
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setActiveTab('list');
    };

    const onLogin = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3000/api/users/login', {
                login: values.login, password: values.password
            });
            message.success('Вход выполнен!');
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
            message.error(err.response?.data?.error || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    const onRegister = async (values) => {
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/users/register', {
                login: values.login,
                password: values.password,
                first_name: values.firstName,
                last_name: values.lastName
            });
            message.success('Регистрация успешна! Войдите.');
            setShowRegister(false);
        } catch (err) {
            message.error(err.response?.data?.error || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    // --- Task actions ---
    const onFinish = async (values) => {
        setLoading(true);
        try {
            const deadline = values.deadline.toISOString();
            const payload = { title: values.title, description: values.description, deadline };
            if (editingTask) {
                await axios.put(`http://localhost:3000/api/tasks/${editingTask.id}`, payload, {
                    headers: { 'X-User-ID': user.id }
                });
                message.success('Задача успешно обновлена!');
            } else {
                await axios.post('http://localhost:3000/api/tasks', payload, {
                    headers: { 'X-User-ID': user.id }
                });
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

    const completeTask = async (task) => {
        try {
            await axios.patch(`http://localhost:3000/api/tasks/${task.id}`, { completed: !task.completed }, {
                headers: { 'X-User-ID': user.id }
            });
            message.success(task.completed ? 'Задача возвращена в список' : 'Задача отмечена как выполненная');
            fetchTasks();
        } catch (error) {
            message.error('Ошибка при обновлении задачи');
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
            await axios.delete(`http://localhost:3000/api/tasks/${taskId}`, {
                headers: { 'X-User-ID': user.id }
            });
            message.success('Задача удалена');
            fetchTasks();
        } catch (error) {
            message.error('Ошибка при удалении задачи');
        }
    };

    // --- UI ---
    if (!user) {
        return showRegister ? (
            <Card title="Регистрация" style={{ maxWidth: 400, margin: '80px auto' }}>
                <Form layout="vertical" onFinish={onRegister}>
                    <Form.Item name="login" label="Логин" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="link" block onClick={() => setShowRegister(false)}>Войти</Button>
                    </Form.Item>
                </Form>
            </Card>
        ) : (
            <Card title="Вход" style={{ maxWidth: 400, margin: '100px auto' }}>
                <Form layout="vertical" onFinish={onLogin}>
                    <Form.Item name="login" label="Логин" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Войти
                        </Button>
                    </Form.Item>
                    <Form.Item>
                        <Button type="link" block onClick={() => setShowRegister(true)}>Зарегистрироваться</Button>
                    </Form.Item>
                </Form>
            </Card>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} style={{ background: '#fff' }}>
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
                    style={{ height: '100%', borderRight: 0 }}
                >
                    <Menu.Item key="list" icon={<UnorderedListOutlined />}>
                        Задачи
                    </Menu.Item>
                    <Menu.Item key="create" icon={<PlusOutlined />}>
                        {editingTask ? 'Редактировать задачу' : 'Создание задачи'}
                    </Menu.Item>
                    <Menu.Item key="completed" icon={<CheckCircleOutlined />}>Архив</Menu.Item>
                </Menu>
            </Sider>
            <Layout style={{ padding: '24px' }}>
                <Content style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                    {/* User Info */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16 }}>
                        <UserOutlined style={{ fontSize: 22, marginRight: 8 }} />
                        <span style={{ marginRight: 8 }}>
                            Вы вошли как: <b>{user.first_name} {user.last_name}</b> ({user.login})
                        </span>
                        <Button type="link" danger onClick={handleLogout}>Выйти</Button>
                    </div>

                    {activeTab === 'list' && (
                        <>
                            <h2>Список задач</h2>
                            <Collapse accordion>
                                {activeTasks.map((task) => {
                                    const deadline = dayjs(task.deadline);
                                    const created = dayjs(task.createdAt);
                                    const remaining = deadline.diff(dayjs(), 'day');
                                    return (
                                        <Panel
                                            key={task.id}
                                            header={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong>{task.title} (#{task.id})</strong>
                                                        <div style={{ fontSize: 12, color: 'gray' }}>
                                                            Создано: {created.format('DD.MM.YYYY HH:mm')}<br />
                                                            Дедлайн: {deadline.format('DD.MM.YYYY HH:mm')}<br />
                                                            Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Просрочено'}
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Tooltip title="Выполнить">
                                                            <Button
                                                                type="text"
                                                                icon={<CheckCircleOutlined style={{ fontSize: 20, color: 'green' }} />}
                                                                onClick={e => { e.stopPropagation(); completeTask(task); }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Редактировать">
                                                            <Button
                                                                type="text"
                                                                icon={<EditOutlined style={{ fontSize: 20 }} />}
                                                                onClick={e => { e.stopPropagation(); editTask(task); }}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Удалить задачу?"
                                                            onConfirm={() => handleDelete(task.id)}
                                                            okText="Да"
                                                            cancelText="Нет"
                                                        >
                                                            <Tooltip title="Удалить">
                                                                <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 20 }} />} />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            }
                                        >
                                            <p><strong>Описание:</strong><br />{task.description}</p>
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong>{task.title} (#{task.id})</strong>
                                                        <div style={{ fontSize: 12, color: 'gray' }}>
                                                            Создано: {created.format('DD.MM.YYYY HH:mm')}<br />
                                                            Дедлайн: {deadline.format('DD.MM.YYYY HH:mm')}<br />
                                                            Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Просрочено'}
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Tooltip title="Вернуть">
                                                            <Button
                                                                type="text"
                                                                icon={<RollbackOutlined style={{ fontSize: 20, color: 'orange' }} />}
                                                                onClick={e => { e.stopPropagation(); completeTask(task); }}
                                                            />
                                                        </Tooltip>
                                                        <Popconfirm
                                                            title="Удалить задачу?"
                                                            onConfirm={() => handleDelete(task.id)}
                                                            okText="Да"
                                                            cancelText="Нет"
                                                        >
                                                            <Tooltip title="Удалить">
                                                                <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 20 }} />} />
                                                            </Tooltip>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>
                                            }
                                        >
                                            <p><strong>Описание:</strong><br />{task.description}</p>
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
                                initialValues={{ title: '', description: '' }}
                            >
                                <Form.Item name="title" label="Название задачи" rules={[{ required: true, message: 'Введите название' }]}>
                                    <Input placeholder="Название" />
                                </Form.Item>
                                <Form.Item name="description" label="Описание задачи" rules={[{ required: true, message: 'Введите описание' }]}>
                                    <TextArea rows={4} placeholder="Описание" />
                                </Form.Item>
                                <Form.Item name="deadline" label="Дедлайн" rules={[{ required: true, message: 'Выберите дату' }]}>
                                    <DatePicker showTime format="DD.MM.YYYY HH:mm" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        {editingTask ? 'Обновить задачу' : 'Создать задачу'}
                                    </Button>
                                    {editingTask && (
                                        <Button
                                            style={{ marginLeft: 8 }}
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
