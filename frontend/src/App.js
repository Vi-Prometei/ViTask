import React, {useState, useEffect} from 'react';
import {Layout, Form, Input, Button, message, Collapse, Space, Tooltip, Popconfirm, Card} from 'antd';
import {
    RollbackOutlined, DeleteOutlined
} from '@ant-design/icons';

import YandexLogin from './pages/YandexLogin';
import YandexDiskApp from './pages/YandexDiskApp';
import TaskForm from './pages/TaskForm';
import TaskList from './pages/TaskList';
import UserInfo from './pages/UserInfo';
import Sidebar from './pages/Sidebar';


import axios from 'axios';
import dayjs from 'dayjs';

const {Content} = Layout;
const {Panel} = Collapse;

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

    // Yandex
    const [yaToken, setYaToken] = useState(localStorage.getItem('ya_disk_token') || null);

    // --- Fetch tasks ---
    const fetchTasks = async () => {
        if (!user) return;
        try {
            const response = await axios.get('/api/tasks', {
                headers: {'X-User-ID': user.id}
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            message.error('Ошибка при загрузке задач');
        }
    };

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    // --- User actions ---
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setActiveTab('list');
    };

    const onLogin = async (values) => {
        setLoading(true);
        try {
            const res = await axios.post('/api/users/login', {
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
            await axios.post('/api/users/register', {
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
            const payload = {title: values.title, description: values.description, deadline};
            if (editingTask) {
                await axios.put(`/api/tasks/${editingTask.id}`, payload, {
                    headers: {'X-User-ID': user.id}
                });
                message.success('Задача успешно обновлена!');
            } else {
                await axios.post('/api/tasks', payload, {
                    headers: {'X-User-ID': user.id}
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
            await axios.patch(`/api/tasks/${task.id}`, {completed: !task.completed}, {
                headers: {'X-User-ID': user.id}
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
            await axios.delete(`/api/tasks/${taskId}`, {
                headers: {'X-User-ID': user.id}
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
            <Card title="Регистрация" style={{maxWidth: 400, margin: '80px auto'}}>
                <Form layout="vertical" onFinish={onRegister}>
                    <Form.Item name="login" label="Логин" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{required: true}]}>
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item name="firstName" label="Имя" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="lastName" label="Фамилия" rules={[{required: true}]}>
                        <Input/>
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
            <Card title="Вход" style={{maxWidth: 400, margin: '100px auto'}}>
                <Form layout="vertical" onFinish={onLogin}>
                    <Form.Item name="login" label="Логин" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{required: true}]}>
                        <Input.Password/>
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
        <Layout style={{minHeight: '100vh'}}>
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setEditingTask={setEditingTask}
                form={form}
            />

            <Layout style={{padding: '24px'}}>
                <Content style={{background: '#fff', padding: 24, minHeight: 280}}>

                    {/* User Info */}
                    <UserInfo user={user} onLogout={handleLogout}/>


                    {activeTab === 'list' && (
                        <>
                            <h2>Список задач</h2>
                            <TaskList
                                tasks={activeTasks}
                                onComplete={completeTask}
                                onEdit={editTask}
                                onDelete={handleDelete}
                                completed={false}
                            />
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
                                                            Осталось: {remaining >= 0 ? `${remaining} дн.` : 'Потрачено'}
                                                        </div>
                                                    </div>
                                                    <Space>
                                                        <Tooltip title="Вернуть">
                                                            <Button
                                                                type="text"
                                                                icon={<RollbackOutlined
                                                                    style={{fontSize: 20, color: 'orange'}}/>}
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    completeTask(task);
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
                                                                <Button type="text" danger icon={<DeleteOutlined
                                                                    style={{fontSize: 20}}/>}/>
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
                            <TaskForm
                                form={form}
                                onFinish={onFinish}
                                editingTask={editingTask}
                                loading={loading}
                                onCancel={() => {
                                    setEditingTask(null);
                                    form.resetFields();
                                    setActiveTab('list');
                                }}
                            />
                        </>
                    )}

                    {/* Вкладка Яндекс.Диск */}
                    {activeTab === 'disk' && (
                        yaToken
                            ? <YandexDiskApp yaToken={yaToken} onLogout={() => setYaToken(null)}/>
                            : <YandexLogin setYandexToken={setYaToken}/>
                    )}

                </Content>
            </Layout>
        </Layout>
    );
}
