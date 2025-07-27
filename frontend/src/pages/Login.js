import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await api.post('/api/users/login', {
                login: values.login,
                password: values.password
            });
            localStorage.setItem('userID', res.data.user.id);
            message.success('Вход выполнен!');
            navigate('/tasks');
        } catch (err) {
            message.error(err.response?.data?.error || 'Ошибка входа');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Войти" style={{ maxWidth: 400, margin: '50px auto' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
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
            </Form>
        </Card>
    );
}