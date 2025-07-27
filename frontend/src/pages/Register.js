import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await api.post('/api/users/register', {
                login: values.login,
                password: values.password,
                first_name: values.firstName,
                last_name: values.lastName
            });
            message.success('Регистрация успешна! Войдите.');
            navigate('/login');
        } catch (err) {
            message.error(err.response?.data?.error || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Регистрация" style={{ maxWidth: 400, margin: '50px auto' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
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
            </Form>
        </Card>
    );
}